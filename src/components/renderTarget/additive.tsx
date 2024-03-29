import { useEffect, useMemo, useRef, forwardRef } from 'react'
import {
  Vector2,
  Uniform,
  CustomBlending,
  AddEquation,
  OneFactor,
} from 'three'
import { useFrame, useThree } from 'react-three-fiber'
import glslify from 'glslify'


import vert from '../../shader/additive.vert'
import frag from '../../shader/additive.frag'
const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

interface Props {
  opts: any
}

const Additive = ({ opts }: Props, { movementRenderTarget, depthRenderTarget }: any) => {
  const material = useRef<THREE.ShaderMaterial>(null)

  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uParticleSize : new Uniform(opts.particleSize),
      uTexturePosition: new Uniform(movementRenderTarget.current.texture),
      uDepth: new Uniform(depthRenderTarget.current.texture),
      uInset: new Uniform(opts.inset),
      uResolution: new Uniform(new Vector2()),
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
    material.current.uniforms.uTexturePosition.value = movementRenderTarget.current.texture
    material.current.uniforms.uDepth.value = depthRenderTarget.current.texture
  })

  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight

    material.current.uniforms.uResolution.value.set(w, h)
  }, [ size ])

  return (
    <points
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
        uniforms-uInset-value={opts.inset}
        blending={CustomBlending}
        blendEquation={AddEquation}
        blendSrc={OneFactor}
        blendDst={OneFactor}
        blendEquationAlpha={AddEquation}
        blendSrcAlpha={OneFactor}
        blendDstAlpha={OneFactor}
        transparent
      />
    </points>
  )
}

export default forwardRef(Additive)
