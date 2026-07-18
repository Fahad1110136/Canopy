import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import CanopyTree from './CanopyTree.jsx'

export default function TreeCanvas({ growth = 0, className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [2.6, 1.4, 3.4], fov: 42 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 4, 2]} intensity={1.4} color="#FFF6DE" />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#C7DCB4" />
        <Suspense fallback={null}>
          <CanopyTree growth={growth} />
        </Suspense>
      </Canvas>
    </div>
  )
}
