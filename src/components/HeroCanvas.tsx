import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Wooden Urn Component
function WoodenUrn() {
  const urnRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (urnRef.current) {
      urnRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      urnRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group ref={urnRef} position={[0, 0, 0]}>
      {/* Base */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.2, 32]} />
        <meshStandardMaterial 
          color="#3D2914"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Lower Body */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.65, 0.6, 0.8, 32]} />
        <meshStandardMaterial 
          color="#4A3520"
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* Main Body */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.5, 0.65, 1.2, 32]} />
        <meshStandardMaterial 
          color="#5C4127"
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>

      {/* Shoulder */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 0.3, 32]} />
        <meshStandardMaterial 
          color="#4A3520"
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.4, 32]} />
        <meshStandardMaterial 
          color="#3D2914"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Lid */}
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.28, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#5C4127"
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>

      {/* Gold Band - Lower */}
      <mesh position={[0, -0.55, 0]}>
        <torusGeometry args={[0.62, 0.02, 16, 100]} />
        <meshStandardMaterial 
          color="#D4AF37"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Gold Band - Middle */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.65, 0.025, 16, 100]} />
        <meshStandardMaterial 
          color="#D4AF37"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Gold Band - Shoulder */}
      <mesh position={[0, 1.0, 0]}>
        <torusGeometry args={[0.52, 0.02, 16, 100]} />
        <meshStandardMaterial 
          color="#D4AF37"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Lid Finial */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial 
          color="#D4AF37"
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>
    </group>
  );
}

// Loading fallback
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#3D2914" />
    </mesh>
  );
}

interface HeroCanvasProps {
  className?: string;
}

const HeroCanvas = ({ className = '' }: HeroCanvasProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>
          {/* Lighting */}
          <ambientLight intensity={0.2} />
          
          {/* Key Light - Golden rim light from top right */}
          <spotLight
            position={[3, 3, 2]}
            angle={0.3}
            penumbra={1}
            intensity={1.5}
            color="#D4AF37"
            castShadow
          />
          
          {/* Fill Light - Soft from left */}
          <pointLight
            position={[-3, 1, 2]}
            intensity={0.5}
            color="#f5e6d3"
          />
          
          {/* Back Light - Rim definition */}
          <pointLight
            position={[0, 2, -3]}
            intensity={0.8}
            color="#D4AF37"
          />

          {/* Bottom fill */}
          <pointLight
            position={[0, -2, 1]}
            intensity={0.3}
            color="#8B4513"
          />

          <WoodenUrn />

          <ContactShadows
            position={[0, -1.1, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
            far={4}
          />

          <Environment preset="studio" />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroCanvas;
