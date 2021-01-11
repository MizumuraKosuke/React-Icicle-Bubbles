import { useRef, useMemo, forwardRef } from 'react'
import { useThree, useFrame } from 'react-three-fiber'
import { isMobile } from 'react-device-detect'
import {
  Uniform,
  Vector2,
  Vector3,
  RGBAFormat,
  FloatType,
  NearestFilter,
  DataTexture,
  NoBlending,
  Ray,
  Clock,
} from 'three'
import glslify from 'glslify'
import { useMove, useDrag } from 'react-use-gesture'
import { useSpring, animated } from '../../../node_modules/react-spring/three'

import vert from '../../shader/default.vert'
import frag from '../../shader/position.frag'

const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

interface Props {
  opts: any
}

const Move = ({ opts }: Props, { movementPrevRenderTarget, movementRenderTarget }: any) => {
  const material = useRef<THREE.ShaderMaterial>(null)

  const { gl, camera } = useThree()

  const rawShaderPrefix = 'precision ' + gl.capabilities.precision + ' float;\n'

  const ray = useMemo(() => new Ray(), [])
  const clock = useMemo(() => new Clock(), [])

  const [
    {
      mouseX,
      mouseY,
      deltaDistance,
    }, setMouse,
  ] = useSpring(() => ({
    mouseX: 0,
    mouseY: 0,
    deltaDistance: 1,
    // config: { mass: 10, tension: 400, friction: 50 },
  }))

  if (isMobile) {
    useDrag(
      ({ xy: [ x, y ], delta: [ dx, dy ] }) => {
        setMouse({
        mouseX: (2 * x - window.innerWidth) / window.innerWidth,
        mouseY: -(2 * y - window.innerHeight) / window.innerHeight,
        deltaDistance: Math.sqrt(dx * dx + dy * dy) / 10,
      })},
      { domTarget: typeof window !== 'undefined' ? window : null },
    )
  } else {
    useMove(
      ({ xy: [ x, y ], delta: [ dx, dy ] }) => {
        setMouse({
        mouseX: (2 * x - window.innerWidth) / window.innerWidth,
        mouseY: -(2 * y - window.innerHeight) / window.innerHeight,
        deltaDistance: Math.sqrt(dx * dx + dy * dy) / 10,
      })},
      { domTarget: typeof window !== 'undefined' ? window : null },
    )
  }

  const uniforms = useMemo(() => {
    const positions = new Float32Array(opts.amount * 4)

    for(let i = 0; i < opts.amount; i++) {
      const i4 = i * 4
      const r = (0.5 + Math.random() * 0.5) * 75
      const phi = (Math.random() - 0.5) * Math.PI
      const theta = Math.random() * Math.PI * 2
      positions[i4 + 0] = r * Math.cos(theta) * Math.cos(phi)
      positions[i4 + 1] = r * Math.sin(phi)
      positions[i4 + 2] = r * Math.sin(theta) * Math.cos(phi)
      positions[i4 + 3] = Math.random()
    }
    const texture = new DataTexture(
      positions, opts.width, opts.height, RGBAFormat, FloatType,
    )
    texture.minFilter = NearestFilter
    texture.magFilter = NearestFilter
    texture.needsUpdate = true
    texture.generateMipmaps = false
    texture.flipY = false
  
    return {
      resolution: new Uniform(new Vector2(opts.width, opts.height)),
      texturePosition: new Uniform(texture),
      textureDefaultPosition: new Uniform(texture),
      mouse3d: new Uniform(new Vector3()),
      speed: new Uniform(0),
      dieSpeed: new Uniform(0),
      deltaDistance: new Uniform(1),
      radius: new Uniform(opts.radius),
      attraction: new Uniform(0),
      time: new Uniform(0),
      initAnimation: new Uniform(0),
      curlSize: new Uniform(opts.curlSize),
    }
  }, [])

  useFrame(() => {
    if (!opts.speed && !opts.dieSpeed || !opts.toggleMovement) {
      return
    }

    const dt = clock.getDelta() * 1000
    const deltaRatio = dt / 16.6667

    const tmp = movementPrevRenderTarget.current.clone()
    movementPrevRenderTarget.current = movementRenderTarget.current
    movementRenderTarget.current = tmp
  
    material.current.uniforms.texturePosition.value =
    movementPrevRenderTarget.current.texture
    material.current.uniforms.time.value += dt * opts.speed * 0.001
    material.current.uniforms.dieSpeed.value = opts.dieSpeed * deltaRatio
    material.current.uniforms.attraction.value = opts.attraction * opts.speed * deltaRatio
    material.current.uniforms.speed.value = opts.speed * deltaRatio
    material.current.uniforms.initAnimation.value = Math.min(
      material.current.uniforms.initAnimation.value + dt * 0.00025, 1,
    )

    ray.origin.setFromMatrixPosition(camera.matrixWorld)
    ray.direction.set(
      mouseX.value, mouseY.value, 0.5 ).unproject(camera).sub(ray.origin).normalize()
    const distance = ray.origin.length() / Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
    ray.origin.add(ray.direction.multiplyScalar(distance * 1.0))
    material.current.uniforms.mouse3d.value.copy(ray.origin)
  })

  return (
    <mesh>
      <planeBufferGeometry args={[ 2, 2 ]} />
      <animated.rawShaderMaterial
        ref={material}
        uniforms={uniforms}
        uniforms-deltaDistance-value={deltaDistance}
        uniforms-radius-value={opts.radius}
        uniforms-curlSize-value={opts.curlSize}
        vertexShader={rawShaderPrefix + vertexShader}
        fragmentShader={rawShaderPrefix + fragmentShader}
        blending={NoBlending}
        transparent={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

export default forwardRef(Move)
