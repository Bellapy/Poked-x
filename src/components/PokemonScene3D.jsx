import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Component, Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'

const REST_X = -0.8
const ENTER_START_X = 4.5
const ENTER_DURATION = 0.9
const FAST_SPIN_SPEED = 11
const LEAVE_SPEED = 3.4

// Modelo com três momentos: "arrive" (entra girando rápido da direita até o
// ponto de descanso), "idle" (parado, só reage ao mouse — inclinação e um
// leve deslocamento lateral) e "leave" (desliza pra fora pela esquerda).
// Cada .glb vem em escala e origem arbitrárias, então normalizamos para
// caber sempre no mesmo raio antes de aplicar qualquer animação.
function Model({ url, mode, pointer }) {
  const { scene } = useGLTF(url)
  const groupRef = useRef(null)
  const elapsed = useRef(0)
  const arrived = useRef(mode === 'leave')

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const s = 2.4 / maxDim
    return { scale: s, offset: center.multiplyScalar(-s) }
  }, [scene])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    if (mode === 'leave') {
      group.position.x -= delta * LEAVE_SPEED
      group.rotation.y += delta * 4
      return
    }

    if (!arrived.current) {
      elapsed.current += delta
      const t = Math.min(elapsed.current / ENTER_DURATION, 1)
      const eased = 1 - (1 - t) ** 3
      group.position.x = THREE.MathUtils.lerp(ENTER_START_X, REST_X, eased)
      group.rotation.y += delta * FAST_SPIN_SPEED * (1 - eased * 0.85)
      if (t >= 1) arrived.current = true
      return
    }

    // Parado: só reage ao mouse (desliza um pouco pro lado + inclina).
    const targetX = REST_X + pointer.current.x * 0.6
    group.position.x += (targetX - group.position.x) * 0.08

    const targetRotY = pointer.current.x * 0.35
    const targetRotX = pointer.current.y * 0.25
    group.rotation.x += (targetRotX - group.rotation.x) * 0.08
    group.rotation.y += (targetRotY - group.rotation.y) * 0.08
  })

  return (
    <group ref={groupRef} position={[mode === 'leave' ? REST_X : ENTER_START_X, 0, 0]}>
      <primitive object={scene} scale={scale} position={[offset.x, offset.y, offset.z]} />
    </group>
  )
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

export default function PokemonScene3D({ url, mode = 'arrive', className }) {
  const pointer = useRef({ x: 0, y: 0 })

  function handlePointerMove(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    pointer.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    }
  }

  function handlePointerLeave() {
    pointer.current = { x: 0, y: 0 }
  }

  return (
    <div className={className} onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      <Canvas camera={{ position: [0, 0, 5], fov: 35 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.4} />
        <directionalLight position={[-3, -2, -4]} intensity={0.4} />
        <Suspense fallback={null}>
          <ModelErrorBoundary key={url}>
            <Model url={url} mode={mode} pointer={pointer} />
          </ModelErrorBoundary>
        </Suspense>
      </Canvas>
    </div>
  )
}
