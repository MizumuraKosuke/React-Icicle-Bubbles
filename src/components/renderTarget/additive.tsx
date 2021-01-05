import { useEffect, useMemo, useRef, forwardRef } from 'react'
import {
  Vector2,
  Uniform,
  CustomBlending,
  AddEquation,
  OneFactor,
  // WebGLRenderTarget,
  // NearestFilter,
  // RGBAFormat,
  // FloatType,
} from 'three'
import { useFrame, useThree } from 'react-three-fiber'
import glslify from 'glslify'


import additiveVert from '../../shader/additive.vert'
import additiveFrag from '../../shader/additive.frag'
const additiveVertexShader = glslify(additiveVert)
const additiveFragmentShader = glslify(additiveFrag)

const Additive = (_props, ref) => {
  const {
    movementRenderTarget,
    depthRenderTarget,
    baseInset,
    insetExtra,
    opts,
  } = ref

  const material = useRef<THREE.ShaderMaterial>(null)

  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      uParticleSize : new Uniform(opts.current.particleSize),
      uTexturePosition: new Uniform(movementRenderTarget.current.texture),
      uDepth: new Uniform(depthRenderTarget.current.texture),
      uInset: new Uniform(0),
      uResolution: new Uniform(new Vector2()),
    }),
    [],
  )

  const position = useMemo(() => {
    const pos = new Float32Array(opts.current.amount * 3)
    for(let i = 0; i < opts.current.amount; i++ ) {
      const i3 = i * 3
      pos[i3 + 0] = ((i % opts.current.width) + 0.5) / opts.current.width
      pos[i3 + 1] = ((~~(i / opts.current.width)) + 0.5) / opts.current.height
      pos[i3 + 2] = 400 + Math.pow(Math.random(), 5) * 750
    }
    return pos
  }, [])

  useFrame(() => {
    material.current.uniforms.uInset.value = baseInset.current + insetExtra.current

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
        vertexShader={additiveVertexShader}
        fragmentShader={additiveFragmentShader}
        uniforms={uniforms}
        uniforms-uParticleSize-value={opts.current.particleSize}
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
