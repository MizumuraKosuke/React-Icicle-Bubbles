import DatGui, { DatColor, DatNumber, DatSelect, DatFolder, DatBoolean } from 'react-dat-gui'

import 'react-dat-gui/dist/index.css'

interface Props {
  opts: {

  },
  setOpts: any
}

const GUI = ({ opts, setOpts }: Props) => (
  <DatGui
    style={{
      fontSize: '11px',
      width: '17rem',
    }}
    data={opts}
    onUpdate={setOpts}
  >
    <DatFolder title="Simulator" closed>
      <DatSelect
        path="amountMap"
        label="amount"
        options={[
          '4k',
          '8k',
          '16k',
          '32k',
          '65k',
          '131k',
          '252k',
          '524k',
          '1m',
        ]}
      />
      <DatNumber path="speed" min={0} max={2} step={0.1} />
      <DatNumber path="dieSpeed" min={0} max={0.05} step={0.001} />
      <DatNumber path="radius" min={0.1} max={4} step={0.1} />
      <DatNumber path="curlSize" min={0.001} max={0.05} step={0.001} />
      <DatNumber path="attraction" min={-2} max={2} step={0.1} />
      <DatBoolean path="toggleMovement" />
    </DatFolder>
    <DatFolder title="Rendering" closed>
      <DatSelect
        path="matcap"
        options={[ 'default', 'plastic', 'metal' ]}
      />
      <DatNumber path="particleSize" label="particle size" min={16} max={48} step={1} />
      <DatNumber path="inset" min={0} max={3} step={0.001} />
      <DatNumber path="washout" min={0} max={1} step={0.001} />
      {/* <DatNumber path="brightness" min={0} max={1} step={0.001} /> */}
      <DatNumber path="blur" min={0} max={3} step={0.001} />
      <DatNumber path="blurZ" min={0} max={1} step={0.001} />
      <DatColor path="bgColor"/>
    </DatFolder>
    <DatFolder title="Post-Processing" closed>
      {/* <DatNumber path="dof" min={0} max={3} step={0.001} />
      <DatBoolean path="dofMouse" label="dof on mouse" />
      <DatBoolean path="fxaa" />
      <DatBoolean path="mothinBlur" />
      <DatNumber path="maxDistance" label="motion distance" min={1} max={300} step={1} />
      <DatNumber path="motionMultiplier" label="motion multiplier" min={0.1} max={15} step={0.1} /> */}
      {/* <DatSelect
        path="motionQuality"
        options={[ 'best', 'high', 'medium', 'row' ]}
      /> */}
      <DatBoolean path="bloom" />
      {/* <DatNumber path="bloomRadius" label="bloom radius" min={0} max={3} step={0.1} /> */}
      <DatNumber path="bloomIntensity" label="bloom amount" min={0} max={3} step={0.1} />
      <DatBoolean path="vignette" />
    </DatFolder>
  </DatGui>
)

export default GUI
