import _ from 'lodash'
import { useMemo } from 'react'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import { useSpring } from '@react-spring/core'
import { a } from '@react-spring/three'
import { OrbitControls } from '@react-three/drei'

const pinColor = 0x8A593F
const tailColor = 0xC8A891
const boardLength = 200

const PinBoard = ({dovetails, pinPoints}) => {
  const pins = pinPoints.map(([leftBottom, leftTop, rightTop, rightBottom]) => {
    const pin = new THREE.Shape()
    pin.moveTo(leftBottom, 0)
    pin.lineTo(leftTop, dovetails.thickness)
    pin.lineTo(rightTop, dovetails.thickness)
    pin.lineTo(rightBottom, 0)
    pin.lineTo(leftBottom, 0)
    return pin
  })

  const extrudeSettings = { 
    depth: dovetails.thickness, 
    bevelEnabled: false
  }

  const pinGeometry = new THREE.ExtrudeGeometry(pins, extrudeSettings)
    .translate(-dovetails.width / 2, 0, -dovetails.thickness)
    .rotateX(Math.PI / 2)
  const boardGeometry = useMemo(() => new THREE.BoxGeometry(dovetails.width, boardLength, dovetails.thickness)
    .translate(0, -boardLength / 2, dovetails.thickness / 2)
    .toNonIndexed(), [dovetails.width, boardLength, dovetails.thickness])
  const geometry = BufferGeometryUtils.mergeGeometries([pinGeometry, boardGeometry])

  const springs = useSpring({
    "position-y": dovetails.assembled ? 0 : -dovetails.thickness * 1.5
  })

  return <a.mesh {...springs}>
    <primitive object={geometry} attach="geometry"/>
    <meshStandardMaterial color={pinColor} attach="material" />
  </a.mesh>
}

const TailBoard = ({dovetails, tailPoints}) => {
  const tails = tailPoints.map(([leftBottom, leftTop, rightTop, rightBottom]) => {
    const tail = new THREE.Shape()
    tail.moveTo(leftBottom, 0)
    tail.lineTo(leftTop, dovetails.thickness)
    tail.lineTo(rightTop, dovetails.thickness)
    tail.lineTo(rightBottom, 0)
    tail.lineTo(leftBottom, 0)
    return tail
  })

  const extrudeSettings = { 
    depth: dovetails.thickness, 
    bevelEnabled: false
  }

  const tailGeometry = new THREE.ExtrudeGeometry(tails, extrudeSettings)
    .translate(-dovetails.width / 2, -dovetails.thickness, -dovetails.thickness / 2)
  const boardGeometry = useMemo(() => new THREE.BoxGeometry(dovetails.width, boardLength, dovetails.thickness)
    .translate(0, boardLength / 2, 0)
    .toNonIndexed(), [dovetails.width, boardLength, dovetails.thickness])
  const geometry = BufferGeometryUtils.mergeGeometries([tailGeometry, boardGeometry])
    .rotateX(-Math.PI / 2)

  const springs = useSpring({
    "position-y": dovetails.assembled ? dovetails.thickness / 2 : dovetails.thickness * 1.5
  })

  return <a.mesh {...springs}>
    <primitive object={geometry} attach="geometry"/>
    <meshStandardMaterial color={tailColor} attach="material" />
  </a.mesh>
}

export const Boards = ({dovetails, pinPoints, tailPoints}) => {
  const springs = useSpring({
    scale: Math.min(1.2, 280/dovetails.width)
  })

  return <a.group {...springs}>
    <PinBoard dovetails={dovetails} pinPoints={pinPoints}/>
    <TailBoard dovetails={dovetails} tailPoints={tailPoints}/>
  </a.group>
}

export const Scene = () => {
  return <>
    <directionalLight position={[1000, 1000, 0]} color="white" intensity={4}/>
    <directionalLight position={[-1000, 1000, 0]} color="white" intensity={4}/>
    <ambientLight color="white" intensity={2}/>
    <OrbitControls enableDamping={true}
      minDistance={300} maxDistance={1000}
      minAzimuthAngle={-Math.PI/2} maxAzimuthAngle={Math.PI/2}/>
  </>
}

export const camera = {
  fov: 45,
  near: 1,
  far: 2000,
  position: [0, boardLength * 1.5, boardLength * 1.5]
}
