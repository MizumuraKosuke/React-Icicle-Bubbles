import { useMemo, useRef, forwardRef } from 'react'
import {
  Uniform,
  Matrix4,
  NoBlending,
} from 'three'
import { useFrame } from 'react-three-fiber'
import glslify from 'glslify'


import vert from '../../shader/depth.vert'
import frag from '../../shader/depth.frag'
const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

interface Props {
  opts: any
}

const Depth = ({ opts }: Props, { movementPrevRenderTarget, movementRenderTarget }: any) => {
  const material = useRef<THREE.ShaderMaterial>(null)
  const points = useRef<THREE.Points>(null)

  const uniforms = useMemo(
    () => ({
      uParticleSize : new Uniform(opts.particleSize),
      uTexturePosition: new Uniform(movementRenderTarget.current.texture),
      uTexturePrevPosition: new Uniform(null),
      uPrevModelViewMatrix: new Uniform(new Matrix4()),
    }),
    [],
  )

  const position = useMemo(() => {
    const pos = new Float32Array(opts.amount * 3)
    for(let i = 0; i < opts.amount; i++ ) {
      const i3 = i * 3
      pos[i3 + 0] = ((i % opts.width) + 0.5) / opts.width
      pos[i3 + 1] = ((~~(i / opts.width)) + 0.5) / opts.height
      pos[i3 + 2] = 400 + Math.pow(Math.random(), 5) * 750
    }
    return pos
  }, [])

  useFrame(() => {
    material.current.uniforms.uTexturePrevPosition.value =
    movementPrevRenderTarget.current.texture
    material.current.uniforms.uTexturePosition.value = movementRenderTarget.current.texture

    const skipMatrixUpdate = !(opts.dieSpeed || opts.speed) && opts.motionBlur
    if(!skipMatrixUpdate) {
      material.current.uniforms.uPrevModelViewMatrix.value.copy(points.current.modelViewMatrix)
    }
  })

  return (
    <points
      ref={points}
      frustumCulled={false}
    >
      <bufferGeometry>
        <bufferAttribute
          attachObject={[ 'attributes', 'position' ]}
          array={position}
          itemSize={3}
          count={position.length / 3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        uniforms-uParticleSize-value={opts.particleSize}
        blending={NoBlending}
        transparent
      />
    </points>
  )
}

export default forwardRef(Depth)
