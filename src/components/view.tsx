import { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame, createPortal } from 'react-three-fiber'
import {
  FogExp2,
  RGBAFormat,
  FloatType,
  NearestFilter,
  WebGLRenderTarget,
  ShaderMaterial,
  Uniform,
  Matrix4,
  Vector2,
  NoBlending,
  CustomBlending,
  AddEquation,
  OneFactor,
  Scene,
  Camera,
  TextureLoader,
  Color,
  // Ray,
  ClampToEdgeWrapping,
} from 'three'
import glslify from 'glslify'

import Movement from './movement'
import Points from './particles/points'
import Quad from './particles/quad'
import Floor from './floor'
import Effect from './postprocessing'

import particlesVert from './../shader/particles.vert'
import particlesFrag from './../shader/particles.frag'
const particlesVertexShader = glslify(particlesVert)
const particlesFragmentShader = glslify(particlesFrag)

import depthVert from './../shader/depth.vert'
import depthFrag from './../shader/depth.frag'
const depthVertexShader = glslify(depthVert)
const depthFragmentShader = glslify(depthFrag)

import additiveVert from './../shader/additive.vert'
import additiveFrag from './../shader/additive.frag'
const additiveVertexShader = glslify(additiveVert)
const additiveFragmentShader = glslify(additiveFrag)

import blurHFrag from './../shader/blurH.frag'
const blurHFragmentShader = glslify(blurHFrag)
import blurVFrag from './../shader/blurV.frag'
const blurVFragmentShader = glslify(blurVFrag)

interface Props {
  opts: any,
  width: number,
  height: number
}

const FakeBlobPage = ({ opts, width, height }: Props) => {
  const { gl, scene, camera, size }: any = useThree()

  // scene
  const particlesScene = useMemo(() => new Scene(), [])
  const particlesScene2 = useMemo(() => new Scene(), [])
  const quadScene = useMemo(() => new Scene(), [])
  const movementScene = useMemo(() => new Scene(), [])

  // camera
  const quadCamera = useMemo(() => {
    const qcamera = new Camera()
    qcamera.position.z = 1
    return qcamera
  }, [])
  const movementCamera = useMemo(() => {
    const mcamera = new Camera()
    mcamera.position.z = 1
    return mcamera
  }, [])

  // render target
  const movementRenderTarget = useRef<THREE.WebGLRenderTarget>(null)
  const movementPrevRenderTarget = useRef<THREE.WebGLRenderTarget>(null)
  movementRenderTarget.current = useMemo(
    () => {
      const renderTarget = new WebGLRenderTarget(width, height, {
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
        depthBuffer: false,
        stencilBuffer: false,
      })
      movementPrevRenderTarget.current = renderTarget.clone()
      return renderTarget
    },
    [],
  )
  const depthRenderTarget = useRef<THREE.WebGLRenderTarget>(null)
  depthRenderTarget.current = useMemo(
    () => {
      const renderTarget = new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
        stencilBuffer: false,
      })
      return renderTarget
    },
    [],
  )
  const additiveRenderTarget = useRef<THREE.WebGLRenderTarget>(null)
  additiveRenderTarget.current = useMemo(
    () => {
      const renderTarget = new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
        depthBuffer: false,
        stencilBuffer: false,
      })
      return renderTarget
    },
    [],
  )
  const blurRenderTarget = useRef<THREE.WebGLRenderTarget>(null)
  blurRenderTarget.current = useMemo(
    () => {
      const renderTarget = new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
        stencilBuffer: false,
      })
      return renderTarget
    },
    [],
  )

  const composer = useRef<any>()
  const vignette = useRef<any>()
  const points = useRef<THREE.Points>(null)

  const tex = useMemo(
    () => {
      let src = '/images/matcap.jpg'
      if (opts.matcap === 'metal') {
        src = '/images/matcap_metal.jpg'
      }
      else if (opts.matcap === 'plastic') {
        src = '/images/matcap_plastic.jpg'
      }
      const sphereTexture = new TextureLoader().load(src, (texture) => {
        texture.anisotropy = gl.capabilities.getMaxAnisotropy()
        texture.flipY = false
        texture.needsUpdate = true
      })
      return sphereTexture
    },
    [ opts.matcap ],
  )

  // material
  const particlesMaterial = useRef<THREE.ShaderMaterial>(null)
  particlesMaterial.current = useMemo(
    () => new ShaderMaterial({
      uniforms: {
        uInset: new Uniform(0),
        uWashout: new Uniform(0),
        uDepth : new Uniform(depthRenderTarget.current.texture),
        uAdditive : new Uniform(additiveRenderTarget.current.texture),
        uSphereMap : new Uniform(tex),
        uResolution: new Uniform(new Vector2()),
        uFogColor: new Uniform(new Color()),
      },
      vertexShader: particlesVertexShader,
      fragmentShader: particlesFragmentShader,
      transparent: true,
      depthWrite: false,
    }),
    [ tex ],
  )

  const depthMaterial = useRef<THREE.ShaderMaterial>(null)
  depthMaterial.current = useMemo(
    () => new ShaderMaterial({
      uniforms: {
        uParticleSize : new Uniform(opts.particleSize),
        uTexturePosition: new Uniform(movementRenderTarget.current.texture),
        uTexturePrevPosition: new Uniform(null),
        uCameraPosition: new Uniform(camera.position),
        uPrevModelViewMatrix: new Uniform(new Matrix4()),
        uMotionMultiplier: new Uniform(1),
      },
      vertexShader: depthVertexShader,
      fragmentShader: depthFragmentShader,
      blending: NoBlending,
    }),
    [ opts.particleSize, camera ],
  )

  const additiveMaterial = useRef<THREE.ShaderMaterial>(null)
  additiveMaterial.current = useMemo(
    () => new ShaderMaterial({
      uniforms: {
        uParticleSize : new Uniform(opts.particleSize),
        uTexturePosition: new Uniform(movementRenderTarget.current.texture),
        uCameraPosition: new Uniform(camera.position),
        uDepth: new Uniform(depthRenderTarget.current.texture),
        uInset: new Uniform(0),
        uResolution: new Uniform(new Vector2()),
      },
      vertexShader: additiveVertexShader,
      fragmentShader: additiveFragmentShader,

      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: OneFactor,
      blendDst: OneFactor ,
      blendEquationAlpha: AddEquation,
      blendSrcAlpha: OneFactor,
      blendDstAlpha: OneFactor,
      transparent: true,
    }),
    [ opts.particleSize, camera ],
  )

  const blurHMaterial = useRef<THREE.ShaderMaterial>(null)
  blurHMaterial.current = useMemo(
    () => new ShaderMaterial({
      uniforms: {
        tDiffuse : new Uniform(additiveRenderTarget.current.texture),
        uResolution : new Uniform(new Vector2()),
        uOffset : new Uniform(0),
        uBlurZ : new Uniform(opts.blurZ),
      },
      vertexShader: particlesVertexShader,
      fragmentShader: blurHFragmentShader,
      transparent: true,
      blending: NoBlending,
    }),
    [],
  )
  const blurVMaterial = useRef<THREE.ShaderMaterial>(null)
  blurVMaterial.current = useMemo(
    () => new ShaderMaterial({
      uniforms: {
        tDiffuse : new Uniform(blurRenderTarget.current.texture),
        uResolution : new Uniform(new Vector2()),
        uOffset : new Uniform(0),
        uBlurZ : new Uniform(opts.blurZ),
      },
      vertexShader: particlesVertexShader,
      fragmentShader: blurVFragmentShader,
      transparent: true,
      blending: NoBlending,
    }),
    [],
  )

  const movementMaterial = useRef<THREE.ShaderMaterial>(null)
  const quadMaterial = useRef<THREE.ShaderMaterial>(particlesMaterial.current)
  const pointsMaterial = useRef<THREE.ShaderMaterial>(depthMaterial.current)
  const pointsMaterial2 = useRef<THREE.ShaderMaterial>(additiveMaterial.current)

  // const ray = useMemo(() => new Ray(), [])

  let baseInset = opts.inset
  let insetExtra = 0

  const floorColor = new Color('#fff')
  useFrame(({ clock }) => {
    const tmpColor = floorColor
    tmpColor.lerp(new Color(opts.bgColor), 0.05)
    if (quadMaterial.current) {
      quadMaterial.current.uniforms.uFogColor.value.copy(tmpColor)
    }
    scene.fog.color.copy(tmpColor)
    gl.setClearColor(tmpColor.getHex())

    const clearColor = gl.getClearColor().getHex()
    const clearAlpha = gl.getClearAlpha()
  
    const dt = clock.getDelta() * 100000

    gl.autoClearColor = false

    if (opts.speed || opts.dieSpeed) {
      const deltaRatio = dt / 16.6667

      const tmp = movementPrevRenderTarget.current.clone()
      movementPrevRenderTarget.current = movementRenderTarget.current
      movementRenderTarget.current = tmp

      movementMaterial.current.uniforms.texturePosition.value =
      movementPrevRenderTarget.current.texture
      movementMaterial.current.uniforms.time.value += dt * opts.speed * 0.001
      movementMaterial.current.uniforms.dieSpeed.value = opts.dieSpeed * deltaRatio
      movementMaterial.current.uniforms.attraction.value = opts.attraction * opts.speed * deltaRatio
      movementMaterial.current.uniforms.speed.value = opts.speed * deltaRatio
      movementMaterial.current.uniforms.initAnimation.value = Math.min(
        movementMaterial.current.uniforms.initAnimation.value + dt * 0.00025, 1,
      )

      // camera.updateMatrixWorld()
      // ray.origin.setFromMatrixPosition(camera.matrixWorld)
      // ray.direction.set(
      //   mouseX, mouseY, 0.5 ).unproject(camera).sub(ray.origin).normalize()
      // const distance = ray.origin.length() / Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
      // ray.origin.add( ray.direction.multiplyScalar(distance * 1.0))
      // movementMaterial.current.uniforms.mouse3d.value.copy(ray.origin)

      gl.setRenderTarget(movementRenderTarget.current)
      gl.render(movementScene, movementCamera)
      gl.setRenderTarget(null)
    }

    gl.setClearColor(0, 1)
    depthMaterial.current.uniforms.uTexturePrevPosition.value =
    movementPrevRenderTarget.current.texture
    depthMaterial.current.uniforms.uTexturePosition.value = movementRenderTarget.current.texture
    depthMaterial.current.uniforms.uParticleSize.value = opts.particleSize
    depthMaterial.current.uniforms.uCameraPosition.value = camera.position
    gl.setRenderTarget(depthRenderTarget.current)
    gl.clear()
    gl.render(particlesScene, camera)
    gl.setRenderTarget(null)

    const skipMatrixUpdate = !(opts.dieSpeed || opts.speed) && opts.motionBlur
    if(!skipMatrixUpdate) {
      depthMaterial.current.uniforms.uPrevModelViewMatrix.value.copy(points.current.modelViewMatrix)
    }

    insetExtra += ((opts.speed ? 0 : 0.25) - insetExtra) * dt * (opts.speed ? 0.01 : 0.003)
    baseInset += (opts.inset - baseInset) * 0.05

    gl.setClearColor(0, 0)
    additiveMaterial.current.uniforms.uInset.value = baseInset + insetExtra
    additiveMaterial.current.uniforms.uParticleSize.value = opts.particleSize
    additiveMaterial.current.uniforms.uTexturePosition.value = movementRenderTarget.current.texture
    additiveMaterial.current.uniforms.uDepth.value = depthRenderTarget.current.texture
    additiveMaterial.current.uniforms.uCameraPosition.value = camera.position
    gl.setRenderTarget(additiveRenderTarget.current)
    gl.clear()
    gl.render(particlesScene2, camera)
    gl.setRenderTarget(null)

    // const blurRadius = opts.blur

    // if (blurRadius) {
    //   blurHMaterial.current.uniforms.uOffset.value +=
    //     (blurRadius / width - blurHMaterial.current.uniforms.uOffset.value) * 0.05
    //   blurHMaterial.current.uniforms.uBlurZ.value +=
    //   (opts.blurZ - blurHMaterial.current.uniforms.uBlurZ.value) * 0.05
    //   blurHMaterial.current.uniforms.tDiffuse.value = additiveRenderTarget.current.texture

    //   // gl.clearTarget(blurRenderTarget.current, true, true, true)
    //   if (quadMaterial.current) {
    //     quadMaterial.current.dispose()
    //   }
    //   quadMaterial.current = blurHMaterial.current
    //   // gl.render(quadScene, quadCamera, blurRenderTarget.current)
    //   gl.setRenderTarget(blurRenderTarget.current)
    //   gl.clear()
    //   gl.render(quadScene, quadCamera)
    //   gl.setRenderTarget(null)

    //   blurVMaterial.current.uniforms.uOffset.value +=
    //   (blurRadius / height - blurVMaterial.current.uniforms.uOffset.value) * 0.05
    //   blurVMaterial.current.uniforms.uBlurZ.value +=
    //   (opts.blurZ - blurVMaterial.current.uniforms.uBlurZ.value) * 0.05
    //   blurVMaterial.current.uniforms.tDiffuse.value = blurRenderTarget.current.texture

    //   // gl.clearTarget(additiveRenderTarget.current, true, true, true)
    //   quadMaterial.current.dispose()
    //   quadMaterial.current = blurVMaterial.current
    //   // gl.render(quadScene, quadCamera, additiveRenderTarget.current)
    //   gl.setRenderTarget(additiveRenderTarget.current)
    //   gl.clear()
    //   gl.render(quadScene, quadCamera)
    //   gl.setRenderTarget(null)
    // }

    // particlesMaterial.current.uniforms.uSphereMap.value = tex
    particlesMaterial.current.uniforms.uInset.value = additiveMaterial.current.uniforms.uInset.value
    particlesMaterial.current.uniforms.uWashout.value +=
    (opts.washout - particlesMaterial.current.uniforms.uWashout.value) * 0.05
    particlesMaterial.current.uniforms.uDepth.value = depthRenderTarget.current.texture
    particlesMaterial.current.uniforms.uAdditive.value = additiveRenderTarget.current.texture

    gl.setClearColor(clearColor, clearAlpha)
    gl.autoClearColor = true

    gl.render(scene, camera)

    gl.autoClearColor = false
    gl.render(quadScene, quadCamera)

    gl.autoClearColor = true
  }, 1)

  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight

    camera.aspect = w / h
    camera.updateProjectionMatrix()
    gl.setSize(w, h)

    depthRenderTarget.current.setSize(w, h)
    additiveRenderTarget.current.setSize(w, h)
    blurRenderTarget.current.setSize(w, h)

    particlesMaterial.current.uniforms.uResolution.value.set(w, h)
    additiveMaterial.current.uniforms.uResolution.value.set(w, h)
    blurHMaterial.current.uniforms.uResolution.value.set(w, h)
    blurVMaterial.current.uniforms.uResolution.value.set(w, h)
    gl.setViewport(0, 0, w, h)
  }, [ size ])

  useEffect(() => {
    gl.setClearColor(opts.bgColor)
    scene.fog = new FogExp2(opts.bgColor, 0.001)
    camera.position.set(300, 60, 300).normalize().multiplyScalar(500)
  }, [])

  const movementRef: any = {
    material: movementMaterial,
  }
  const pointsRef: any = {
    points,
    material: pointsMaterial,
  }
  const pointsRef2: any = {
    points,
    material: pointsMaterial2,
  }
  const quadRef: any = {
    material: quadMaterial,
  }
  const effectRef: any = {
    composer,
    vignette,
  }

  return (
    <>
      <Floor color={floorColor} />
      {createPortal(
        <Movement
          ref={movementRef}
          width={width}
          height={height}
          opts={opts}
        />,
        movementScene,
      )}
      {createPortal(
        <Points
          ref={pointsRef}
          width={width}
          height={height}
        />,
        particlesScene,
      )}
      {createPortal(
        <Points
          ref={pointsRef2}
          width={width}
          height={height}
        />,
        particlesScene2,
      )}
      {createPortal(
        <Quad
          ref={quadRef}
        />,
        quadScene,
      )}
      <Effect
        ref={effectRef}
        opts={opts}
      />
      <group position-y={500}>
        <ambientLight color="#333" />
        <pointLight intensity={1} distance={800} color={opts.bgColor} />
      </group>
    </>
  )
}

export default FakeBlobPage