import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const MODEL_PATH = "/models/remy/remy.glb";

export default function Player() {
  const player = useRef();
  const keys = useRef({});

  const velocity = useRef(
    new THREE.Vector3()
  );

  const verticalVelocity = useRef(0);

  const { scene } = useGLTF(MODEL_PATH);

  const character = useMemo(() => {
    const model = clone(scene);

    model.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;

        if (object.material) {
          object.material.needsUpdate = true;
        }
      }
    });

    return model;
  }, [scene]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();

      keys.current[key] = true;

      if (key === " ") {
        event.preventDefault();
      }
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();

      keys.current[key] = false;
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );
    };
  }, []);

  useFrame((state, delta) => {
    if (!player.current) return;

    const input = keys.current;

    const movement = new THREE.Vector3();

    if (input.w) {
      movement.z -= 1;
    }

    if (input.s) {
      movement.z += 1;
    }

    if (input.a) {
      movement.x -= 1;
    }

    if (input.d) {
      movement.x += 1;
    }

    const isMoving =
      movement.lengthSq() > 0;

    const isCrouching = !!input.c;
    const isSprinting =
      !!input.shift && !isCrouching;

    if (isMoving) {
      movement.normalize();

      let speed = 4.5;

      if (isSprinting) {
        speed = 8;
      }

      if (isCrouching) {
        speed = 2;
      }

      const targetVelocity =
        movement.clone().multiplyScalar(speed);

      velocity.current.lerp(
        targetVelocity,
        1 - Math.pow(0.0001, delta)
      );

      player.current.position.x +=
        velocity.current.x * delta;

      player.current.position.z +=
        velocity.current.z * delta;

      const targetRotation =
        Math.atan2(
          movement.x,
          movement.z
        );

      player.current.rotation.y =
        THREE.MathUtils.lerp(
          player.current.rotation.y,
          targetRotation + Math.PI,
          1 - Math.pow(0.0001, delta)
        );
    } else {
      velocity.current.lerp(
        new THREE.Vector3(),
        1 - Math.pow(0.0001, delta)
      );
    }

    // -------------------------
    // JUMP
    // -------------------------

    const grounded =
      player.current.position.y <= 0.001;

    if (input[" "] && grounded) {
      verticalVelocity.current = 7.5;

      input[" "] = false;
    }

    verticalVelocity.current -=
      20 * delta;

    player.current.position.y +=
      verticalVelocity.current * delta;

    if (
      player.current.position.y < 0
    ) {
      player.current.position.y = 0;
      verticalVelocity.current = 0;
    }

    // -------------------------
    // WORLD BOUNDS
    // -------------------------

    player.current.position.x =
      THREE.MathUtils.clamp(
        player.current.position.x,
        -70,
        70
      );

    player.current.position.z =
      THREE.MathUtils.clamp(
        player.current.position.z,
        -120,
        25
      );

    // -------------------------
    // THIRD PERSON CAMERA
    // -------------------------

    const cameraOffset =
      new THREE.Vector3(
        0,
        4.2,
        8.5
      );

    cameraOffset.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      player.current.rotation.y
    );

    const desiredCamera =
      new THREE.Vector3(
        player.current.position.x +
          cameraOffset.x,

        player.current.position.y +
          cameraOffset.y,

        player.current.position.z +
          cameraOffset.z
      );

    state.camera.position.lerp(
      desiredCamera,
      1 - Math.pow(0.0005, delta)
    );

    const cameraTarget =
      new THREE.Vector3(
        player.current.position.x,
        player.current.position.y + 1.45,
        player.current.position.z
      );

    state.camera.lookAt(cameraTarget);
  });

  return (
    <group ref={player}>
      <primitive
        object={character}
        position={[0, 0, 0]}
        scale={1}
      />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);