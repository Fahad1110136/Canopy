import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/**
 * CanopyTree — the page's signature 3D element.
 * A low-poly tree made of an icosahedron canopy + cylinder trunk.
 * `growth` (0–1, driven by scroll progress) scales the canopy up,
 * so the tree visibly "grows" as the visitor scrolls through the hero —
 * a literal expression of the product's promise (grow while cutting emissions).
 */
export default function CanopyTree({ growth = 0 }) {
  const group = useRef()
  const canopyRefs = [useRef(), useRef(), useRef(), useRef()]

  // Leaf cluster layout: positions/scale/color per cluster (deterministic, not random each render)
  const clusters = useMemo(
    () => [
      { pos: [0, 2.05, 0], scale: 1.15, color: '#2F5233' },
      { pos: [0.95, 1.55, 0.4], scale: 0.8, color: '#3E6B3F' },
      { pos: [-0.9, 1.6, -0.35], scale: 0.82, color: '#3E6B3F' },
      { pos: [0.2, 1.35, -0.9], scale: 0.68, color: '#7FAE62' },
    ],
    []
  )

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.18
      // gentle mouse parallax tilt
      const targetX = state.pointer.y * 0.12
      const targetZ = -state.pointer.x * 0.12
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.04)
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetZ, 0.04)
    }
    canopyRefs.forEach((ref, i) => {
      if (ref.current) {
        const target = 0.35 + growth * clusters[i].scale
        ref.current.scale.setScalar(THREE.MathUtils.lerp(ref.current.scale.x, target, 0.06))
      }
    })
  })

  return (
    <group ref={group} position={[0, -0.6, 0]}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.16, 1.3, 6]} />
        <meshStandardMaterial color="#5C4630" roughness={0.9} flatShading />
      </mesh>

      {/* Canopy clusters (low-poly icosahedrons) */}
      {clusters.map((c, i) => (
        <mesh key={i} ref={canopyRefs[i]} position={c.pos} scale={0.35}>
          <icosahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial color={c.color} roughness={0.65} flatShading />
        </mesh>
      ))}

      {/* Ground disc */}
      <mesh position={[0, -0.16, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.7, 24]} />
        <meshStandardMaterial color="#EDE7D3" roughness={1} />
      </mesh>

      {/* Ambient floating "spores" for atmosphere */}
      <Float speed={1.4} floatIntensity={1.2} rotationIntensity={0.2}>
        <Sparkles count={24} scale={3.2} size={2.4} speed={0.3} color="#E7B84B" opacity={0.6} />
      </Float>
    </group>
  )
}
