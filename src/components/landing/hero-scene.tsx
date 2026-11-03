"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { AssetIcon } from "@/components/brand/asset-icon";
import type { AssetSymbol } from "@/lib/config/assets";

type Pointer = { x: number; y: number };

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

function Coin({ symbol, position, scale = 1, spin = 0.4, animate }: { symbol: AssetSymbol; position: [number, number, number]; scale?: number; spin?: number; animate: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const face = useIconTexture(symbol);
  const invalidate = useThree((s) => s.invalidate);
  const edge = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d5d9e0", metalness: 0.85, roughness: 0.28 }), []);
  const front = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", map: face, roughness: 0.4, metalness: 0.05 }), [face]);
  const materials = useMemo(() => [edge, front, front], [edge, front]);

  // With reduced motion the canvas renders on demand, so redraw once the face texture is ready.
  useEffect(() => {
    invalidate();
    return () => front.dispose();
  }, [front, invalidate]);

  useFrame((_, delta) => {
    if (animate && ref.current) ref.current.rotation.z += delta * spin;
  });

  return (
    <Float speed={animate ? 1.4 : 0} rotationIntensity={animate ? 0.4 : 0} floatIntensity={animate ? 0.9 : 0}>
      <mesh ref={ref} position={position} scale={scale} rotation={[Math.PI / 2, 0, 0.3]} material={materials}>
        <cylinderGeometry args={[0.62, 0.62, 0.14, 64]} />
      </mesh>
    </Float>
  );
}

function XMark({ pointer, animate }: { pointer: React.RefObject<Pointer>; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
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
    const t = state.clock.elapsedTime;
    const scroll = typeof window === "undefined" ? 0 : Math.min(window.scrollY / 900, 1);
    const p = pointer.current ?? { x: 0, y: 0 };
    const targetY = (animate ? Math.sin(t * 0.35) * 0.35 : -0.35) + p.x * 0.5 + scroll * Math.PI * 0.6;
    const targetX = (animate ? Math.cos(t * 0.3) * 0.08 : 0.12) - p.y * 0.3 + scroll * 0.3;
    if (!animate) {
      g.rotation.set(targetX, targetY, 0);
      return;
    }
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3.5, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 3.5, delta);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[0.7, 3.6, 0.7]} radius={0.16} smoothness={5} rotation={[0, 0, -0.56]} position={[0, 0, -0.08]} material={blue} />
      <RoundedBox args={[0.7, 3.6, 0.7]} radius={0.16} smoothness={5} rotation={[0, 0, 0.56]} position={[0, 0, 0.08]} material={ink} />
    </group>
  );
}

export default function HeroScene({ animate, lowPower }: { animate: boolean; lowPower: boolean }) {
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
        frameloop={!animate ? "demand" : visible ? "always" : "never"}
        dpr={lowPower ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, 10], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: lowPower ? "low-power" : "high-performance" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.5} />
        <Environment resolution={128}>
          <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={1.2} position={[-5, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={0.8} position={[5, -1, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
        </Environment>

        <XMark pointer={pointer} animate={animate} />
        <Coin symbol="BTC" position={[-1.95, 1.35, 0.6]} scale={0.95} animate={animate} />
        <Coin symbol="ETH" position={[2.0, 1.2, -0.4]} scale={0.85} spin={-0.35} animate={animate} />
        <Coin symbol="SOL" position={[-1.9, -1.45, -0.5]} scale={0.75} spin={0.5} animate={animate} />
        <Coin symbol="BNB" position={[1.85, -1.45, 0.7]} scale={0.8} spin={-0.45} animate={animate} />

        <ContactShadows position={[0, -2.75, 0]} scale={12} blur={2.6} opacity={0.28} far={6} resolution={lowPower ? 256 : 512} color="#0b0f17" />
      </Canvas>
    </div>
  );
}
