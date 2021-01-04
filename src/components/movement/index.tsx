import { useMemo, useEffect, forwardRef } from 'react'
import { useThree } from 'react-three-fiber'
import {
  Uniform,
  Vector2,
  Vector3,
  RGBAFormat,
  FloatType,
  NearestFilter,
  DataTexture,
  NoBlending,
} from 'three'
import glslify from 'glslify'
import { useMove } from 'react-use-gesture'
import { useSpring, animated } from '../../../node_modules/react-spring/three'

import vert from '../../shader/default.vert'
import frag from '../../shader/position.frag'

const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

interface Props {
  width: number
  height: number
  opts: any
}

const Move = ({ width, height, opts }: Props, ref) => {
  const { material } = ref
  const amount = width * height

  const { gl } = useThree()

  const rawShaderPrefix = 'precision ' + gl.capabilities.precision + ' float;\n'

  const [
    {
      // mouseX,
      // mouseY,
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
      mouseX: x,
      mouseY: y,
      deltaDistance: distance / 10,
    }),
    { domTarget: typeof window !== 'undefined' ? window : null },
  )
  useEffect(bind, [ bind ])

  const uniforms = useMemo(() => {
    const positions = new Float32Array(amount * 4)

    for(let i = 0; i < amount; i++) {
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
      positions, width, height, RGBAFormat, FloatType,
    )
    texture.minFilter = NearestFilter
    texture.magFilter = NearestFilter
    texture.needsUpdate = true
    texture.generateMipmaps = false
    texture.flipY = false
  
    return {
      resolution: new Uniform(new Vector2(width, height)),
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

  return (
    <mesh>
      <planeBufferGeometry args={[ 2, 2 ]} />
      <animated.rawShaderMaterial
        ref={material}
        uniforms={uniforms}
        uniforms-deltaDistance-value={deltaDistance}
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
