import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { LIGHT } from "./emotions";
import { paintFace } from "./pixel";
import { useReya } from "./store";

function Screen() {
  const mood = useReya((s) => s.mood);
  const mode = useReya((s) => s.mode);
  const mouth = useReya((s) => s.mouth);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    return c;
  }, []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);
  const face = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    return c;
  }, []);
  const tick = useRef(0);

  useFrame(() => {
    tick.current += 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#070b10";
    ctx.fillRect(0, 0, 256, 256);

    if (mode === "idle") {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      ctx.fillStyle = "#f0c27a";
      ctx.font = "700 72px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${hh}:${mm}`, 128, 132);
      ctx.fillStyle = "#7ee0ff";
      ctx.font = "500 22px ui-monospace, monospace";
      ctx.fillText(ss, 128, 168);
      const date = now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
      ctx.fillStyle = "#8d97a3";
      ctx.font = "500 16px ui-monospace, monospace";
      ctx.fillText(date.toUpperCase(), 128, 200);
      const pulse = 0.35 + Math.sin(tick.current / 30) * 0.15;
      ctx.strokeStyle = `rgba(126,224,255,${pulse})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(18, 18, 220, 220);
    } else {
      paintFace(face, mood, mouth, tick.current);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(face, 48, 36, 160, 160);
      ctx.strokeStyle = "rgba(126,224,255,0.45)";
      ctx.lineWidth = 3;
      ctx.strokeRect(28, 24, 200, 200);
    }
    tex.needsUpdate = true;
  });

  return (
    <mesh position={[0, 0.18, 0.86]}>
      <planeGeometry args={[0.86, 0.86]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

function Body() {
  const ring = useRef<THREE.Mesh>(null);
  const mode = useReya((s) => s.mode);
  const mood = useReya((s) => s.mood);

  useFrame(({ clock }) => {
    if (!ring.current) return;
    const m = ring.current.material as THREE.MeshStandardMaterial;
    const color = new THREE.Color(mode === "idle" ? "#7ee0ff" : LIGHT[mood]);
    m.color.copy(color);
    m.emissive.copy(color);
    const t = clock.elapsedTime;
    const on = mode === "active" ? 1.6 : 0.25;
    m.emissiveIntensity = on + Math.sin(t * 2) * 0.2;
  });

  return (
    <group>
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.78, 0.86, 1.7, 64]} />
        <meshStandardMaterial color="#4a5562" metalness={0.88} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.7, 0.76, 0.08, 64]} />
        <meshStandardMaterial color="#1a1f26" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh ref={ring} position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.025, 16, 80]} />
        <meshStandardMaterial color="#7ee0ff" emissive="#7ee0ff" emissiveIntensity={0.6} />
      </mesh>
      <RoundedBox args={[0.98, 1.05, 0.06]} position={[0, 0.16, 0.82]} radius={0.04}>
        <meshStandardMaterial color="#0a0e13" metalness={0.4} roughness={0.15} />
      </RoundedBox>
      <Screen />
      <mesh position={[0, -0.95, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 1.02, 0.12, 64]} />
        <meshStandardMaterial color="#14181e" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Speaker() {
  return (
    <Canvas camera={{ position: [0.45, 0.28, 2.45], fov: 34 }} dpr={[1, 1.75]} gl={{ antialias: true }}>
      <color attach="background" args={["#0c1016"]} />
      <ambientLight intensity={0.35} />
      <spotLight position={[2.4, 3.2, 2.2]} intensity={18} angle={0.45} penumbra={0.6} color="#f4f7fb" />
      <pointLight position={[-1.6, 0.4, 1.2]} intensity={6} color="#7ee0ff" />
      <pointLight position={[1.4, -0.2, 1]} intensity={3} color="#f0c27a" />
      <Body />
      <ContactShadows position={[0, -1.05, 0]} opacity={0.45} scale={6} blur={2.4} far={2} />
    </Canvas>
  );
}
