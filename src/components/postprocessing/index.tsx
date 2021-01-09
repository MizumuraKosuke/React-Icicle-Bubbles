import { forwardRef } from 'react'
import { EffectComposer, Bloom, Vignette } from 'react-postprocessing'

const Effect = (_props, ref) => {
  const { opts } = ref
  return (
    <EffectComposer>
      {
        opts.current.bloom && (
          <Bloom
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
            height={300}
          />
        )
      }
      {
        opts.current.vignette && (
          <Vignette
            eskil={false}
            offset={0.1}
            darkness={1.1}
          />
        )
      }
    </EffectComposer>
  )
}

export default forwardRef(Effect)