import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Component to load and render a 3D model
function Model({ path, scale, yOffset }) {
  const { scene } = useGLTF(path); // Load the 3D model from the given path

  return (
    <primitive
      object={scene} // Render the loaded 3D model
      scale={scale || 1} // Apply scaling to the model
      position={[0, yOffset || 0, 0]} // Adjust the position with optional yOffset
    />
  );
}

// Main component to display the 3D dinosaur viewer
export default function DinoViewer({ modelPath, scale, yOffset }) {
  return (
    <div className="dino-viewer"> {/* Container for the 3D viewer */}
      <Canvas camera={{ position: [0, 2, 10], fov: 50 }}> {/* Set up the 3D canvas */}
        <ambientLight intensity={1} /> {/* Add ambient lighting */}
        <directionalLight position={[5, 5, 5]} /> {/* Add directional lighting */}
        <Model path={modelPath} scale={scale} yOffset={yOffset} /> {/* Render the 3D model */}
        <OrbitControls /> {/* Enable orbit controls for user interaction */}
      </Canvas>
    </div>
  );
}
