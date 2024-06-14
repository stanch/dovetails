import React from 'react'
import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import { points, Diagram } from './2d.jsx'
import { Boards, Scene, camera } from './3d.jsx'
import { Canvas } from '@react-three/fiber'
import 'react-tabs/style/react-tabs.css'

const Slider = ({id, title, min, max, step, value, format, hideValue, onChange}) => {
  const formatted = format ? format(value) : value
  return <div>
    <label htmlFor={id}>{title}{hideValue ? "" : `: ${formatted}`}</label>
    <input id={id} type="range"
      min={min} max={max} step={step ?? 1} value={value}
      onChange={e => onChange(id, e.target.value-0)} 
    />
  </div>
}

const App = () => {
  const [values, setValues] = useState({
    width: 300,
    thickness: 25,
    angle: 10,
    halfPinSize: 0.7,
    tailToPin: 1.8,
    density: 0.5,
    tailVariation: 1.3,
    assembled: false
  })

  const onChange = (id, value) =>
    setValues({...values, [id]: value})

  const mm = v => `${v} mm`
  const deg = v => `${v}˚ (≈1:${Math.round(1 / Math.tan(v * Math.PI / 180))})`
  const pc = v => `${Math.round(v * 100)}%`

  const controls1 = [
    {id: "width", title: "Board width", min: 50, max: 600, step: 5, format: mm},
    {id: "thickness", title: "Board thickness", min: 10, max: 50, step: 5, format: mm},
    {id: "angle", title: "Angle", min: 5, max: 15, format: deg},
    {id: "halfPinSize", title: "Half-pin to pin ratio", min: 0.3, max: 1, step: 0.1, format: pc},
    {id: "tailToPin", title: "Tail to pin ratio", min: 0.7, max: 3, step: 0.1, format: pc}
  ]

  const controls2 = [
    {id: "density", title: "Frequency", min: 0.1, max: 1, step: 0.1},
    {id: "tailVariation", title: "Tail variation", min: 1, max: 2, step: 0.1}
  ]

  const { pinPoints, tailPoints } = points(values)

  return <Tabs>
    <TabList>
      <Tab>Designing</Tab>
      <Tab>Marking out</Tab>
    </TabList>
    <TabPanel>
      <div className="viz">
        <Canvas camera={camera}>
          <Scene/>
          <Boards dovetails={values} pinPoints={pinPoints} tailPoints={tailPoints}/>
        </Canvas>
      </div>
      <div className="controls">
        <div>
          <button onClick={() => setValues({...values, assembled: !values.assembled})}>
            {values.assembled ? "Disassemble" : "Assemble"}
          </button>
        </div>
      </div>
      <div className="controls">
        {controls1.map(c =>
          <Slider key={c.id} id={c.id} title={c.title}
            min={c.min} max={c.max} step={c.step}
            format={c.format} value={values[c.id]}
            onChange={onChange}/>)
        }
      </div>
      <div className="controls">
        {controls2.map(c =>
          <Slider key={c.id} id={c.id} title={c.title}
            min={c.min} max={c.max} step={c.step}
            hideValue={true} value={values[c.id]}
            onChange={onChange}/>)
        }
      </div>
    </TabPanel>
    <TabPanel>
      <Diagram dovetails={values} tailPoints={tailPoints}/>
    </TabPanel>
  </Tabs>
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
