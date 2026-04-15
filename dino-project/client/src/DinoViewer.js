import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function Model({ path, scale, yOffset, rotationY }) {
  const { scene } = useGLTF(path);

  return (
    <group rotation={[0, parseFloat(rotationY || 0), 0]}>
      <primitive
        object={scene}
        scale={parseFloat(scale || 1)}
        position={[0, parseFloat(yOffset || 0), 0]}
      />
    </group>
  );
}

export default function DinoViewer({ modelPath, scale, yOffset, rotationY }) {
  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />
        <Model
          path={modelPath}
          scale={scale}
          yOffset={yOffset}
          rotationY={rotationY}
        />
        <OrbitControls />
      </Canvas>
    </div>
  );
}