import { useState, useRef, useEffect } from 'react'
import { Color } from 'three'
import { Canvas } from 'react-three-fiber'
import dynamic from 'next/dynamic'

import GUI from '../components/gui'
import Fakeblob from '../components/fakeblob'

const Stats = dynamic(() => import('../components/stats'), { ssr: false })
const OrbitControls = dynamic(() => import('../components/orditControls'), { ssr: false })

const amountMap = {
  '4k' : [ 64, 64 ],
  '8k' : [ 128, 64 ],
  '16k' : [ 128, 128 ],
  '32k' : [ 256, 128 ],
  '65k' : [ 256, 256 ],
  '131k' : [ 512, 256 ],
  '252k' : [ 512, 512 ],
  '524k' : [ 1024, 512 ],
  '1m' : [ 1024, 1024 ],
}

const initialOpts: any = {
  // Simulator
  amountMap: '4k',
  speed: 1,
  dieSpeed: 0.015,
  radius: 0.5,
  curlSize: 0.02,
  attraction: -0.5,
  toggleMovement: true,
  // Rendering
  matcap: 'metal',
  particleSize: 21,
  inset: 0.5,
  washout: 0.7,
  // brightness: 0.3,
  blur: 0,
  blurZ: 0.8,
  bgColor: '#3c4a4a',
  // Post-Processing
  // dof: 1,
  // dofMouse: true,
  // fxaa: true,
  // motionBlur: true,
  // maxDistance: 120,
  // motionMultiplier: 2,
  // motionQuality: 'medium',
  bloom: false,
  // bloomRadius: 1,
  bloomIntensity: 0.3,
  vignette: false,
  floorColor: new Color('#fff')
}

const Home = () => {
  const [ isMount, setMount ] = useState(true)
  const [ opts, setOpts ] = useState(initialOpts)
  let amount = amountMap[initialOpts.amountMap]
  initialOpts.width = amount[0]
  initialOpts.height = amount[1]
  initialOpts.amount = initialOpts.width * initialOpts.height
  const optsRef = useRef(initialOpts)

  const onChange = (data: any) => {
    setOpts(data)
    amount = amountMap[data.amountMap]
    data.width = amount[0]
    data.height = amount[1]
    data.amount = data.width * data.height
    optsRef.current = data
  }

  useEffect(() => {
    setMount(false)
    setTimeout(() => {
      setMount(true)
    }, 10)
  }, [ opts.amountMap ])

  return (
    <div
      className="fixed inset-0"
      style={{ backgroundColor: opts.bgColor }}
    >
      {
        isMount && (
          <>
            <Canvas
              gl={{
                premultipliedAlpha: false,
                preserveDrawingBuffer: true,
              }}
              pixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
              camera={{
                near: 10,
                far: 5000,
                fov: 45,
              }}
            >
              <Fakeblob opts={opts} />
              <group position-y={500}>
                <ambientLight color="#333" />
                <pointLight intensity={1} distance={800} color={optsRef.current.bgColor} />
              </group>
              <OrbitControls />
            </Canvas>
            <Stats />
            <GUI opts={opts} setOpts={onChange} />
          </>
        )
      }
    </div>
  )
}

export default Home
