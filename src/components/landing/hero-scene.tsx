"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { AssetIcon } from "@/components/brand/asset-icon";
import type { AssetSymbol } from "@/lib/config/assets";

type Pointer = { x: number; y: number };

/** Shared motion inputs: pointer position and how far the page has scrolled past the hero. */
type MotionInputs = { pointer: React.RefObject<Pointer>; animate: boolean };

const { damp } = THREE.MathUtils;

/** Rasterizes an asset icon SVG into a texture for a coin face. */
function useIconTexture(symbol: AssetSymbol) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    const markup = renderToStaticMarkup(<AssetIcon symbol={symbol} />).replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"');
    const img = new Image();
    let disposed = false;
    let tex: THREE.CanvasTexture | null = null;
    img.onload = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 512;
      canvas.getContext("2d")!.drawImage(img, 0, 0, 512, 512);
      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.center.set(0.5, 0.5);
      tex.rotation = -Math.PI / 2;
      setTexture(tex);
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    return () => {
      disposed = true;
      tex?.dispose();
    };
  }, [symbol]);
  return texture;
}

type CoinProps = MotionInputs & {
  symbol: AssetSymbol;
  /** Starting angle on the orbit, in radians. */
  phase: number;
  scale?: number;
  /** Flip direction and speed multiplier. */
  flip?: number;
};

const ORBIT = { rx: 2.25, ry: 1.45, rz: 0.9, speed: 0.55 };

/** A coin orbiting the mark on a tilted ellipse, flipping as it travels. */
function Coin({ symbol, phase, scale = 1, flip = 1, pointer, animate }: CoinProps) {
  const orbit = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);
  const face = useIconTexture(symbol);
  const invalidate = useThree((s) => s.invalidate);
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d5d9e0", metalness: 0.85, roughness: 0.28 }), []);
  const front = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", map: face, roughness: 0.4, metalness: 0.05 }), [face]);
  const materials = useMemo(() => [edge, front, front], [edge, front]);

  // Redraw once the face texture is ready (matters when the canvas renders on demand).
  useEffect(() => {
    invalidate();
    return () => front.dispose();
  }, [front, invalidate]);

  useFrame((state, delta) => {
    const g = orbit.current;
    const s = spinner.current;
    if (!g || !s) return;
    const t = state.clock.elapsedTime;
    const p = pointer.current ?? { x: 0, y: 0 };
    const angle = phase + (animate ? t * ORBIT.speed : 0);
    // Small parallax so coins drift against the cursor even when motion is reduced.
    g.position.set(
      Math.cos(angle) * ORBIT.rx - p.x * 0.25,
      Math.sin(angle) * ORBIT.ry + (animate ? Math.sin(t * 2.2 + phase) * 0.08 : 0) + p.y * 0.2,
      Math.sin(angle) * ORBIT.rz,
    );
    if (animate) {
      s.rotation.y += delta * 1.8 * flip;
    } else {
      s.rotation.y = damp(s.rotation.y, p.x * 0.6, 8, delta);
      s.rotation.x = damp(s.rotation.x, p.y * 0.4, 8, delta);
    }
  });

  return (
    <group ref={orbit} scale={scale}>
      <group ref={spinner}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials}>
          <cylinderGeometry args={[0.6, 0.6, 0.14, 64]} />
        </mesh>
      </group>
    </group>
  );
}

function XMark({ pointer, animate }: MotionInputs) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(animate ? -Math.PI : 0);
  const ink = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#10141c", roughness: 0.32, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12 }),
    [],
  );
  const blue = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#3478f6", roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12 }),
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = pointer.current ?? { x: 0, y: 0 };

    if (!animate) {
      // Reduced motion: no autonomous movement, only a quick tilt toward the cursor.
      g.rotation.y = damp(g.rotation.y, -0.35 + p.x * 0.6, 7, delta);
      g.rotation.x = damp(g.rotation.x, 0.12 - p.y * 0.35, 7, delta);
      g.scale.setScalar(1);
      return;
    }

    const scrolled = Math.min(window.scrollY / 700, 1);
    // Continuous spin that speeds up as you scroll, plus a fast pointer tilt.
    spin.current += delta * (0.9 + scrolled * 2.4);
    g.rotation.y = spin.current + p.x * 0.5;
    g.rotation.x = damp(g.rotation.x, -p.y * 0.4 + Math.sin(state.clock.elapsedTime * 1.3) * 0.08, 6, delta);
    g.rotation.z = damp(g.rotation.z, -p.x * 0.15, 6, delta);
    // Quick entrance: scale up from 60% in well under a second.
    g.scale.setScalar(damp(g.scale.x, 1, 5, delta));
  });

  return (
    <group ref={group} scale={animate ? 0.6 : 1}>
      <RoundedBox args={[0.7, 3.6, 0.7]} radius={0.16} smoothness={5} rotation={[0, 0, -0.56]} position={[0, 0, -0.08]} material={blue} />
      <RoundedBox args={[0.7, 3.6, 0.7]} radius={0.16} smoothness={5} rotation={[0, 0, 0.56]} position={[0, 0, 0.08]} material={ink} />
    </group>
  );
}

const COINS: { symbol: AssetSymbol; phase: number; scale: number; flip: number }[] = [
  { symbol: "BTC", phase: Math.PI * 0.75, scale: 0.95, flip: 1 },
  { symbol: "ETH", phase: Math.PI * 0.25, scale: 0.85, flip: -1 },
  { symbol: "SOL", phase: Math.PI * 1.25, scale: 0.75, flip: 1.2 },
  { symbol: "BNB", phase: Math.PI * 1.75, scale: 0.8, flip: -1.2 },
];

export default function HeroScene({ animate }: { animate: boolean }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (wrapper.current) io.observe(wrapper.current);
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <Canvas
        // Render continuously only while on screen. Reduced motion still renders, so the cursor tilt stays responsive.
        frameloop={visible ? "always" : "never"}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 10], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[-5, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={0.8} position={[5, -1, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
        </Environment>

        <XMark pointer={pointer} animate={animate} />
        {COINS.map((c) => (
          <Coin key={c.symbol} {...c} pointer={pointer} animate={animate} />
        ))}

        <ContactShadows position={[0, -2.75, 0]} scale={12} blur={2.6} opacity={0.28} far={6} resolution={512} color="#0b0f17" />
      </Canvas>
    </div>
  );
}
