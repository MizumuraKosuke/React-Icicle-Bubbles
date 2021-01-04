interface Props {
  color: THREE.Color
}

const Floor = ({ color }: Props) => (
  <mesh rotation-x={-1.75} position-y={-20}>
    <planeBufferGeometry args={[ 4500, 4500, 10, 10 ]} />
    <meshStandardMaterial
      color={color}
      roughness={0.4}
      metalness={0.2}
    />
  </mesh>
)

export default Floor