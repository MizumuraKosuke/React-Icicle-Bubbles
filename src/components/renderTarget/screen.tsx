import { useMemo, useRef, forwardRef } from 'react'
import { useThree, useFrame } from 'react-three-fiber'
import {
  Uniform,
} from 'three'
import glslify from 'glslify'

import vert from '../../shader/quad.vert'
import frag from '../../shader/quad.frag'

const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

const Scrren = (_props, ref) => {
  const { renderTarget } = ref
  const material = useRef<THREE.ShaderMaterial>(null)

  const { gl } = useThree()

  const rawShaderPrefix = 'precision ' + gl.capabilities.precision + ' float;\n'

  const uniforms = useMemo(() => ({
    uTexture: new Uniform(null),
  }), [])

  useFrame(() => {
    material.current.uniforms.uTexture.value = renderTarget.current.texture
  })

  return (
    <mesh>
      <planeBufferGeometry args={[ 2, 2 ]} />
      <shaderMaterial
        ref={material}
        vertexShader={rawShaderPrefix + vertexShader}
        fragmentShader={rawShaderPrefix + fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export default forwardRef(Scrren)