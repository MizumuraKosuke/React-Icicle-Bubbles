import { useMemo, forwardRef } from 'react'
import { useThree } from 'react-three-fiber'
import {
  Uniform,
} from 'three'
import glslify from 'glslify'

import vert from './../shader/quad.vert'
import frag from './../shader/quad.frag'

const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)

const FboHelper = (_props, ref) => {
  const { material } = ref

  const { gl } = useThree()

  const rawShaderPrefix = 'precision ' + gl.capabilities.precision + ' float;\n'

  const uniforms = useMemo(() => ({
    u_texture: new Uniform(null),
  }), [])

  // const copy = (inputTexture, ouputTexture) => {
  //   material.current.uniforms.u_texture.value = inputTexture
  //   if(ouputTexture) {
  //     gl.setRenderTarget(ouputTexture)
  //   }
  //   gl.render(scene, camera.current)
  //   if(ouputTexture) {
  //     gl.setRenderTarget(null)
  //   }
  // }

  // const render = (material, renderTarget) => {
  //   material.current = material
  //   if(renderTarget) {
  //     gl.setRenderTarget(renderTarget)
  //   }
  //   gl.render(scene, camera.current)
  //   if(renderTarget) {
  //     gl.setRenderTarget(null)
  //   }
  // }

  // const getColorState = () => ({
  //   autoClearColor : gl.autoClearColor,
  //   clearColor : gl.getClearColor().getHex(),
  //   clearAlpha : gl.getClearAlpha(),
  // })

  // const setColorState = (colorState) => {
  //   gl.setClearColor(colorState.clearColor, colorState.clearAlpha)
  //   gl.autoClearColor = colorState.autoClearColor
  // }

  // useFrame(() => {})

  return (
    <mesh>
      <planeBufferGeometry args={[ 2, 2 ]} />
      <rawShaderMaterial
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

export default forwardRef(FboHelper)