import { forwardRef } from 'react'
// import { useThree } from 'react-three-fiber'

const Quad = (_props, ref) => {
  const {
    material,
  } = ref

  return (
    <mesh>
      <planeBufferGeometry args={[ 2, 2 ]} />
      <shaderMaterial {...material.current} />
    </mesh>
  )
}

export default forwardRef(Quad)
