import { useRef, useEffect, useMemo, forwardRef } from 'react'
import { useThree, useFrame, createPortal } from 'react-three-fiber'
import {
  FogExp2,
  RGBAFormat,
  HalfFloatType,
  NearestFilter,
  WebGLRenderTarget,
  Scene,
  Color,
  Clock,
  ClampToEdgeWrapping,
} from 'three'

import Movement from './renderTarget/movement'
import Depth from './renderTarget/depth'
import Additive from './renderTarget/additive'
import BlurH from './renderTarget/blurH'
import BlurV from './renderTarget/blurV'
import Quad from './renderTarget/quad'
import Effect from './postprocessing'

const FakeBlobPage = (_props, ref) => {
  const { opts } = ref
  const { gl, scene, camera, size }: any = useThree()
  const clock = useMemo(() => new Clock(), [])
  const dt = useRef(0)

  // scene
  const depthScene = useMemo(() => new Scene(), [])
  const additiveScene = useMemo(() => new Scene(), [])
  const quadScene = useMemo(() => new Scene(), [])
  const blurScene = useMemo(() => new Scene(), [])
  const movementScene = useMemo(() => new Scene(), [])

  // camera
  const quadCamera = useRef<THREE.OrthographicCamera>()
  const movementCamera = useRef<THREE.OrthographicCamera>()

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

  const floorColor = new Color('#fff')
  useFrame(() => {
    dt.current = clock.getDelta() * 1000

    const tmpColor = floorColor
    tmpColor.lerp(new Color(opts.current.bgColor), 0.05)
    scene.fog.color.copy(tmpColor)
    gl.setClearColor(tmpColor.getHex())

    const clearColor = gl.getClearColor().getHex()
    const clearAlpha = gl.getClearAlpha()

    gl.autoClearColor = false

    if (opts.current.speed || opts.current.dieSpeed) {
      gl.setRenderTarget(movementRenderTarget.current)
      gl.render(movementScene, movementCamera.current)
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

    const blurRadius = opts.current.blur
    if (blurRadius) {
      gl.setRenderTarget(blurRenderTarget.current)
      gl.clear()
      gl.render(blurScene, quadCamera.current)
      gl.setRenderTarget(null)

      gl.setRenderTarget(additiveRenderTarget.current)
      gl.clear()
      gl.render(blurScene, quadCamera.current)
      gl.setRenderTarget(null)
    }

    gl.setClearColor(clearColor, clearAlpha)
    gl.autoClearColor = true

    gl.render(scene, camera)

    gl.autoClearColor = false
    gl.render(quadScene, quadCamera.current)

    gl.autoClearColor = true
  }, 1)

  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight

    depthRenderTarget.current.setSize(w, h)
    additiveRenderTarget.current.setSize(w, h)
    blurRenderTarget.current.setSize(w, h)
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
    opts,
  }
  const blurHRef: any = {
    additiveRenderTarget,
    opts,
  }
  const blurVRef: any = {
    blurRenderTarget,
    opts,
  }
  const quadRef: any = {
    depthRenderTarget,
    additiveRenderTarget,
    opts,
  }
  const effectRef: any = {
    composer,
    vignette,
    opts,
  }

  return (
    <>
      <orthographicCamera ref={movementCamera} position-z={1} />
      {createPortal(
        <Movement ref={movementRef} />,
        movementScene,
      )}
      {createPortal(
        <Depth ref={depthRef} />,
        depthScene,
      )}
      {createPortal(
        <Additive ref={additiveRef} />,
        additiveScene,
      )}
      {createPortal(
        <>
          <BlurH ref={blurHRef} />
          <BlurV ref={blurVRef} />
        </>,
        blurScene,
      )}
      <orthographicCamera ref={quadCamera} position-z={1} />
      {createPortal(
        <Quad ref={quadRef} />,
        quadScene,
      )}
      <Effect
        ref={effectRef}
      />
    </>
  )
}

export default forwardRef(FakeBlobPage)