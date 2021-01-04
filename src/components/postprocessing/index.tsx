import React, {
  useEffect,
  forwardRef,
} from 'react'
import {
  useThree,
  extend,
  ReactThreeFiber,
} from 'react-three-fiber'
import {
  Vector2,
  Uniform,
} from 'three'
import glslify from 'glslify'

import {
  EffectComposer,
} from '../../../node_modules/three/examples/jsm/postprocessing/EffectComposer'
import {
  ShaderPass,
} from '../../../node_modules/three/examples/jsm/postprocessing/ShaderPass'
import {
  RenderPass,
} from '../../../node_modules/three/examples/jsm/postprocessing/RenderPass'

import vert from '../../shader/quad.vert'
import frag from '../../shader/quad.frag'
// import dofFrag from '../../shader/dof.frag'
import vignetteFrag from '../../shader/vignette.frag'

const vertexShader = glslify(vert)
const fragmentShader = glslify(frag)
// const dofFragmentShader = glslify(dofFrag)
const vignetteFragmentShader = glslify(vignetteFrag)

extend({ EffectComposer, RenderPass, ShaderPass })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // effectComposer: ReactThreeFiber.Node<EffectComposer, typeof EffectComposer>,
      // renderPass: ReactThreeFiber.Node<RenderPass, typeof RenderPass>,
      shaderPass: ReactThreeFiber.Node<ShaderPass, typeof ShaderPass>,
    }
  }
}

const Effect = (_props, ref) => {
  const { composer, vignette } = ref

  const {
    gl,
    size,
    scene,
    camera,
  } = useThree()

  const rawShaderPrefix = 'precision ' + gl.capabilities.precision + ' float;\n'

  useEffect(() => {
    if (!composer.current) {
      return
    }
    const w = window.innerWidth
    const h = window.innerHeight
    composer.current.passes.forEach((pass: any, index) => {
      if (index === 0) { return }
      pass.uniforms.u_resolution.value.set(w, h)
      pass.uniforms.u_aspect.value = w / h
    })
  }, [ size ])

  return (
    <effectComposer
      ref={composer}
      args={[ gl ]}
    >
      <renderPass
        attachArray="passes"
        scene={scene}
        camera={camera}
      />
      <shaderPass
        attachArray="passes"
        args={[
          {
            uniforms: {
              u_texture: new Uniform(null),
              u_resolution: new Uniform(new Vector2()),
              u_aspect: new Uniform(1),
            },
            vertexShader: rawShaderPrefix + vertexShader,
            fragmentShader: rawShaderPrefix + fragmentShader,
          },
        ]}
      />
      <shaderPass
        attachArray="passes"
        ref={vignette}
        args={[
          {
            uniforms: {
              u_texture: new Uniform(null),
              u_resolution: new Uniform(new Vector2()),
              u_aspect: new Uniform(1),
              u_reduction: new Uniform(0.3),
              u_boost: new Uniform(1.2),
            },
            vertexShader: rawShaderPrefix + vertexShader,
            fragmentShader: rawShaderPrefix + vignetteFragmentShader,
          },
        ]}
        renderToScreen
      />
      {/* <shaderPass
        attachArray="passes"
        args={[
          {
            uniforms: {
              u_texture: new Uniform(null),
              u_resolution: new Uniform(new Vector2()),
              u_aspect: new Uniform(1),
              u_distance: new Uniform(null),
              u_dofDistance: new Uniform(0),
              u_delta: new Uniform(new Vector2()),
              u_mouse: new Uniform(new Vector2()),
              u_amount: new Uniform(1),
            },
            vertexShader,
            fragmentShader: dofFragmentShader,
          },
        ]}
        renderToScreen
      /> */}
    </effectComposer>  
  )
}

export default forwardRef(Effect)