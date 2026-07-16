import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";

type AvatarTypingProps = {
  url: string;
  typingProgress: number;
  isTyping: boolean; // 0..1
};

// === SCENE ASSET URLS ===
const CHAIR_URL = "/assets/gaming_chair.glb";
const DESK_URL = "/assets/desk.glb";
const LAPTOP_URL = "/assets/windows_10_laptop.glb";
const SHELVES_URL = "/assets/tetris_shelf.glb";
const WALLSHELF_URL = "/assets/wall_shelf.glb";
const SHELF_DECOR_PLANT = "/assets/haworthia_zebra_plant.glb";
const COFFEE_MUG = "/assets/coffee_mug.glb";
const KOI_URL = "/assets/koi_neon_frame.glb";
const CALADIUM_URL ="/assets/caladium_plant_pot.glb";
const AZTEC_STATUE_URL ="/assets/aztec_statuette.glb";

function Prop({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onLoaded,
}: {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onLoaded?: (root: THREE.Object3D) => void;
}) {
  const { scene } = useGLTF(url);

  const cloned = React.useMemo(() => scene.clone(true), [scene]);

  React.useEffect(() => {
    onLoaded?.(cloned);
  }, [cloned, onLoaded])

  return (
    <primitive 
      object={cloned} 
      position={position} 
      rotation={rotation} 
      scale={scale} 
    />
  );
}

function Floor() {
   return (
     <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, -1.15, 1]} receiveShadow>
       <planeGeometry args={[11.20, 8.4]} />
       <meshStandardMaterial color="lightgray" roughness={0.85} />
     </mesh>
   );
}

function BackWall() {
   return (
     <mesh position={[-1.5, 1.2, -5]} receiveShadow>
        <planeGeometry args={[10.85, 6]} />
        <meshStandardMaterial color="grey" roughness={0.9} />
      </mesh>
   );
}

function lightenAndDeRedden(root: THREE.Object3D) {
  console.log("✅ desk onLoaded fired (LIGHTEN)");

  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

    mats.forEach((mat) => {
      if (!mat) return;
      const m = mat as any;

      // ✅ Big one: if vertex colors are present, they can darken/redden everything
      // Turn them off at the material level:
      if ("vertexColors" in m) m.vertexColors = false;

      // Make sure we can tint
      if (m.color?.isColor) {
        // light oak tint + brighten
        m.color.set("#e0cfba");
        m.color.multiplyScalar(100);
      }

      // ✅ Emissive is the best “in-engine brighten” that still keeps texture detail
      if (m.emissive?.isColor) {
         m.emissive.set("#ffffff");
         m.emissiveIntensity = 0; // try 0.10–0.30
      }

      // Modern wood look
      if (typeof m.roughness === "number") m.roughness = Math.min(1, m.roughness + 0.1);
      if (typeof m.metalness === "number") m.metalness = Math.max(0, m.metalness - 0.05);

      // Three r182: ensure baseColor texture is interpreted correctly if present
      if (m.map) {
        m.map.colorSpace = THREE.SRGBColorSpace;
        m.map.needsUpdate = true;
      }

      m.needsUpdate = true;
    });
  });
}

function AvatarModel({ url, typingProgress, isTyping }: AvatarTypingProps) {
  const BASE_CLIP_NAME = "Armature|mixamo.com|Layer0";
  const START_SEC = 4.3;
  const END_SEC = 8.9;

  const group = React.useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);

  // Build a stable “looping subclip” once animations load
  const loopClips = React.useMemo(() => {
    if (!animations || animations.length === 0) return [];
    const base = animations.find((c) => c.name === BASE_CLIP_NAME) ?? animations[0];
    const fps = 30; // Mixamo exports are typically 30fps; good enough for subclip slicing
    const clip = THREE.AnimationUtils.subclip(
      base,
      `${base.name}__loop_${START_SEC}_${END_SEC}`,
      Math.floor(START_SEC * fps),
      Math.floor(END_SEC * fps),
      fps
    );
    return [clip];
  }, [animations]);

  const { actions, mixer } = useAnimations(loopClips, group);

  React.useLayoutEffect(() => {
    const name = loopClips[0]?.name ?? "";
    const action = actions[name];
    if (!action) return;

    action.reset();
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setLoop(THREE.LoopRepeat, Infinity);

    // IMPORTANT: play once so the skeleton gets posed,
    // then pause it until typing starts
    action.play();
    action.paused = !isTyping;

    // Force apply the first pose so we don't render a bind/T-pose frame
    // Use a tiny time > 0 to avoid edge cases at exactly 0
    action.time = 0.001;
    mixer.update(0);

    return () => {
      action.stop();
    };
  }, [actions, mixer, loopClips, isTyping]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // sway stays the same
    const intensity = THREE.MathUtils.lerp(0.15, 1.0, typingProgress);
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.35) * 0.03 * intensity;
    }

    const action = actions[loopClips[0]?.name ?? ""];
    if (action) {
      action.paused = !isTyping;

      if (isTyping) {
        action.timeScale = THREE.MathUtils.lerp(0.85, 1.15, typingProgress);
      }
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    // Put camera lower and left
    camera.position.set(2.8, 0.30, 2.5);

    // Aim LOWER (towards hands), not at origin/high point
    // Because your avatar group is shifted down by -1.0,
    // the "hands zone" ends up around y ~ 0.1–0.4 in world space.
    camera.lookAt(-0.15, 0.25, 0.1);

    camera.updateProjectionMatrix();
  });

  return null;
}


export default function AvatarTyping({ url, typingProgress, isTyping }: AvatarTypingProps) {
  return (
    <Canvas
      camera={{ position: [-0.9, 0.75, 2.4], fov: 33 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <CameraRig />

      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 2]} intensity={1.2} />
      <directionalLight position={[-2, 2, 1]} intensity={0.4} />

      {/* Environment */}
      <Floor />
      <BackWall />

      {/* Props (placeholders for now) */}

      <Prop 
        url={SHELF_DECOR_PLANT}
        position={[-1.65, 0.740, -3.20]}
        rotation={[0, 0.15, 0]}
        scale={2.3}
      />

      <Prop 
        url={AZTEC_STATUE_URL}
        position={[-1.46, 0.715, -1.45]}
        rotation={[0, 0.15, 0]}
        scale={0.25}
      />

      <Prop 
        url={CALADIUM_URL}
        position={[-0.87, -0.30, 0.85]}
        rotation={[0, 1, 0]}
        scale={0.32}
      />

      <Prop 
        url={WALLSHELF_URL}
        position={[-3.3, 0.3, -3.20]}
        rotation={[0, 0.15, 0]}
        scale={2.3}
      />

      <Prop 
        url={KOI_URL}
        position={[-4.00, 0.78, -1.35]}
        rotation={[0, 1.45, 0]}
        scale={0.106}
      />

      <Prop 
        url={CHAIR_URL}
        position={[-0.1, -0.28, -0.1]}
        rotation={[0, 3, 0]}
        scale={0.045}
      />

      <Prop
        url={DESK_URL}
        position={[-0.2, -1.05, 1.5]}
        rotation={[0, Math.PI, 0]}
        scale={0.5}
        onLoaded={lightenAndDeRedden}
      />

      <Prop
        url={COFFEE_MUG}
        position={[-0.30, -0.25, 0.80]}
        rotation={[0, 3, 0]}
        scale={0.022}
      />

      <Prop
        url={LAPTOP_URL}
        position={[0.16, -0.25, 0.65]}
        rotation={[0, 4.7, 0]}
        scale={2}
      />

      <group position={[0, -1.0, 0]}>
        <React.Suspense fallback={null}>
          <AvatarModel url={url} typingProgress={typingProgress} isTyping={isTyping} />
        </React.Suspense>
      </group>
    </Canvas>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload("/assets/obtyping.glb");
  useGLTF.preload(CHAIR_URL);
  useGLTF.preload(DESK_URL);
  useGLTF.preload(LAPTOP_URL);
}


