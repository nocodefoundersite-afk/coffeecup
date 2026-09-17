"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type CupShape = "espresso" | "cortado" | "cappuccino" | "americano" | "urban" | "everyday" | "on-the-go" | "everest" | "active";
export type EngravingFont = "modern" | "serif" | "script" | "mono";

type ThreeCupProps = {
  shape: CupShape;
  color: string;
  engraving?: string;
  engravingColor?: string;
  engravingFont?: EngravingFont;
  engravingSize?: number;
  engravingY?: number;
  personalisable?: boolean;
  scrollProgress?: number;
  className?: string;
  label?: string;
};

type ModelRecord = { group: THREE.Group; marks: THREE.Mesh[]; viewScale: number };
type Materials = {
  finish: THREE.MeshPhysicalMaterial;
  black: THREE.MeshPhysicalMaterial;
  tonal: THREE.MeshPhysicalMaterial;
  steel: THREE.MeshPhysicalMaterial;
  clear: THREE.MeshPhysicalMaterial;
  darkGlass: THREE.MeshPhysicalMaterial;
  mark: THREE.MeshBasicMaterial;
  shadow: THREE.MeshBasicMaterial;
};

const FALLBACKS: Record<CupShape, string> = {
  espresso: "https://coffeecupshop.eu/cdn/shop/files/bezowy-black-cap_a4852afb-844c-4d6d-8dc8-efdc1fd715c0.png?v=1774964075&width=1000",
  cortado: "https://coffeecupshop.eu/cdn/shop/files/golden-2-black-cap_e6c862d0-b260-4085-83a2-571b1ff2b846.png?v=1774965085&width=1000",
  cappuccino: "https://coffeecupshop.eu/cdn/shop/files/rozowe-zloto-black-cap_e9644dd4-7891-41d9-8578-fb9e37bfd12d.png?v=1774964815&width=1000",
  americano: "https://coffeecupshop.eu/cdn/shop/files/darkBlue-black-cap.jpg?v=1788294151&width=1000",
  urban: "https://coffeecupshop.eu/cdn/shop/files/small_black_1.png?v=1786375688&width=1100",
  everyday: "https://coffeecupshop.eu/cdn/shop/files/380ml.jpg?v=1786449083&width=1200",
  "on-the-go": "https://coffeecupshop.eu/cdn/shop/files/510ml.jpg?v=1786449192&width=1200",
  everest: "https://coffeecupshop.eu/cdn/shop/files/big_white_1.png?v=1786375399&width=1200",
  active: "https://coffeecupshop.eu/cdn/shop/files/ecru_1.png?v=1774963807&width=1200",
};

const FONT_STACKS: Record<EngravingFont, string> = {
  modern: '750 88px "Helvetica Neue", Arial, sans-serif',
  serif: '700 92px Georgia, "Times New Roman", serif',
  script: '600 104px "Brush Script MT", "Segoe Script", cursive',
  mono: '700 78px "Courier New", monospace',
};

function drawEngraving(canvas: HTMLCanvasElement, value: string, font: EngravingFont, color: string, size: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const text = value.trim() || "YOUR NAME";
  const maxWidth = canvas.width * 0.76;
  const base = Math.max(44, Math.min(118, size));
  const family = FONT_STACKS[font].replace(/\d+px/, `${base}px`);
  ctx.font = family;
  const measured = ctx.measureText(text).width;
  if (measured > maxWidth) {
    const reduced = Math.max(34, Math.floor(base * (maxWidth / measured)));
    ctx.font = family.replace(`${base}px`, `${reduced}px`);
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (color.toLowerCase() === "#d8d9d7") {
    const steel = ctx.createLinearGradient(0, 0, canvas.width, 0);
    steel.addColorStop(0, "#777b7d");
    steel.addColorStop(0.25, "#f4f5f1");
    steel.addColorStop(0.52, "#aeb2b2");
    steel.addColorStop(0.76, "#ffffff");
    steel.addColorStop(1, "#737779");
    ctx.fillStyle = steel;
  } else {
    ctx.fillStyle = color;
  }
  ctx.shadowColor = "rgba(0,0,0,.18)";
  ctx.shadowBlur = 2;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
}

function lathe(profile: Array<[number, number]>, material: THREE.Material, segments = 96) {
  const geometry = new THREE.LatheGeometry(profile.map(([radius, y]) => new THREE.Vector2(radius, y)), segments);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function ring(radius: number, tube: number, y: number, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 16, 96), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y = y;
  mesh.castShadow = true;
  return mesh;
}

function cylinder(top: number, bottom: number, height: number, y: number, material: THREE.Material, segments = 96) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments), material);
  mesh.position.y = y;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function roundedBox(width: number, height: number, depth: number, radius: number, material: THREE.Material) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: 3, bevelSize: Math.min(radius * 0.35, 0.03), bevelThickness: 0.02 });
  geometry.center();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function addShadow(group: THREE.Group, width: number, y: number, material: THREE.Material) {
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(width, 64), material);
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(1, 0.36, 1);
  shadow.position.set(0.08, y, -0.05);
  group.add(shadow);
}

function createMark(radiusTop: number, radiusBottom: number, height: number, y: number, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 96, 1, true, -0.64, 1.28), material);
  mesh.position.y = y;
  mesh.userData.baseY = y;
  mesh.renderOrder = 5;
  return mesh;
}

function buildCoffee(shape: "espresso" | "cortado" | "cappuccino" | "americano", m: Materials): ModelRecord {
  const specs = {
    espresso: { h: 1.42, r: 0.80, view: 1.32, lid: 0.88 },
    cortado: { h: 1.82, r: 0.86, view: 1.17, lid: 0.94 },
    cappuccino: { h: 2.10, r: 0.98, view: 1.02, lid: 1.06 },
    americano: { h: 2.42, r: 1.02, view: 0.92, lid: 1.10 },
  }[shape];
  const { h, r, lid, view } = specs;
  const g = new THREE.Group();
  g.name = shape;
  g.add(lathe([[r * 0.70, -h / 2 + 0.10], [r * 0.75, -h / 2 + 0.02], [r * 0.82, -h / 2], [r * 0.94, h / 2 - 0.18], [r, h / 2 - 0.07], [r * 0.98, h / 2]], m.finish));
  g.add(ring(r * 0.77, 0.025, -h / 2 + 0.04, m.steel));
  const lidGroup = new THREE.Group();
  lidGroup.position.y = h / 2 + 0.02;
  lidGroup.add(cylinder(lid, lid * 0.98, 0.20, 0.04, m.black));
  lidGroup.add(ring(lid * 0.87, 0.026, -0.055, m.black));
  lidGroup.add(lathe([[lid * 0.86, 0.08], [lid * 0.82, 0.17], [lid * 0.66, 0.27], [lid * 0.47, 0.30]], m.black));
  const sip = roundedBox(lid * 0.54, 0.085, 0.24, 0.04, m.darkGlass);
  sip.position.set(0, 0.31, 0.28);
  sip.rotation.x = -0.12;
  lidGroup.add(sip);
  g.add(lidGroup);
  const mark = createMark(r * 0.975, r * 0.83, Math.min(0.60, h * 0.42), -0.02, m.mark);
  g.add(mark);
  addShadow(g, r * 1.28, -h / 2 - 0.055, m.shadow);
  return { group: g, marks: [mark], viewScale: view };
}

function buildUrban(m: Materials): ModelRecord {
  const h = 2.65;
  const r = 0.88;
  const g = new THREE.Group();
  g.name = "urban";
  g.add(lathe([[r * 0.83, -h / 2 + 0.12], [r * 0.88, -h / 2], [r * 0.97, h / 2 - 0.16], [r, h / 2]], m.finish));
  g.add(ring(r * 0.99, 0.045, h / 2 - 0.02, m.steel));
  g.add(cylinder(r * 1.01, r, 0.12, h / 2 + 0.10, m.clear));
  const slider = roundedBox(0.62, 0.10, 0.30, 0.07, m.tonal);
  slider.rotation.x = -Math.PI / 2;
  slider.position.set(0, h / 2 + 0.20, 0.18);
  g.add(slider);
  const mark = createMark(r * 0.975, r * 0.88, 0.67, -0.03, m.mark);
  g.add(mark);
  addShadow(g, 1.22, -h / 2 - 0.055, m.shadow);
  return { group: g, marks: [mark], viewScale: 0.88 };
}

function buildFlipTumbler(shape: "everyday" | "on-the-go", m: Materials): ModelRecord {
  const isTall = shape === "on-the-go";
  const h = isTall ? 3.48 : 2.92;
  const r = isTall ? 0.79 : 0.86;
  const g = new THREE.Group();
  g.name = shape;
  g.add(lathe([[r * 0.84, -h / 2 + 0.10], [r * 0.88, -h / 2], [r * 0.96, h / 2 - 0.16], [r, h / 2]], m.finish));
  g.add(ring(r * 0.995, 0.044, h / 2 - 0.015, m.steel));
  g.add(cylinder(r * 1.015, r, 0.18, h / 2 + 0.11, m.tonal));
  const flip = roundedBox(0.58, 0.14, 0.34, 0.06, m.tonal);
  flip.position.set(-0.16, h / 2 + 0.25, 0.16);
  flip.rotation.x = -0.17;
  g.add(flip);
  const opening = roundedBox(0.34, 0.055, 0.22, 0.025, m.darkGlass);
  opening.position.set(0.32, h / 2 + 0.22, 0.18);
  opening.rotation.x = -0.12;
  g.add(opening);
  if (isTall) {
    const grip = roundedBox(0.36, h * 0.26, 0.018, 0.08, m.tonal);
    grip.position.set(-r * 0.52, 0.34, r * 0.84);
    g.add(grip);
  }
  const mark = createMark(r * 0.975, r * 0.88, isTall ? 0.76 : 0.66, -0.10, m.mark);
  g.add(mark);
  addShadow(g, r * 1.28, -h / 2 - 0.055, m.shadow);
  return { group: g, marks: [mark], viewScale: isTall ? 0.73 : 0.84 };
}

function buildEverest(m: Materials): ModelRecord {
  const h = 3.86;
  const r = 0.95;
  const g = new THREE.Group();
  g.name = "everest";
  g.add(lathe([[0.58, -h / 2 + 0.06], [0.62, -h / 2], [0.64, -0.88], [0.72, -0.70], [0.91, -0.54], [r * 0.98, h / 2 - 0.16], [r, h / 2]], m.finish));
  g.add(cylinder(0.65, 0.62, 0.22, -h / 2 + 0.03, m.steel));
  g.add(cylinder(r * 1.005, r * 0.99, 0.18, h / 2 - 0.03, m.steel));
  g.add(cylinder(r * 1.01, r, 0.10, h / 2 + 0.11, m.clear));
  const sip = roundedBox(0.38, 0.09, 0.20, 0.035, m.tonal);
  sip.position.set(0.42, h / 2 + 0.19, 0.12);
  sip.rotation.x = -0.12;
  g.add(sip);
  const handleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(r * 0.86, 0.92, 0),
    new THREE.Vector3(r + 0.57, 0.78, 0),
    new THREE.Vector3(r + 0.70, 0.28, 0),
    new THREE.Vector3(r + 0.66, -0.26, 0),
    new THREE.Vector3(r * 0.86, -0.44, 0),
  ]);
  const handle = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 64, 0.105, 16, false), m.finish);
  handle.castShadow = true;
  g.add(handle);
  const mark = createMark(r * 0.97, 0.86, 0.74, -0.05, m.mark);
  g.add(mark);
  addShadow(g, 1.50, -h / 2 - 0.09, m.shadow);
  return { group: g, marks: [mark], viewScale: 0.68 };
}

function buildActive(m: Materials): ModelRecord {
  const h = 4.02;
  const r = 0.72;
  const g = new THREE.Group();
  g.name = "active";
  g.add(lathe([[r * 0.88, -h / 2 + 0.10], [r, -h / 2 + 0.18], [r, 1.25], [r * 0.97, 1.43], [r * 0.84, 1.63], [r * 0.52, 1.83], [r * 0.40, 1.86]], m.finish));
  g.add(cylinder(r * 0.99, r * 0.96, 0.24, -h / 2 + 0.03, m.tonal));
  g.add(ring(r * 0.47, 0.032, 1.83, m.steel));
  g.add(cylinder(0.36, 0.34, 0.44, 2.08, m.tonal));
  g.add(cylinder(0.34, 0.36, 0.07, 2.31, m.tonal));
  const loopCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.28, 2.03, 0),
    new THREE.Vector3(-0.62, 2.00, 0),
    new THREE.Vector3(-0.92, 2.12, 0),
    new THREE.Vector3(-0.68, 2.30, 0),
    new THREE.Vector3(-0.36, 2.22, 0),
  ], true);
  const loop = new THREE.Mesh(new THREE.TubeGeometry(loopCurve, 64, 0.045, 12, true), m.tonal);
  loop.castShadow = true;
  g.add(loop);
  addShadow(g, 1.16, -h / 2 - 0.05, m.shadow);
  return { group: g, marks: [], viewScale: 0.68 };
}

function createMaterials(markTexture: THREE.Texture): Materials {
  return {
    finish: new THREE.MeshPhysicalMaterial({ color: 0xd6cec0, metalness: 0.46, roughness: 0.36, clearcoat: 0.34, clearcoatRoughness: 0.42 }),
    black: new THREE.MeshPhysicalMaterial({ color: 0x111214, metalness: 0.06, roughness: 0.45, clearcoat: 0.38 }),
    tonal: new THREE.MeshPhysicalMaterial({ color: 0x36383a, metalness: 0.18, roughness: 0.40, clearcoat: 0.28 }),
    steel: new THREE.MeshPhysicalMaterial({ color: 0xc8cccd, metalness: 1, roughness: 0.19, clearcoat: 0.22 }),
    clear: new THREE.MeshPhysicalMaterial({ color: 0xdce5e7, metalness: 0, roughness: 0.12, transmission: 0.48, transparent: true, opacity: 0.58, thickness: 0.12 }),
    darkGlass: new THREE.MeshPhysicalMaterial({ color: 0x0a0b0c, metalness: 0.1, roughness: 0.20, clearcoat: 0.65 }),
    mark: new THREE.MeshBasicMaterial({ map: markTexture, transparent: true, alphaTest: 0.015, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 }),
    shadow: new THREE.MeshBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.14, depthWrite: false }),
  };
}

export function ThreeCup({
  shape,
  color,
  engraving = "YOUR NAME",
  engravingColor = "#d8d9d7",
  engravingFont = "modern",
  engravingSize = 88,
  engravingY = 0,
  personalisable = true,
  scrollProgress = 0,
  className = "",
  label = "Three-dimensional product preview",
}: ThreeCupProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef({ shape, color, engraving, engravingColor, engravingFont, engravingSize, engravingY, personalisable, scrollProgress });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    valuesRef.current = { shape, color, engraving, engravingColor, engravingFont, engravingSize, engravingY, personalisable, scrollProgress };
  }, [shape, color, engraving, engravingColor, engravingFont, engravingSize, engravingY, personalisable, scrollProgress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const canvas = document.createElement("canvas");
    const contextOptions = { alpha: true, antialias: true, powerPreference: "high-performance" as const };
    const context = (canvas.getContext("webgl2", contextOptions) as WebGL2RenderingContext | null)
      ?? (canvas.getContext("webgl", contextOptions) as WebGLRenderingContext | null);
    if (!context) return;
    const renderer = new THREE.WebGLRenderer({ canvas, context, ...contextOptions });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.2 : 1.65));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.className = "three-cup-canvas";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.08, 8.2);
    camera.lookAt(0, 0.05, 0);

    const markCanvas = document.createElement("canvas");
    markCanvas.width = 1024;
    markCanvas.height = 256;
    const initial = valuesRef.current;
    drawEngraving(markCanvas, initial.engraving, initial.engravingFont, initial.engravingColor, initial.engravingSize);
    const markTexture = new THREE.CanvasTexture(markCanvas);
    markTexture.colorSpace = THREE.SRGBColorSpace;
    markTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const materials = createMaterials(markTexture);

    const stage = new THREE.Group();
    stage.rotation.set(-0.025, -0.32, 0);
    scene.add(stage);
    const models: Record<CupShape, ModelRecord> = {
      espresso: buildCoffee("espresso", materials),
      cortado: buildCoffee("cortado", materials),
      cappuccino: buildCoffee("cappuccino", materials),
      americano: buildCoffee("americano", materials),
      urban: buildUrban(materials),
      everyday: buildFlipTumbler("everyday", materials),
      "on-the-go": buildFlipTumbler("on-the-go", materials),
      everest: buildEverest(materials),
      active: buildActive(materials),
    };
    (Object.keys(models) as CupShape[]).forEach((key) => {
      models[key].group.visible = key === initial.shape;
      models[key].group.scale.setScalar(models[key].viewScale);
      stage.add(models[key].group);
    });

    scene.add(new THREE.HemisphereLight(0xffffff, 0x6b7280, 2.45));
    const keyLight = new THREE.SpotLight(0xffffff, 66, 24, 0.58, 0.46, 1.45);
    keyLight.position.set(4.4, 5.8, 5.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.target.position.set(0, 0.15, 0);
    scene.add(keyLight, keyLight.target);
    const rimLight = new THREE.SpotLight(0xb8ceff, 43, 20, 0.52, 0.52, 1.6);
    rimLight.position.set(-4.0, 2.8, 2.1);
    rimLight.target.position.set(0, 0.35, 0);
    scene.add(rimLight, rimLight.target);
    const frontLight = new THREE.PointLight(0xfff6e8, 11, 14, 2);
    frontLight.position.set(0, 0.6, 5.4);
    scene.add(frontLight);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    let frame = 0;
    let visible = true;
    let lastTime = performance.now();
    let activeShape = initial.shape;
    let lastSignature = "";
    let currentScale = models[activeShape].viewScale;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = (time: number) => {
      if (!visible) return;
      frame = requestAnimationFrame(render);
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      const values = valuesRef.current;
      if (activeShape !== values.shape) {
        models[activeShape].group.visible = false;
        activeShape = values.shape;
        models[activeShape].group.visible = true;
        currentScale = models[activeShape].viewScale * 0.92;
      }
      const target = models[activeShape];
      currentScale = THREE.MathUtils.lerp(currentScale, target.viewScale, Math.min(1, dt * 7));
      target.group.scale.setScalar(currentScale);
      stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, -0.32 + Math.max(-0.05, Math.min(0.05, values.scrollProgress * 0.05)), Math.min(1, dt * 3.4));
      stage.position.y = reducedMotion ? 0 : Math.sin(time * 0.00055) * 0.012;

      const finish = new THREE.Color(values.color);
      materials.finish.color.lerp(finish, Math.min(1, dt * 8));
      materials.tonal.color.lerp(finish.clone().multiplyScalar(0.72), Math.min(1, dt * 8));
      const lightness = finish.getHSL({ h: 0, s: 0, l: 0 }).l;
      materials.finish.metalness = THREE.MathUtils.lerp(materials.finish.metalness, lightness > 0.72 ? 0.62 : 0.43, Math.min(1, dt * 5));

      const signature = [values.engraving, values.engravingColor, values.engravingFont, values.engravingSize].join("|");
      if (signature !== lastSignature) {
        drawEngraving(markCanvas, values.engraving, values.engravingFont, values.engravingColor, values.engravingSize);
        markTexture.needsUpdate = true;
        lastSignature = signature;
      }
      (Object.keys(models) as CupShape[]).forEach((keyName) => {
        models[keyName].marks.forEach((mark) => {
          mark.visible = values.personalisable;
          mark.position.y = Number(mark.userData.baseY) + values.engravingY;
        });
      });
      renderer.render(scene, camera);
    };

    const start = () => {
      if (frame) return;
      visible = true;
      lastTime = performance.now();
      frame = requestAnimationFrame(render);
    };
    const stop = () => {
      visible = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { rootMargin: "160px" });
    visibilityObserver.observe(mount);
    renderer.render(scene, camera);
    setReady(true);
    start();

    return () => {
      setReady(false);
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((object) => { if (object instanceof THREE.Mesh) geometries.add(object.geometry); });
      geometries.forEach((geometry) => geometry.dispose());
      Object.values(materials).forEach((material) => material.dispose());
      markTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={mountRef} className={`three-cup ${ready ? "is-ready" : ""} ${className}`} role="img" aria-label={label}>
      <img className="three-cup-fallback" src={FALLBACKS[shape]} alt="" aria-hidden="true" />
    </div>
  );
}
