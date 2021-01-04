import { useMemo, forwardRef } from 'react'

interface Props {
  width: number
  height: number
}

const Points = ({ width, height }: Props, ref) => {
  const {
    points,
    material,
  } = ref

  const amount = width * height

  const position = useMemo(() => {
    const pos = new Float32Array(amount * 3)
    for(let i = 0; i < amount; i++ ) {
      const i3 = i * 3
      pos[i3 + 0] = ((i % width) + 0.5) / width
      pos[i3 + 1] = ((~~(i / width)) + 0.5) / height
      pos[i3 + 2] = 400 + Math.pow(Math.random(), 5) * 750
    }
    return pos
  }, [ amount ])

  return (
    <points
      ref={points}
      frustumCulled={false}
    >
      <bufferGeometry>
        <bufferAttribute
          attachObject={[ 'attributes', 'position' ]}
          array={position}
          itemSize={3}
          count={position.length / 3}
        />
      </bufferGeometry>
      <shaderMaterial {...material.current} />
    </points>
  )
}

export default forwardRef(Points)
