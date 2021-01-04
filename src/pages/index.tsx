import { useState } from 'react'
import { Canvas } from 'react-three-fiber'
import dynamic from 'next/dynamic'

import FakeBlob from '../components/view'
import GUI from '../components/gui'

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

const Home = () => {
  const [ opts, setOpts ] = useState({
    // Simulator
    amount: '16k',
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
    brightness: 0.3,
    blur: 1,
    blurZ: 0.8,
    bgColor: '#3c4a4a',
    // Post-Processing
    dof: 1,
    dofMouse: true,
    fxaa: true,
    motionBlur: true,
    maxDistance: 120,
    motionMultiplier: 2,
    motionQuality: 'medium',
    bloom: false,
    bloomRadius: 1,
    bloomAmount: 0.3,
    vignette: true,
  })

  const amountInfo = amountMap[opts.amount]

  return (
    <div className="fixed inset-0">
      <Canvas
        gl={{
          premultipliedAlpha: false,
          preserveDrawingBuffer: true,
        }}
        pixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
        camera={{
          aspect: 1,
          near: 10,
          far: 5000,
          fov: 45,
        }}
      >
        <FakeBlob
          opts={opts}
          width={amountInfo[0]}
          height={amountInfo[1]}
        />
        <OrbitControls />
      </Canvas>
      <Stats />
      <GUI opts={opts} setOpts={setOpts} />
    </div>
  )
}

export default Home
