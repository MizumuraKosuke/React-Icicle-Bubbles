import { useRef, useMemo, useEffect, forwardRef } from 'react'
import { useThree, useFrame } from 'react-three-fiber'
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
} from 'three'
import glslify from 'glslify'
import { useMove } from 'react-use-gesture'
import { useSpring, animated } from '../../../node_modules/react-spring/three'

import vert from '../../shader/default.vert'
import frag from '../../shader/position.frag'

const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

const Move = (_props, ref) => {
  const {
    movementPrevRenderTarget,
    movementRenderTarget,
    dt,
    opts,
  } = ref
  const material = useRef<THREE.ShaderMaterial>(null)

  const { gl, camera } = useThree()

  const rawShaderPrefix = 'precision ' + gl.capabilities.precision + ' float;\n'

  const ray = useMemo(() => new Ray(), [])

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
    config: { mass: 10, tension: 400, friction: 50 },
  }))
  const bind: any = useMove(
    ({ xy: [ x, y ], distance }) => setMouse({
      mouseX: x / opts.current.width * 2 - 1,
      mouseY: y / opts.current.height * 2 + 1,
      deltaDistance: distance / 10,
    }),
    { domTarget: typeof window !== 'undefined' ? window : null },
  )
  useEffect(bind, [ bind ])

  const uniforms = useMemo(() => {
    const positions = new Float32Array(opts.current.amount * 4)

    for(let i = 0; i < opts.current.amount; i++) {
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
      positions, opts.current.width, opts.current.height, RGBAFormat, FloatType,
    )
    texture.minFilter = NearestFilter
    texture.magFilter = NearestFilter
    texture.needsUpdate = true
    texture.generateMipmaps = false
    texture.flipY = false
  
    return {
      resolution: new Uniform(new Vector2(opts.current.width, opts.current.height)),
      texturePosition: new Uniform(texture),
      textureDefaultPosition: new Uniform(texture),
      mouse3d: new Uniform(new Vector3()),
      speed: new Uniform(0),
      dieSpeed: new Uniform(0),
      deltaDistance: new Uniform(1),
      radius: new Uniform(opts.current.radius),
      attraction: new Uniform(0),
      time: new Uniform(0),
      initAnimation: new Uniform(0),
      curlSize: new Uniform(opts.current.curlSize),
    }
  }, [])

  useFrame(() => {
    if (!opts.current.speed && !opts.current.dieSpeed || !opts.current.toggleMovement) {
      return
    }

    const deltaRatio = dt.current / 16.6667

    const tmp = movementPrevRenderTarget.current.clone()
    movementPrevRenderTarget.current = movementRenderTarget.current
    movementRenderTarget.current = tmp
  
    material.current.uniforms.texturePosition.value =
    movementPrevRenderTarget.current.texture
    material.current.uniforms.time.value += dt.current * opts.current.speed * 0.001
    material.current.uniforms.dieSpeed.value = opts.current.dieSpeed * deltaRatio
    material.current.uniforms.attraction.value = opts.current.attraction * opts.current.speed * deltaRatio
    material.current.uniforms.speed.value = opts.current.speed * deltaRatio
    material.current.uniforms.initAnimation.value = Math.min(
      material.current.uniforms.initAnimation.value + dt.current * 0.00025, 1,
    )

    camera.updateMatrixWorld()
    ray.origin.setFromMatrixPosition(camera.matrixWorld)
    ray.direction.set(
      mouseX.value, mouseY.value, 0.5 ).unproject(camera).sub(ray.origin).normalize()
    const distance = ray.origin.length() / Math.cos(Math.PI - ray.direction.angleTo(ray.origin))
    ray.origin.add( ray.direction.multiplyScalar(distance * 1.0))
    // material.current.uniforms.mouse3d.value.copy(ray.origin)
  })

  return (
    <mesh>
      <planeBufferGeometry args={[ 2, 2 ]} />
      <animated.rawShaderMaterial
        ref={material}
        uniforms={uniforms}
        uniforms-deltaDistance-value={deltaDistance}
        uniforms-radius-value={opts.current.radius}
        uniforms-curlSize-value={opts.current.curlSize}
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
