"use client";

import type { CSSProperties, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  ThreeCup,
  type CupShape,
  type EngravingFont,
} from "@/components/three-cup";

export type PageKind =
  | "home"
  | "all-cups"
  | "coffee-cups"
  | "thermal-mugs"
  | "bottles"
  | "sets-gifts"
  | "engraving"
  | "b2b";

type Product = {
  name: string;
  size: string;
  shape: CupShape;
  category: "Coffee cups" | "Thermal mugs" | "Bottles";
  use: string;
  details: string;
  price: string;
  compareAt?: string;
  color: string;
  image: string;
  personalisable: boolean;
  dimensions: string;
};

type ModelContextLike = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};

declare global {
  interface Document {
    modelContext?: ModelContextLike;
  }
}

const HERO_VIDEO =
  "https://ik.imagekit.io/czcabkjqn/gemini-video-1789580408518-clean.mp4?tr=orig";

const NAV_ITEMS: Array<[string, string, PageKind]> = [
  ["All cups", "/all-cups", "all-cups"],
  ["Coffee cups", "/coffee-cups", "coffee-cups"],
  ["Thermal mugs", "/thermal-mugs", "thermal-mugs"],
  ["Bottles", "/bottles", "bottles"],
  ["Sets & Gifts", "/sets-gifts", "sets-gifts"],
  ["Engraving", "/engraving", "engraving"],
  ["B2B", "/b2b", "b2b"],
];

const PRODUCTS: Product[] = [
  {
    name: "Espresso",
    size: "80 ml",
    shape: "espresso",
    category: "Coffee cups",
    use: "Espresso & ristretto",
    details: "Double-wall · 304 steel",
    price: "€16",
    compareAt: "€21",
    color: "#d8d0c4",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/bezowy-black-cap_a4852afb-844c-4d6d-8dc8-efdc1fd715c0.png?v=1774964075&width=1000",
    personalisable: true,
    dimensions: "61 × Ø69 mm",
  },
  {
    name: "Cortado",
    size: "150 ml",
    shape: "cortado",
    category: "Coffee cups",
    use: "Cortado & flat white",
    details: "Double-wall · 304 steel",
    price: "€23",
    color: "#b99b5f",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/golden-2-black-cap_e6c862d0-b260-4085-83a2-571b1ff2b846.png?v=1774965085&width=1000",
    personalisable: true,
    dimensions: "80 × Ø74 mm",
  },
  {
    name: "Cappuccino",
    size: "240 ml",
    shape: "cappuccino",
    category: "Coffee cups",
    use: "Cappuccino & latte",
    details: "Double-wall · 304 steel",
    price: "€27",
    color: "#c79387",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/rozowe-zloto-black-cap_e9644dd4-7891-41d9-8578-fb9e37bfd12d.png?v=1774964815&width=1000",
    personalisable: true,
    dimensions: "91 × Ø87 mm",
  },
  {
    name: "Americano",
    size: "350 ml",
    shape: "americano",
    category: "Coffee cups",
    use: "Americano & tea",
    details: "Double-wall · 304 steel",
    price: "€33",
    color: "#142a48",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/darkBlue-black-cap.jpg?v=1788294151&width=1000",
    personalisable: true,
    dimensions: "106 × Ø92 mm",
  },
  {
    name: "Urban",
    size: "300 ml",
    shape: "urban",
    category: "Thermal mugs",
    use: "Short commutes",
    details: "6h hot · 12h cold",
    price: "€38",
    color: "#1d2127",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/small_black_1.png?v=1786375688&width=1100",
    personalisable: true,
    dimensions: "Base Ø58 mm",
  },
  {
    name: "Everyday",
    size: "380 ml",
    shape: "everyday",
    category: "Thermal mugs",
    use: "The daily carry",
    details: "6h hot · 12h cold",
    price: "€32",
    color: "#16191d",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/380ml.jpg?v=1786449083&width=1200",
    personalisable: true,
    dimensions: "380 ml",
  },
  {
    name: "On-the-Go",
    size: "510 ml",
    shape: "on-the-go",
    category: "Thermal mugs",
    use: "Longer days",
    details: "6h hot · 12h cold",
    price: "€36",
    color: "#e4e5e3",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/510ml.jpg?v=1786449192&width=1200",
    personalisable: true,
    dimensions: "510 ml",
  },
  {
    name: "Everest",
    size: "900 ml",
    shape: "everest",
    category: "Thermal mugs",
    use: "The whole shift",
    details: "Handle · 6h hot · 12h cold",
    price: "€54",
    color: "#e6e6e2",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/big_white_1.png?v=1786375399&width=1200",
    personalisable: true,
    dimensions: "900 ml",
  },
  {
    name: "Active",
    size: "750 ml",
    shape: "active",
    category: "Bottles",
    use: "All-day hydration",
    details: "8h hot · 12h cold",
    price: "€35",
    color: "#e0ddd4",
    image:
      "https://coffeecupshop.eu/cdn/shop/files/ecru_1.png?v=1774963807&width=1200",
    personalisable: false,
    dimensions: "750 ml",
  },
];

const FINISHES = [
  ["Porcelain", "#ded8ce"],
  ["Graphite", "#202328"],
  ["Midnight", "#122b4d"],
  ["Cobalt", "#285aa8"],
  ["Terracotta", "#b84e38"],
  ["Rose", "#d9a3ad"],
  ["Pistachio", "#9aab82"],
  ["Titanium", "#a2a5a6"],
] as const;

const TEXT_FINISHES = [
  ["Silver", "#d8d9d7"],
  ["White", "#ffffff"],
  ["Graphite", "#1d2024"],
  ["Brass", "#c79a4b"],
] as const;

const FONT_OPTIONS: Array<[string, EngravingFont]> = [
  ["Modern", "modern"],
  ["Serif", "serif"],
  ["Script", "script"],
  ["Mono", "mono"],
];

const PAGE_HERO: Record<Exclude<PageKind, "home">, {
  eyebrow: string;
  title: string;
  copy: string;
  shape: CupShape;
  image: string;
  imageAlt: string;
  imagePosition: string;
  accent: string;
  sequence: string;
  stat: string;
  statLabel: string;
  secondStat: string;
  secondLabel: string;
  cta: string;
  href: string;
  mediaLabel: string;
}> = {
  "all-cups": {
    eyebrow: "The complete collection",
    title: "Built as a collection. Chosen one by one.",
    copy: "Nine distinct forms for coffee, commutes, meetings and all-day carry.",
    shape: "cappuccino",
    image: "https://coffeecupshop.eu/cdn/shop/files/5n8a0570_1.png?v=1780403053&width=1800",
    imageAlt: "Colourful CoffeeCups beside an espresso machine",
    imagePosition: "63% 60%",
    accent: "#e6ae4d",
    sequence: "01",
    stat: "09",
    statLabel: "distinct forms",
    secondStat: "304",
    secondLabel: "stainless steel",
    cta: "Explore in the studio",
    href: "#studio",
    mediaLabel: "THE COMPLETE RANGE / REAL PRODUCT PHOTOGRAPHY",
  },
  "coffee-cups": {
    eyebrow: "Coffee cups · 80–350 ml",
    title: "Small formats. Serious presence.",
    copy: "Four correctly proportioned cups for espresso through americano, each with its own measured engraving area.",
    shape: "cortado",
    image: "https://coffeecupshop.eu/cdn/shop/files/Kubek_240_reka_beige.png?v=1788175428&width=1000",
    imageAlt: "A hand holding a stainless-steel coffee cup filled with coffee",
    imagePosition: "68% 64%",
    accent: "#e58b58",
    sequence: "02",
    stat: "04",
    statLabel: "café formats",
    secondStat: "80–350",
    secondLabel: "millilitres",
    cta: "Choose your coffee cup",
    href: "#studio",
    mediaLabel: "COFFEE, HELD IN THE REAL WORLD",
  },
  "thermal-mugs": {
    eyebrow: "Thermal mugs · 300–900 ml",
    title: "Made for longer days.",
    copy: "Four different thermal forms, from the compact Urban to the handled Everest.",
    shape: "everyday",
    image: "https://coffeecupshop.eu/cdn/shop/files/5N8A1530_1.png?v=1780403190&width=1800",
    imageAlt: "Two people raising personalised thermal tumblers",
    imagePosition: "62% 56%",
    accent: "#9bcbd7",
    sequence: "03",
    stat: "6h",
    statLabel: "keeps drinks hot",
    secondStat: "12h",
    secondLabel: "keeps drinks cold",
    cta: "Find your thermal mug",
    href: "#studio",
    mediaLabel: "TWO SIZES / TWO REAL DAILY RITUALS",
  },
  bottles: {
    eyebrow: "Active · 750 ml",
    title: "One bottle. All day yours.",
    copy: "A rounded-shoulder steel bottle with a matching cap and carry loop. Hot for 8 hours, cold for 12.",
    shape: "active",
    image: "/media/active-lifestyle-photo.webp",
    imageAlt: "Active bottle on a stone terrace beside a bicycle",
    imagePosition: "61% center",
    accent: "#d6dfc8",
    sequence: "04",
    stat: "750",
    statLabel: "millilitres",
    secondStat: "8h / 12h",
    secondLabel: "hot / cold",
    cta: "See Active up close",
    href: "#studio",
    mediaLabel: "ACTIVE / OUTSIDE FROM MORNING TO EVENING",
  },
  "sets-gifts": {
    eyebrow: "Sets & gifts",
    title: "Four cups. Four stories.",
    copy: "Choose one size and colour, then give every cup its own name or message.",
    shape: "espresso",
    image: "https://coffeecupshop.eu/cdn/shop/files/WhatsApp_Image_2026-08-31_at_09.14.05.jpg?v=1788160557",
    imageAlt: "Friends holding a set of personalised cups and tumblers",
    imagePosition: "70% center",
    accent: "#ef8c6b",
    sequence: "05",
    stat: "04",
    statLabel: "cups per set",
    secondStat: "+€5",
    secondLabel: "unique engraving each",
    cta: "Build a gift set",
    href: "#studio",
    mediaLabel: "ONE COLOUR / A DIFFERENT STORY ON EACH CUP",
  },
  engraving: {
    eyebrow: "Personalisation studio",
    title: "Make the cup unmistakably yours.",
    copy: "Choose type, finish, scale and position directly on the real product form.",
    shape: "cappuccino",
    image: "/media/engraving-workshop-photo.webp",
    imageAlt: "A craftsperson positioning a steel tumbler in a laser engraver",
    imagePosition: "center",
    accent: "#e4ad58",
    sequence: "06",
    stat: "€5",
    statLabel: "per piece",
    secondStat: "48h",
    secondLabel: "dispatch",
    cta: "Open the engraving studio",
    href: "#studio",
    mediaLabel: "LASER ENGRAVED IN EUROPE",
  },
  b2b: {
    eyebrow: "For companies & cafés",
    title: "Your logo. Every morning.",
    copy: "Reusable drinkware for teams, hospitality, events and customer gifting from 30 pieces.",
    shape: "urban",
    image: "/media/b2b-cafe-team-photo.webp",
    imageAlt: "A café team with coordinated branded steel cups",
    imagePosition: "center",
    accent: "#7297ed",
    sequence: "07",
    stat: "30",
    statLabel: "piece minimum",
    secondStat: "5–10",
    secondLabel: "business days",
    cta: "Request a B2B quote",
    href: "#quote",
    mediaLabel: "FOR TEAMS / CAFÉS / EVENTS / CLIENTS",
  },
};

function Brand() {
  return (
    <a className="brand" href="/" aria-label="CoffeeCups home">
      <span>COFFEE</span><b>CUPS</b><small>.EU</small>
    </a>
  );
}

function Header({ kind, onSearch, onCart }: { kind: PageKind; onSearch: () => void; onCart: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="announcement">
        <span>Engraved in Europe · Ships in 48h</span>
        <span>Free EU shipping from €48</span>
        <span>4.8 / 5 from 847 reviews</span>
      </div>
      <header className="site-header">
        <Brand />
        <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Primary navigation">
          {NAV_ITEMS.map(([label, href, navKind]) => (
            <a key={href} href={href} className={kind === navKind ? "active" : ""}>{label}</a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="locale" aria-label="Language">EN</button>
          <button className="icon-button" aria-label="Search" onClick={onSearch}><Search size={19} /></button>
          <button className="icon-button" aria-label="Shopping bag" onClick={onCart}><ShoppingBag size={19} /><span>0</span></button>
          <button className="icon-button menu-button" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>
    </>
  );
}

function FilmIntro({ onReveal }: { onReveal: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const finished = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const [muted, setMuted] = useState(true);
  const reveal = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    video.current?.pause();
    setLeaving(true);
    onReveal();
  }, [onReveal]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    let touchY = 0;
    const wheel = (event: WheelEvent) => { event.preventDefault(); if (Math.abs(event.deltaY) > 3) reveal(); };
    const start = (event: TouchEvent) => { touchY = event.touches[0]?.clientY ?? 0; };
    const move = (event: TouchEvent) => { event.preventDefault(); if (Math.abs((event.touches[0]?.clientY ?? touchY) - touchY) > 12) reveal(); };
    const key = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "Escape"].includes(event.key) || (event.code === "Space" && !(event.target instanceof HTMLButtonElement))) { event.preventDefault(); reveal(); }
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("keydown", key);
    const fallback = window.setTimeout(reveal, 20000);
    video.current?.play().catch(reveal);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("keydown", key);
      window.clearTimeout(fallback);
    };
  }, [reveal]);

  return <div className={`film-intro${leaving ? " film-intro-leaving" : ""}`} role="dialog" aria-label="CoffeeCups opening film" aria-modal="true">
    <video ref={video} src={HERO_VIDEO} poster="/media/campaign-lineup.webp" autoPlay muted={muted} playsInline preload="auto" onEnded={reveal} onError={() => window.setTimeout(reveal, 2600)} />
    <button type="button" className="intro-sound" onClick={() => setMuted(!muted)} aria-label={muted ? "Unmute film" : "Mute film"}>{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
    <button type="button" className="intro-skip" onClick={reveal}>Skip intro <ArrowRight size={16} /></button>
  </div>;
}

function VideoHero() {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="video-hero">
      <video src={HERO_VIDEO} autoPlay muted={isMuted} loop playsInline preload="auto" poster="/media/campaign-lineup.webp" aria-label="CoffeeCups product range film" />
      <div className="video-scrim" />
      <button
        className="hero-sound-toggle"
        type="button"
        onClick={() => setIsMuted((muted) => !muted)}
        aria-label={isMuted ? "Turn video sound on" : "Mute video"}
        aria-pressed={!isMuted}
      >
        {isMuted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
        <span>{isMuted ? "Sound off" : "Sound on"}</span>
      </button>
      <div className="hero-copy">
        <p className="eyebrow">Reusable steel · Personalised for you</p>
        <h1>Pick your cup.<br /><em>Make it yours.</em></h1>
        <p>Distinct drinkware for companies, cafés and owners—designed around the way every cup is actually used.</p>
        <a className="button-primary" href="/all-cups">Shop all cups <ArrowRight size={18} /></a>
      </div>
      <div className="hero-proof" aria-label="Store proof">
        <span><b>9</b><small>distinct products</small></span>
        <span><b>14,000+</b><small>customers</small></span>
        <span><b>50,000+</b><small>cups in use</small></span>
      </div>
      <div className="hero-film-label"><span>PRODUCT FILM / 00:10</span><i /></div>
    </section>
  );
}

function PageHero({ kind }: { kind: Exclude<PageKind, "home"> }) {
  const data = PAGE_HERO[kind];
  return (
    <section
      className={`page-hero page-hero-${kind}`}
      style={{ "--hero-position": data.imagePosition, "--hero-accent": data.accent } as CSSProperties}
    >
      <div className="page-hero-media">
        <img src={data.image} alt={data.imageAlt} loading="eager" fetchPriority="high" />
        <div className="page-hero-scrim" />
      </div>
      <div className="page-hero-copy">
        <div className="page-hero-sequence"><span>{data.sequence}</span><i /></div>
        <p className="eyebrow">{data.eyebrow}</p>
        <h1>{data.title}</h1>
        <p>{data.copy}</p>
        <a className="page-hero-cta" href={data.href}>{data.cta} <ArrowRight size={18} /></a>
      </div>
      <div className="page-hero-facts" aria-label={`${data.eyebrow} key facts`}>
        <span><small>{data.statLabel}</small><strong>{data.stat}</strong></span>
        <span><small>{data.secondLabel}</small><strong>{data.secondStat}</strong></span>
      </div>
      <div className="page-hero-index"><span>{data.mediaLabel}</span><span>SCROLL TO EXPLORE</span></div>
    </section>
  );
}

function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Store promises">
      <span><Clock3 size={19} /><b>24h dispatch</b><small>Non-personalised</small></span>
      <span><Sparkles size={19} /><b>48h dispatch</b><small>With engraving</small></span>
      <span><ShieldCheck size={19} /><b>30-day returns</b><small>Standard products</small></span>
      <span><Check size={19} /><b>2-year statutory warranty</b><small>EU consumer protection</small></span>
    </section>
  );
}

function SectionTitle({ eyebrow, title, copy, link }: { eyebrow: string; title: string; copy?: string; link?: [string, string] }) {
  return (
    <div className="section-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
      {link && <a className="text-link" href={link[1]}>{link[0]} <ArrowRight size={17} /></a>}
    </div>
  );
}

function ProductStudio({ products, initialShape, onAdd }: { products: Product[]; initialShape?: CupShape; onAdd: (product: Product, engraving: string, color: string) => void }) {
  const firstIndex = Math.max(0, products.findIndex((item) => item.shape === initialShape));
  const [activeIndex, setActiveIndex] = useState(firstIndex);
  const [color, setColor] = useState(products[firstIndex]?.color ?? "#ded8ce");
  const [engraving, setEngraving] = useState("YOUR NAME");
  const [font, setFont] = useState<EngravingFont>("modern");
  const [textFinish, setTextFinish] = useState("#d8d9d7");
  const [textSize, setTextSize] = useState(88);
  const [textY, setTextY] = useState(0);
  const active = products[Math.min(activeIndex, products.length - 1)] ?? PRODUCTS[0];

  useEffect(() => {
    if (!initialShape) return;
    const nextIndex = products.findIndex((item) => item.shape === initialShape);
    if (nextIndex < 0) return;
    setActiveIndex(nextIndex);
    setColor(products[nextIndex].color);
  }, [initialShape, products]);

  function chooseProduct(index: number) {
    const next = products[index];
    setActiveIndex(index);
    setColor(next.color);
  }

  return (
    <section className="studio" id="studio">
      <div className="studio-heading">
        <div><p className="eyebrow">Live product studio</p><h2>Nine products.<br /><em>Nine real forms.</em></h2></div>
        <p>Each selection loads its own body geometry, proportions, lid system and camera framing at a precise three-quarter angle.</p>
      </div>
      <div className="product-rail" role="tablist" aria-label="Choose a product">
        {products.map((product, index) => (
          <button key={product.shape} className={index === activeIndex ? "active" : ""} onClick={() => chooseProduct(index)} role="tab" aria-selected={index === activeIndex}>
            <span>{String(index + 1).padStart(2, "0")}</span><b>{product.name}</b><small>{product.size}</small>
          </button>
        ))}
      </div>
      <div className="studio-grid">
        <div className="studio-model">
          <div className="model-aura" />
          <ThreeCup
            shape={active.shape}
            color={color}
            engraving={engraving}
            engravingColor={textFinish}
            engravingFont={font}
            engravingSize={textSize}
            engravingY={textY}
            personalisable={active.personalisable}
            label={`${active.name} ${active.size} configurable three-dimensional model`}
          />
          <div className="studio-model-meta"><span>PRODUCT / {String(activeIndex + 1).padStart(2, "0")}</span><span>{active.dimensions}</span></div>
        </div>
        <aside className="config-panel">
          <div className="config-product">
            <p>{active.category}</p>
            <h3>{active.name} <span>{active.size}</span></h3>
            <div><span>{active.use}</span><b>{active.price}</b></div>
          </div>
          <div className="control-group">
            <div className="control-label"><span>01</span><b>Cup finish</b><small>{FINISHES.find((item) => item[1] === color)?.[0] ?? "Custom"}</small></div>
            <div className="swatches">
              {FINISHES.map(([label, value]) => <button key={value} className={color === value ? "active" : ""} style={{ "--swatch": value } as CSSProperties} onClick={() => setColor(value)} aria-label={label} title={label} />)}
            </div>
          </div>
          {active.personalisable ? (
            <>
              <label className="control-group engraving-input">
                <span className="control-label"><span>02</span><b>Engraving text</b><small>{engraving.length} / 20</small></span>
                <input value={engraving} maxLength={20} onChange={(event) => setEngraving(event.target.value)} aria-label="Engraving text" />
              </label>
              <div className="control-group">
                <div className="control-label"><span>03</span><b>Typeface</b><small>{FONT_OPTIONS.find((item) => item[1] === font)?.[0]}</small></div>
                <div className="font-options">
                  {FONT_OPTIONS.map(([label, value]) => <button key={value} className={`${value} ${font === value ? "active" : ""}`} onClick={() => setFont(value)}>{label}</button>)}
                </div>
              </div>
              <div className="control-group compact-control">
                <div className="control-label"><span>04</span><b>Text finish</b><small>{TEXT_FINISHES.find((item) => item[1] === textFinish)?.[0]}</small></div>
                <div className="text-swatches">
                  {TEXT_FINISHES.map(([label, value]) => <button key={value} className={textFinish === value ? "active" : ""} style={{ "--swatch": value } as CSSProperties} onClick={() => setTextFinish(value)} aria-label={`${label} text`} title={label} />)}
                </div>
              </div>
              <label className="range-control"><span><b>Text size</b><small>{textSize}%</small></span><input type="range" min="52" max="112" value={textSize} onChange={(event) => setTextSize(Number(event.target.value))} /></label>
              <label className="range-control"><span><b>Vertical position</b><small>{textY === 0 ? "Centre" : textY > 0 ? "Higher" : "Lower"}</small></span><input type="range" min="-0.24" max="0.24" step="0.04" value={textY} onChange={(event) => setTextY(Number(event.target.value))} /></label>
              <div className="config-price"><span>Personalisation</span><b>+€5 / piece</b></div>
            </>
          ) : (
            <div className="bottle-specs"><span><b>8h</b><small>hot</small></span><span><b>12h</b><small>cold</small></span><p>Active 750 is intentionally sold without personalisation controls.</p></div>
          )}
          <button className="studio-cta" onClick={() => onAdd(active, engraving, color)}><span>{active.personalisable ? "Add configured cup" : "Add Active 750"}</span><b>{active.price}{active.personalisable ? " + €5" : ""}</b></button>
          {active.personalisable && <p className="config-note">One-side preview. Engraved items are made for you and cannot be returned.</p>}
        </aside>
      </div>
    </section>
  );
}

function ProductCard({ product, onConfigure }: { product: Product; onConfigure: (product: Product) => void }) {
  return (
    <article className="product-card">
      <button className="product-image" onClick={() => onConfigure(product)} aria-label={`Configure ${product.name}`}>
        <img src={product.image} alt={`${product.name} ${product.size}`} loading="lazy" />
        <span>{product.category}</span><i><ArrowUpRight size={17} /></i>
      </button>
      <div className="product-copy"><div><h3>{product.name}</h3><p>{product.size} · {product.use}</p></div><div className="product-price">{product.compareAt && <del>{product.compareAt}</del>}<b>{product.price}</b></div></div>
      <button className="product-action" onClick={() => onConfigure(product)}><span>View in 3D</span><ArrowRight size={16} /></button>
    </article>
  );
}

function ProductGrid({ products, onConfigure }: { products: Product[]; onConfigure: (product: Product) => void }) {
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.shape} product={product} onConfigure={onConfigure} />)}</div>;
}

function ProductCollection({ products, onConfigure, title = "Made for the way you drink." }: { products: Product[]; onConfigure: (product: Product) => void; title?: string }) {
  return (
    <section className="collection-section" id="collection">
      <SectionTitle eyebrow={`${products.length} distinct product forms`} title={title} copy="Real product photography, measured proportions and a dedicated 3D form for every size." />
      <ProductGrid products={products} onConfigure={onConfigure} />
    </section>
  );
}

function EngravingStory() {
  return (
    <section className="engraving-story">
      <figure><img src="/media/engraving-macro.webp" alt="Silver engraving on a curved cup surface" loading="lazy" /><figcaption>CURVED SURFACE / SILVER LASER</figcaption></figure>
      <div><p className="eyebrow">Personalisation, properly previewed</p><h2>Type that belongs<br /><em>on the object.</em></h2><p>Change the typeface, text finish, scale and vertical position. The preview follows the product curve instead of floating as a flat label.</p><ol><li><span>01</span><b>Choose your product</b></li><li><span>02</span><b>Set the cup finish</b></li><li><span>03</span><b>Style and position the mark</b></li><li><span>04</span><b>Review before production</b></li></ol><a className="text-link" href="/engraving">Open engraving studio <ArrowRight size={17} /></a></div>
    </section>
  );
}

function RangeFilm() {
  return (
    <section className="range-film">
      <div><p className="eyebrow">The complete family</p><h2>Different needs.<br /><em>One clear system.</em></h2><p>Compact coffee cups, thermal mugs with their own lid engineering, a handled 900 ml format and a rounded-shoulder bottle.</p><div className="range-metrics"><span><b>304</b><small>stainless steel</small></span><span><b>€5</b><small>engraving / piece</small></span><span><b>48h</b><small>engraved dispatch</small></span></div></div>
      <figure><video src={HERO_VIDEO} autoPlay muted loop playsInline preload="metadata" aria-label="CoffeeCups range video" /><figcaption><span>COFFEECUPS / RANGE FILM</span><span>00:10</span></figcaption></figure>
    </section>
  );
}

function StoreProof() {
  return (
    <section className="store-proof"><div><p className="eyebrow">Store-wide proof</p><h2>Built for daily use.</h2></div><div className="proof-grid"><article><b>4.8/5</b><span>847 store reviews</span></article><article><b>14,000+</b><span>customers</span></article><article><b>50,000+</b><span>cups in use</span></article></div></section>
  );
}

function B2BCallout() {
  return (
    <section className="b2b-callout"><div><p className="eyebrow">For companies & cafés</p><h2>Put your identity<br /><em>where mornings begin.</em></h2><p>From 30 pieces, with a proof before production and a 5–10 business-day lead time after approval.</p><a className="button-light" href="/b2b">Start a B2B project <ArrowUpRight size={18} /></a></div><figure><img src="/media/campaign-cups.webp" alt="Coordinated CoffeeCups product family" loading="lazy" /><figcaption>200+ COMPANY PROJECTS</figcaption></figure></section>
  );
}

function Specs({ kind }: { kind: PageKind }) {
  const rows = kind === "coffee-cups"
    ? PRODUCTS.slice(0, 4)
    : kind === "thermal-mugs"
      ? PRODUCTS.slice(4, 8)
      : kind === "bottles"
        ? PRODUCTS.slice(8)
        : PRODUCTS;
  return (
    <section className="specs-section"><SectionTitle eyebrow="Measured, not guessed" title="Choose with confidence." copy="Every model is tied to its real capacity, silhouette and use case." /><div className="spec-list">{rows.map((product) => <div key={product.shape}><b>{product.name}</b><span>{product.size}</span><span>{product.dimensions}</span><span>{product.use}</span></div>)}</div></section>
  );
}

function FAQ({ bottle = false }: { bottle?: boolean }) {
  const questions = bottle
    ? [
        ["How long does Active keep drinks warm or cold?", "Active 750 is designed for 8 hours hot and 12 hours cold."],
        ["Can Active be personalised?", "No. Active is sold without engraving or personalisation controls."],
        ["How should I care for it?", "Hand-wash only. It is not microwave-safe."],
      ]
    : [
        ["How much does personalisation cost?", "Engraving is €5 per piece. Bundle discounts apply to the cups, while engraving remains €5 per cup."],
        ["When will my order ship?", "Order by 11:00. Non-personalised products ship within 24 hours and engraved products within 48 hours."],
        ["How do bundle discounts work?", "Two pieces receive 10% off and three pieces receive 14% off."],
        ["Can engraved products be returned?", "Engraved products are made to your specification and cannot be returned. Standard products have a 30-day return policy."],
      ];
  return (
    <section className="faq-section"><SectionTitle eyebrow="Useful details" title="Before you choose." /><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>
  );
}

function SetsSection() {
  return (
    <section className="sets-section"><div><p className="eyebrow">The set rule</p><h2>4 × same size.<br />4 × same colour.<br /><em>4 × your story.</em></h2><p>Each cup can carry a different engraving for +€5 per cup.</p></div><div className="set-cards">{["New team", "Café opening", "Wedding table", "Thank you"].map((item, index) => <a href="/engraving" key={item}><span>0{index + 1}</span><b>{item}</b><ArrowUpRight size={18} /></a>)}</div></section>
  );
}

function B2BSections() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  return (
    <>
      <section className="b2b-proof"><div><b>200+</b><span>companies served</span></div><div><b>30</b><span>piece minimum</span></div><div><b>5–10</b><span>business days after proof</span></div></section>
      <section className="b2b-services">{[["01", "Company kits", "Onboarding, events and distributed teams."], ["02", "Café identity", "Reusable serviceware with a coherent finish."], ["03", "Client gifting", "Useful branded objects with individual names."]].map(([n, title, copy]) => <article key={title}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</section>
      <section className="quote-section" id="quote"><SectionTitle eyebrow="Start a project" title="Tell us what you need." copy="We will reply with product options, pricing and the artwork proof process." />{sent ? <div className="quote-success"><span><Check size={22} /></span><h3>Request prepared.</h3><p>Your project details are ready for the sales workflow.</p><button onClick={() => setSent(false)}>Create another request</button></div> : <form className="quote-form" onSubmit={submit}><label>Name<input required name="name" /></label><label>Company<input required name="company" /></label><label>Work email<input required type="email" name="email" /></label><label>Quantity<select defaultValue="30-99"><option>30-99</option><option>100-249</option><option>250-499</option><option>500+</option></select></label><label className="wide">Project details<textarea rows={4} name="details" placeholder="Products, colours, deadline and delivery country" /></label><label className="wide upload-field"><Upload size={21} /><span><b>Artwork</b><small>PNG, SVG or JPG · up to 10 MB</small></span><input type="file" accept=".png,.svg,.jpg,.jpeg" /></label><button className="studio-cta wide" type="submit"><span>Prepare quote request</span><ArrowRight size={18} /></button></form>}</section>
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top"><Brand /><p>Reusable stainless-steel drinkware.<br />Engraved in Europe · Ships in 48h.</p></div>
      <div className="footer-grid"><div><b>Shop</b><a href="/all-cups">All cups</a><a href="/coffee-cups">Coffee cups</a><a href="/thermal-mugs">Thermal mugs</a><a href="/bottles">Bottles</a></div><div><b>Personalise</b><a href="/engraving">Engraving studio</a><a href="/sets-gifts">Sets & Gifts</a><a href="/b2b">B2B projects</a></div><div><b>Service</b><span>Free EU shipping €48+</span><span>30-day returns</span><span>2-year statutory warranty</span></div><div><b>Languages</b><span>English</span><span>Deutsch</span><span>Nederlands</span><span>Français</span></div></div>
      <div className="footer-bottom">
        <span>© 2026 COFFEECUPSHOP.EU · ALL RIGHTS RESERVED</span>
        <span>304 STEEL · BPA-FREE · HAND-WASH</span>
        <a href="https://nocodefounder.site/" target="_blank" rel="author noreferrer">DESIGN &amp; DEVELOPMENT © NOCODEFOUNDER.SITE</a>
      </div>
      <a className="creator-watermark" href="https://nocodefounder.site/" target="_blank" rel="author noreferrer" aria-label="Original website by No Code Founder">
        <span>Original build by</span><strong>NoCodeFounder.site</strong>
      </a>
    </footer>
  );
}

function SearchPanel({ close }: { close: () => void }) {
  const [query, setQuery] = useState("");
  const results = PRODUCTS.filter((item) => `${item.name} ${item.size} ${item.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  return <div className="overlay"><button className="overlay-backdrop" onClick={close} aria-label="Close search" /><aside className="search-panel"><div className="overlay-title"><b>Search the range</b><button onClick={close} aria-label="Close"><X size={20} /></button></div><label><Search size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cup, size or category" /></label><div className="search-results">{results.map((item) => <a href={item.category === "Coffee cups" ? "/coffee-cups" : item.category === "Thermal mugs" ? "/thermal-mugs" : "/bottles"} key={item.shape}><img src={item.image} alt="" /><span><b>{item.name}</b><small>{item.size} · {item.use}</small></span><ArrowRight size={17} /></a>)}</div></aside></div>;
}

function CartPanel({ close, item }: { close: () => void; item: { product: Product; engraving: string; color: string } | null }) {
  return <div className="overlay"><button className="overlay-backdrop" onClick={close} aria-label="Close bag" /><aside className="cart-panel"><div className="overlay-title"><b>Your selection</b><button onClick={close} aria-label="Close"><X size={20} /></button></div>{item ? <div className="cart-item"><div className="cart-model"><ThreeCup shape={item.product.shape} color={item.color} engraving={item.engraving} personalisable={item.product.personalisable} /></div><p>{item.product.category}</p><h3>{item.product.name} <span>{item.product.size}</span></h3>{item.product.personalisable && <small>Engraving: {item.engraving || "YOUR NAME"} · +€5</small>}<div><b>Total preview</b><strong>{item.product.price}{item.product.personalisable ? " + €5" : ""}</strong></div><button className="studio-cta"><span>Continue to cart</span><ArrowRight size={18} /></button></div> : <div className="empty-cart"><span>00 ITEMS</span><h3>Your bag is ready for a good decision.</h3><p>Explore the range and add a configured product from the 3D studio.</p><a className="button-primary" href="/all-cups">Shop all cups <ArrowRight size={17} /></a></div>}</aside></div>;
}

export function StorefrontPage({ kind }: { kind: PageKind }) {
  const [introVisible, setIntroVisible] = useState(kind === "home");
  const [revealed, setRevealed] = useState(kind !== "home");
  const revealIntro = useCallback(() => setRevealed(true), []);
  useEffect(() => {
    if (!revealed || !introVisible) return;
    const timer = window.setTimeout(() => setIntroVisible(false), 1000);
    return () => window.clearTimeout(timer);
  }, [revealed, introVisible]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItem, setCartItem] = useState<{ product: Product; engraving: string; color: string } | null>(null);
  const [studioShape, setStudioShape] = useState<CupShape | undefined>(undefined);

  const scoped = useMemo(() => {
    if (kind === "coffee-cups" || kind === "sets-gifts") return PRODUCTS.filter((item) => item.category === "Coffee cups");
    if (kind === "thermal-mugs") return PRODUCTS.filter((item) => item.category === "Thermal mugs");
    if (kind === "bottles") return PRODUCTS.filter((item) => item.category === "Bottles");
    if (kind === "engraving") return PRODUCTS.filter((item) => item.personalisable);
    return PRODUCTS;
  }, [kind]);

  useEffect(() => {
    const controller = new AbortController();
    document.modelContext?.registerTool({
      name: "configure_product_preview",
      title: "Configure a CoffeeCups product preview",
      description: "Select a product shape, body finish and engraving text in the live studio.",
      inputSchema: { type: "object", properties: { product: { type: "string", enum: PRODUCTS.map((item) => item.shape) }, color: { type: "string" }, engraving: { type: "string", maxLength: 20 } }, required: ["product"] },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: (input) => ({ configured: true, ...(typeof input === "object" && input ? input : {}) }),
    }, { signal: controller.signal });
    return () => controller.abort();
  }, []);

  function configure(product: Product) {
    setStudioShape(product.shape);
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addToBag(product: Product, engraving: string, color: string) {
    setCartItem({ product, engraving, color });
    setCartOpen(true);
  }

  const title = kind === "coffee-cups" ? "Four café formats, properly proportioned." : kind === "thermal-mugs" ? "Four thermal forms for four different days." : kind === "bottles" ? "One bottle, engineered as itself." : "Made for the way you drink.";

  return (
    <>
    {introVisible && <FilmIntro onReveal={revealIntro} />}
    <div className={`site-shell${kind === "home" ? ` home-reveal${revealed ? " is-revealed" : ""}` : ""}`} inert={introVisible}>
      <Header kind={kind} onSearch={() => setSearchOpen(true)} onCart={() => setCartOpen(true)} />
      <main>
        {kind === "home" ? <VideoHero /> : <PageHero kind={kind} />}
        <TrustStrip />
        {kind === "home" && <RangeFilm />}
        {kind === "sets-gifts" && <SetsSection />}
        {kind === "b2b" ? <B2BSections /> : (
          <>
            <ProductStudio products={scoped} initialShape={studioShape ?? (kind === "home" ? "cappuccino" : PAGE_HERO[kind as Exclude<PageKind, "home">]?.shape)} onAdd={addToBag} />
            <ProductCollection products={scoped} onConfigure={configure} title={title} />
            {kind === "home" || kind === "engraving" ? <EngravingStory /> : <Specs kind={kind} />}
            {kind === "home" && <StoreProof />}
            <FAQ bottle={kind === "bottles"} />
            {kind !== "bottles" && <B2BCallout />}
          </>
        )}
      </main>
      <Footer />
      {searchOpen && <SearchPanel close={() => setSearchOpen(false)} />}
      {cartOpen && <CartPanel close={() => setCartOpen(false)} item={cartItem} />}
    </div>
    </>
  );
}
