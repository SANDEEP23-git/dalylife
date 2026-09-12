import { Sky, Stars } from "@react-three/drei";
import * as THREE from "three";
import Player from "./Player";

function Mountain({ position, scale }) {
  return (
    <mesh
      position={position}
      scale={scale}
      castShadow
    >
      <coneGeometry
        args={[8, 16, 7]}
      />

      <meshStandardMaterial
        color="#252b2b"
        roughness={1}
      />
    </mesh>
  );
}

function Rock({ position, scale = 1 }) {
  return (
    <mesh
      position={position}
      scale={scale}
      rotation={[
        0.2,
        Math.random() * Math.PI,
        0.15,
      ]}
      castShadow
      receiveShadow
    >
      <icosahedronGeometry
        args={[1, 1]}
      />

      <meshStandardMaterial
        color="#303331"
        roughness={1}
      />
    </mesh>
  );
}

function ForestTree({
  position,
  scale = 1,
}) {
  return (
    <group
      position={position}
      scale={scale}
    >
      <mesh
        position={[0, 2, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[0.25, 0.45, 4, 12]}
        />

        <meshStandardMaterial
          color="#30241d"
          roughness={1}
        />
      </mesh>

      <mesh
        position={[0, 4.7, 0]}
        castShadow
      >
        <coneGeometry
          args={[2.3, 5, 10]}
        />

        <meshStandardMaterial
          color="#14251d"
          roughness={1}
        />
      </mesh>
    </group>
  );
}

function World() {
  return (
    <>
      {/* Cinematic atmosphere */}

      <color
        attach="background"
        args={["#11181b"]}
      />

      <fog
        attach="fog"
        args={[
          "#11181b",
          35,
          150,
        ]}
      />

      <Sky
        distance={450000}
        sunPosition={[
          -80,
          35,
          -100,
        ]}
        inclination={0.47}
        azimuth={0.22}
      />

      <Stars
        radius={180}
        depth={100}
        count={1000}
        factor={1}
        fade
        speed={0.12}
      />

      {/* Lighting */}

      <ambientLight
        intensity={0.3}
      />

      <directionalLight
        position={[
          -30,
          40,
          25,
        ]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />

      {/* Large ground */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[200, 200]}
        />

        <meshStandardMaterial
          color="#171c19"
          roughness={1}
        />
      </mesh>

      {/* Main road */}

      <mesh
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          0.03,
          -45,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[9, 130]}
        />

        <meshStandardMaterial
          color="#282621"
          roughness={1}
        />
      </mesh>

      {/* Mountains */}

      <Mountain
        position={[
          -38,
          7,
          -80,
        ]}
        scale={[
          2.8,
          1.6,
          1.5,
        ]}
      />

      <Mountain
        position={[
          -18,
          8,
          -105,
        ]}
        scale={[
          3,
          1.9,
          1.7,
        ]}
      />

      <Mountain
        position={[
          15,
          9,
          -115,
        ]}
        scale={[
          3.4,
          2,
          1.8,
        ]}
      />

      <Mountain
        position={[
          45,
          7,
          -90,
        ]}
        scale={[
          2.7,
          1.7,
          1.6,
        ]}
      />

      {/* Forest */}

      <ForestTree
        position={[
          -11,
          0,
          -12,
        ]}
        scale={1.2}
      />

      <ForestTree
        position={[
          12,
          0,
          -18,
        ]}
        scale={1.4}
      />

      <ForestTree
        position={[
          -17,
          0,
          -28,
        ]}
        scale={1.5}
      />

      <ForestTree
        position={[
          18,
          0,
          -34,
        ]}
        scale={1.35}
      />

      <ForestTree
        position={[
          -14,
          0,
          -48,
        ]}
        scale={1.7}
      />

      <ForestTree
        position={[
          17,
          0,
          -57,
        ]}
        scale={1.55}
      />

      <ForestTree
        position={[
          -22,
          0,
          -70,
        ]}
        scale={1.8}
      />

      <ForestTree
        position={[
          24,
          0,
          -76,
        ]}
        scale={1.9}
      />

      <ForestTree
        position={[
          -28,
          0,
          -92,
        ]}
        scale={2}
      />

      <ForestTree
        position={[
          29,
          0,
          -100,
        ]}
        scale={2}
      />

      {/* Rocks */}

      <Rock
        position={[
          -4,
          0.5,
          -14,
        ]}
        scale={0.7}
      />

      <Rock
        position={[
          6,
          0.5,
          -24,
        ]}
        scale={0.5}
      />

      <Rock
        position={[
          -5,
          0.6,
          -37,
        ]}
        scale={0.8}
      />

      <Rock
        position={[
          7,
          0.7,
          -52,
        ]}
        scale={0.7}
      />

      {/* Player */}

      <Player />
    </>
  );
}

export default World;