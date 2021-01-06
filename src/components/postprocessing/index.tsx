import { forwardRef } from 'react'
import { EffectComposer, Bloom, Vignette } from 'react-postprocessing'

const Effect = ({ opts }) => {
  console.log(opts.vignette)
  return (
    <EffectComposer>
      {
        opts.bloom && (
          <Bloom
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
            height={300}
          />
        )
      }
      {
        opts.vignette && (
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