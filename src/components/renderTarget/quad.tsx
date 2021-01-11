import { useRef, useEffect, useMemo, forwardRef } from 'react'
import {
  Uniform,
  Vector2,
  TextureLoader,
  LinearFilter,
} from 'three'
import { useFrame, useThree } from 'react-three-fiber'
import glslify from 'glslify'

import vert from '../../shader/particles.vert'
import frag from '../../shader/particles.frag'
const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

interface Props {
  opts: any
}

const Quad = ({ opts }: Props, { depthRenderTarget, additiveRenderTarget }: any) => {
  const material = useRef<THREE.ShaderMaterial>(null)

  const { gl, size } = useThree()

  const tex = useMemo(
    () => {
      let src = '/images/matcap.jpg'
      if (opts.matcap === 'metal') {
        src = '/images/matcap_metal.jpg'
      }
      else if (opts.matcap === 'plastic') {
        src = '/images/matcap_plastic.jpg'
      }
      const sphereTexture = new TextureLoader().load(src, (texture) => {
        texture.minFilter = LinearFilter
        texture.magFilter = LinearFilter
        texture.anisotropy = gl.capabilities.getMaxAnisotropy()
        texture.flipY = false
        texture.needsUpdate = true
      })
      return sphereTexture
    },
    [ opts.matcap ],
  )

  const uniforms = useMemo(
    () => ({
      uInset: new Uniform(opts.inset),
      uWashout: new Uniform(0),
      uDepth : new Uniform(depthRenderTarget.current.texture),
      uAdditive : new Uniform(additiveRenderTarget.current.texture),
      uSphereMap : new Uniform(tex),
      uResolution: new Uniform(new Vector2()),
    }),
    [ tex ],
  )

  useFrame(() => {
    material.current.uniforms.uWashout.value +=
    (opts.washout - material.current.uniforms.uWashout.value) * 0.05
    material.current.uniforms.uDepth.value = depthRenderTarget.current.texture
    material.current.uniforms.uAdditive.value = additiveRenderTarget.current.texture
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
        uniforms-uInset-value={opts.inset}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export default forwardRef(Quad)
