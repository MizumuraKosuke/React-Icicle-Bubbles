import { useRef } from 'react'
import { ReactThreeFiber, useFrame, extend, useThree } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

extend({ OrbitControls })

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      readonly orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >
    }
  }
}

const Controls = () => {
  const {
    camera,
    gl: { domElement },
  } = useThree()

  const controls = useRef<OrbitControls>()

  useFrame(() => {
    controls.current?.update()
  })

  return (
    <orbitControls
      ref={controls}
      args={[ camera, domElement ]}
      rotateSpeed={-1}
      maxDistance={650}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI / 2 - 0.1}
      enablePan={false}
    />
  )
}

export default Controls
