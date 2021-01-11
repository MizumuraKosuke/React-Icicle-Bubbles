import { useRef, useEffect, useMemo, forwardRef } from 'react'
import {
  Uniform,
  Vector2,
  NoBlending,
} from 'three'
import { useFrame, useThree } from 'react-three-fiber'
import glslify from 'glslify'

import vert from '../../shader/particles.vert'
import frag from '../../shader/blurV.frag'
const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

interface Props {
  opts: any
}

const BlurV = ({ opts }: Props, { blurRenderTarget }: any) => {
  const material = useRef<THREE.ShaderMaterial>(null)

  const { size } = useThree()

  const uniforms = useMemo(
    () => ({
      tDiffuse : new Uniform(blurRenderTarget.current.texture),
      uResolution : new Uniform(new Vector2()),
      uOffset : new Uniform(0),
      uBlurZ : new Uniform(opts.blurZ),
    }),
    [],
  )

  useFrame(() => {
    const blurRadius = opts.blur
    if (!blurRadius) {
      return
    }

    material.current.uniforms.uOffset.value +=
    (blurRadius / opts.height - material.current.uniforms.uOffset.value) * 0.05
    material.current.uniforms.uBlurZ.value +=
    (opts.blurZ - material.current.uniforms.uBlurZ.value) * 0.05
    material.current.uniforms.tDiffuse.value = blurRenderTarget.current.texture
  })

  useEffect(() => {
    const w = window.innerWidth
    const h = window.innerHeight

    material.current.uniforms.uResolution.value.set(w, h)
  }, [ size ])

  return (
    <mesh>
      <planeBufferGeometry args={[ 2, 2 ]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={NoBlending}
      />
    </mesh>
  )
}

export default forwardRef(BlurV)