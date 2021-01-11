import { forwardRef, useEffect, useState } from 'react'
import { EffectComposer, Bloom, Vignette } from 'react-postprocessing'

interface Props {
  opts: any
}

const Effect = ({ opts }: Props, { screenScene, screenCamera }: any) => {
   const [ isMount, setMount ] = useState(false)

  useEffect(() => {
    setMount(true)
  }, [])

  useEffect(() => {
    setMount(false)
    setTimeout(() => {
      setMount(true)
    }, 10)
  }, [ opts.bloom, opts.vignette, opts.bloomIntensity ])

  return (
    <>
      {
        isMount && (opts.bloom || opts.vignette) && (
          <EffectComposer
            scene={screenScene.current}
            camera={screenCamera.current}
          >
            {
              opts.bloom && (
                <Bloom
                  intensity={opts.bloomIntensity}
                  // luminanceThreshold={0}
                  // luminanceSmoothing={0.9}
                  // height={300}
                />
              )
            }
            {
              opts.vignette && (
                <Vignette
                  offset={0.1}
                  darkness={1.0}
                />
              )
            }
          </EffectComposer>
        )
      }
    </>
  )
}

export default forwardRef(Effect)