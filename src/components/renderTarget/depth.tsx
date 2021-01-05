import { useMemo, useRef, forwardRef } from 'react'
import {
  Uniform,
  Matrix4,
  NoBlending,
  // WebGLRenderTarget,
  // NearestFilter,
  // RGBAFormat,
  // FloatType,
} from 'three'
import { useFrame } from 'react-three-fiber'
import glslify from 'glslify'


import depthVert from '../../shader/depth.vert'
import depthFrag from '../../shader/depth.frag'
const depthVertexShader = glslify(depthVert)
const depthFragmentShader = glslify(depthFrag)

const Depth = (_props, ref) => {
  const {
    movementPrevRenderTarget,
    movementRenderTarget,
    opts,
  } = ref

  const material = useRef<THREE.ShaderMaterial>(null)
  const points = useRef<THREE.Points>(null)

  const uniforms = useMemo(
    () => ({
      uParticleSize : new Uniform(opts.current.particleSize),
      uTexturePosition: new Uniform(movementRenderTarget.current.texture),
      uTexturePrevPosition: new Uniform(null),
      uPrevModelViewMatrix: new Uniform(new Matrix4()),
      uMotionMultiplier: new Uniform(1),
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
    material.current.uniforms.uTexturePrevPosition.value =
    movementPrevRenderTarget.current.texture
    material.current.uniforms.uTexturePosition.value = movementRenderTarget.current.texture

    const skipMatrixUpdate = !(opts.current.dieSpeed || opts.current.speed) && opts.current.motionBlur
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
        vertexShader={depthVertexShader}
        fragmentShader={depthFragmentShader}
        uniforms={uniforms}
        uniforms-uParticleSize-value={opts.current.particleSize}
        blending={NoBlending}
      />
    </points>
  )
}

export default forwardRef(Depth)
