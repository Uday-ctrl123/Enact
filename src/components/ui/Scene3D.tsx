import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// A placeholder representation of a techy cycle hub
function TechHub() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <torusGeometry args={[1.5, 0.4, 16, 100]} />
        <meshStandardMaterial color="#00ffcc" wireframe={true} emissive="#00ffcc" emissiveIntensity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

export function Scene3D() {
  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,204,0.1)] border border-white/5 bg-black/40">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 2, 10]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1} color="#00ffcc" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <TechHub />
        </Float>
        
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#00ffcc" />
        <Environment preset="city" />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
