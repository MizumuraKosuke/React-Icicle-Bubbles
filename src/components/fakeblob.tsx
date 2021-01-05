import { useRef, useEffect, useMemo, forwardRef } from 'react'
import { useThree, useFrame, createPortal } from 'react-three-fiber'
import {
  FogExp2,
  RGBAFormat,
  HalfFloatType,
  NearestFilter,
  WebGLRenderTarget,
  ShaderMaterial,
  Uniform,
  Vector2,
  NoBlending,
  Scene,
  Camera,
  Color,
  Clock,
  ClampToEdgeWrapping,
} from 'three'
import glslify from 'glslify'

import Movement from './renderTarget/movement'
import Depth from './renderTarget/depth'
import Additive from './renderTarget/additive'
import Quad from './renderTarget/quad'
import Effect from './postprocessing'

import particlesVert from './../shader/particles.vert'
const particlesVertexShader = glslify(particlesVert)

import blurHFrag from './../shader/blurH.frag'
const blurHFragmentShader = glslify(blurHFrag)
import blurVFrag from './../shader/blurV.frag'
const blurVFragmentShader = glslify(blurVFrag)

const FakeBlobPage = (_props, ref) => {
  const { opts } = ref
  const { gl, scene, camera, size }: any = useThree()

  const clock = useMemo(() => new Clock(), [])

  const dt = useRef(0)
  const baseInset = useRef(opts.current.inset)
  const insetExtra = useRef(0)

  // scene
  const depthScene = useMemo(() => new Scene(), [])
  const additiveScene = useMemo(() => new Scene(), [])
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
      const renderTarget = new WebGLRenderTarget(
        opts.current.width,
        opts.current.height, {
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: HalfFloatType,
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
        type: HalfFloatType,
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
        type: HalfFloatType,
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
        type: HalfFloatType,
        stencilBuffer: false,
      })
      return renderTarget
    },
    [],
  )

  const composer = useRef<any>()
  const vignette = useRef<any>()

  // material
  const blurHMaterial = useRef<THREE.ShaderMaterial>(null)
  blurHMaterial.current = useMemo(
    () => new ShaderMaterial({
      uniforms: {
        tDiffuse : new Uniform(additiveRenderTarget.current.texture),
        uResolution : new Uniform(new Vector2()),
        uOffset : new Uniform(0),
        uBlurZ : new Uniform(opts.current.blurZ),
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
        uBlurZ : new Uniform(opts.current.blurZ),
      },
      vertexShader: particlesVertexShader,
      fragmentShader: blurVFragmentShader,
      transparent: true,
      blending: NoBlending,
    }),
    [],
  )

  const floorColor = new Color('#fff')
  useFrame(() => {
    dt.current = clock.getDelta() * 1000

    insetExtra.current += ((opts.current.speed ? 0 : 0.25) - insetExtra.current) * dt.current * (opts.current.speed ? 0.01 : 0.003)
    baseInset.current += (opts.current.inset - baseInset.current) * 0.05

    const tmpColor = floorColor
    tmpColor.lerp(new Color(opts.current.bgColor), 0.05)
    scene.fog.color.copy(tmpColor)
    gl.setClearColor(tmpColor.getHex())

    const clearColor = gl.getClearColor().getHex()
    const clearAlpha = gl.getClearAlpha()

    gl.autoClearColor = false

    if (opts.current.speed || opts.current.dieSpeed) {
      gl.setRenderTarget(movementRenderTarget.current)
      gl.render(movementScene, movementCamera)
      gl.setRenderTarget(null)
    }

    gl.setClearColor(0, 1)
    gl.setRenderTarget(depthRenderTarget.current)
    gl.clear()
    gl.render(depthScene, camera)
    gl.setRenderTarget(null)

    gl.setClearColor(0, 0)
    gl.setRenderTarget(additiveRenderTarget.current)
    gl.clear()
    gl.render(additiveScene, camera)
    gl.setRenderTarget(null)

    // const blurRadius = opts.current.blur

    // if (blurRadius) {
    //   blurHMaterial.current.uniforms.uOffset.value +=
    //     (blurRadius / width - blurHMaterial.current.uniforms.uOffset.value) * 0.05
    //   blurHMaterial.current.uniforms.uBlurZ.value +=
    //   (opts.current.blurZ - blurHMaterial.current.uniforms.uBlurZ.value) * 0.05
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
    //   (opts.current.blurZ - blurVMaterial.current.uniforms.uBlurZ.value) * 0.05
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

    blurHMaterial.current.uniforms.uResolution.value.set(w, h)
    blurVMaterial.current.uniforms.uResolution.value.set(w, h)
    gl.setViewport(0, 0, w, h)
  }, [ size ])

  useEffect(() => {
    gl.setClearColor(opts.current.bgColor)
    scene.fog = new FogExp2(opts.current.bgColor, 0.001)
    camera.position.set(300, 60, 300).normalize().multiplyScalar(500)
  }, [])

  const movementRef: any = {
    movementPrevRenderTarget,
    movementRenderTarget,
    dt,
    opts,
  }
  const depthRef: any = {
    movementPrevRenderTarget,
    movementRenderTarget,
    opts,
  }
  const additiveRef: any = {
    movementRenderTarget,
    depthRenderTarget,
    baseInset,
    insetExtra,
    opts,
  }
  const quadRef: any = {
    depthRenderTarget,
    additiveRenderTarget,
    baseInset,
    insetExtra,
    opts,
  }
  const effectRef: any = {
    composer,
    vignette,
    opts,
  }

  return (
    <>
      {createPortal(
        <Movement
          ref={movementRef}
        />,
        movementScene,
      )}
      {createPortal(
        <Depth
          ref={depthRef}
        />,
        depthScene,
      )}
      {createPortal(
        <Additive
          ref={additiveRef}
        />,
        additiveScene,
      )}
      {createPortal(
        <Quad
          ref={quadRef}
        />,
        quadScene,
      )}
      <Effect
        ref={effectRef}
      />
    </>
  )
}

export default forwardRef(FakeBlobPage)