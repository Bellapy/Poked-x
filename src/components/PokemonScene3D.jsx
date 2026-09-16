import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Component, Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'

// Modelo autogirante que também reage ao ponteiro do mouse (tilt suave nos
// eixos X/Z, por cima da rotação contínua no Y). Cada .glb vem em escala e
// origem arbitrárias, então normalizamos para caber sempre no mesmo raio.
function Model({ url, pointer }) {
  const { scene } = useGLTF(url)
  const groupRef = useRef(null)

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
    group.rotation.y += delta * 0.5

    const targetX = pointer.current.y * 0.3
    const targetZ = -pointer.current.x * 0.3
    group.rotation.x += (targetX - group.rotation.x) * 0.06
    group.rotation.z += (targetZ - group.rotation.z) * 0.06
  })

  return (
    <group ref={groupRef}>
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

export default function PokemonScene3D({ url, className }) {
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
            <Model url={url} pointer={pointer} />
          </ModelErrorBoundary>
        </Suspense>
      </Canvas>
    </div>
  )
}
