import { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame, createPortal } from 'react-three-fiber'
import {
  FogExp2,
  RGBAFormat,
  HalfFloatType,
  NearestFilter,
  WebGLRenderTarget,
  Scene,
  Color,
  ClampToEdgeWrapping,
} from 'three'
import FBOHelper from 'three.fbo-helper'

import Movement from './renderTarget/movement'
import Depth from './renderTarget/depth'
import Additive from './renderTarget/additive'
import BlurH from './renderTarget/blurH'
import BlurV from './renderTarget/blurV'
import Quad from './renderTarget/quad'
import Screen from './renderTarget/screen'
import Floor from './floor'
import Effect from './postprocessing'

interface Props {
  opts: any
}

const FakeBlobPage = ({ opts }: Props) => {
  const { gl, scene, camera, size }: any = useThree()

  // scene
  const depthScene = useMemo(() => new Scene(), [])
  const additiveScene = useMemo(() => new Scene(), [])
  const quadScene = useMemo(() => new Scene(), [])
  const blurScene = useMemo(() => new Scene(), [])
  const movementScene = useMemo(() => new Scene(), [])
  const screenScene = useRef<THREE.Scene>()
  screenScene.current = useMemo(() => new Scene(), [])

  // camera
  const quadCamera = useRef<THREE.OrthographicCamera>()
  const movementCamera = useRef<THREE.OrthographicCamera>()
  const screenCamera = useRef<THREE.OrthographicCamera>()

  const fbohelper = useMemo(() => new FBOHelper(gl), [])

  // render target
  const movementRenderTarget = useRef<THREE.WebGLRenderTarget>(null)
  const movementPrevRenderTarget = useRef<THREE.WebGLRenderTarget>(null)
  movementRenderTarget.current = useMemo(
    () => {
      const renderTarget = new WebGLRenderTarget(
        opts.width,
        opts.height, {
        wrapS: ClampToEdgeWrapping,
        wrapT: ClampToEdgeWrapping,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: HalfFloatType,
        depthBuffer: false,
        stencilBuffer: false,
      })
      fbohelper.attach(renderTarget, 'movement')
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
      fbohelper.attach(renderTarget, 'depth')
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
      fbohelper.attach(renderTarget, 'additive')
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
      fbohelper.attach(renderTarget, 'blur')
      return renderTarget
    },
    [],
  )

  const screenRenderTarget = useRef<THREE.WebGLRenderTarget>(null)
  screenRenderTarget.current = useMemo(
    () => {
      const renderTarget = new WebGLRenderTarget(1, 1, {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: HalfFloatType,
        stencilBuffer: false,
      })
      fbohelper.attach(renderTarget, 'screen')
      return renderTarget
    },
    [],
  )

  useFrame(() => {
    const tmpColor = opts.floorColor
    tmpColor.lerp(new Color(opts.bgColor), 0.05)
    scene.fog.color.copy(tmpColor)
    gl.setClearColor(tmpColor.getHex())

    const clearColor = gl.getClearColor().getHex()
    const clearAlpha = gl.getClearAlpha()

    gl.autoClearColor = false

    if (opts.speed || opts.dieSpeed) {
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

    const blurRadius = opts.blur
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

    gl.setRenderTarget(screenRenderTarget.current)
    gl.clear()
    gl.setClearColor(clearColor, clearAlpha)
    gl.autoClearColor = true
    gl.render(scene, camera)
    gl.autoClearColor = false
    gl.render(quadScene, quadCamera.current)
    gl.setRenderTarget(null)

    gl.render(screenScene.current, screenCamera.current)

    fbohelper.update()
  }, 1)

  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight

    depthRenderTarget.current.setSize(w, h)
    additiveRenderTarget.current.setSize(w, h)
    blurRenderTarget.current.setSize(w, h)
    screenRenderTarget.current.setSize(w, h)
    fbohelper.setSize(w, h)
  }, [ size ])

  useEffect(() => {
    scene.fog = new FogExp2(opts.bgColor, 0.001)
    camera.position.set(300, 60, 300).normalize().multiplyScalar(500)
  }, [])

  const movementRef: any = {
    movementPrevRenderTarget,
    movementRenderTarget,
  }
  const depthRef: any = {
    movementPrevRenderTarget,
    movementRenderTarget,
  }
  const additiveRef: any = {
    movementRenderTarget,
    depthRenderTarget,
  }
  const blurHRef: any = {
    additiveRenderTarget,
  }
  const blurVRef: any = {
    blurRenderTarget,
  }
  const quadRef: any = {
    depthRenderTarget,
    additiveRenderTarget,
  }
  const screenRef: any = {
    renderTarget: screenRenderTarget,
  }
  const effectRef: any = { screenScene, screenCamera }

  return (
    <>
      <orthographicCamera ref={movementCamera} position-z={1} />
      {createPortal(
        <Movement ref={movementRef} opts={opts} />,
        movementScene,
      )}
      {createPortal(
        <Depth ref={depthRef} opts={opts} />,
        depthScene,
      )}
      {createPortal(
        <Additive ref={additiveRef} opts={opts} />,
        additiveScene,
      )}
      {createPortal(
        <>
          <BlurH ref={blurHRef} opts={opts} />
          <BlurV ref={blurVRef} opts={opts} />
        </>,
        blurScene,
      )}
      <orthographicCamera ref={quadCamera} position-z={1} />
      {createPortal(
        <Quad ref={quadRef} opts={opts} />,
        quadScene,
      )}
      <orthographicCamera ref={screenCamera} position-z={1} />
      {createPortal(
        <Screen ref={screenRef} />,
        screenScene.current,
      )}
      <Floor color={opts.floorColor} />
      <Effect ref={effectRef} opts={opts} />
    </>
  )
}

export default FakeBlobPage