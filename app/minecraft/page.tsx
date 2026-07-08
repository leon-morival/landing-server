import Image from "next/image";
import Link from "next/link";
import CopyAddressButton from "../components/CopyAddressButton";
import MinecraftStatus from "../components/MinecraftStatus";
import { minecraftServer, siteConfig } from "../lib/server-config";

const joinSteps = [
  {
    number: "1",
    title: "Lance Minecraft Java",
    text: "Utilise ton launcher habituel avec la version Java recommandée par le serveur.",
  },
  {
    number: "2",
    title: "Ajoute le serveur",
    text: `Renseigne ${minecraftServer.address} dans la liste multijoueur.`,
  },
  {
    number: "3",
    title: "Demande l'accès",
    text: "Le serveur fonctionne avec une whitelist pour garder un espace privé.",
  },
  {
    number: "4",
    title: "Explore la map",
    text: "Une fois connecté, retrouve les constructions sur la carte live.",
  },
];

export default function MinecraftPage() {
  return (
    <main className="minecraft-page">
      <nav className="minecraft-nav" aria-label="Navigation Minecraft">
        <Link href="/" className="minecraft-brand">
          <SwordIcon />
          <span>{siteConfig.name}</span>
        </Link>
        <div className="minecraft-nav-links">
          <Link href="/">Accueil</Link>
          <a href="#statut">Statut</a>
          <a href="#rejoindre">Rejoindre</a>
          <a href={minecraftServer.mapUrl} target="_blank" rel="noopener noreferrer">
            Carte
          </a>
        </div>
      </nav>

      <section className="minecraft-hero" aria-labelledby="minecraft-title">
        <Image
          src="/assets/minecraft-night.png"
          alt=""
          fill
          sizes="100vw"
          priority
          className="minecraft-hero-image"
        />
        <div className="minecraft-hero-content">
          <h1 id="minecraft-title">Minecraft Survie</h1>
          <p>Un monde privé pour construire, explorer et jouer entre amis.</p>

          <div className="server-address block-panel">
            <DiamondIcon />
            <span>{minecraftServer.address}</span>
          </div>

          <div className="minecraft-actions">
            <CopyAddressButton value={minecraftServer.address} />
            <a
              className="map-button"
              href={minecraftServer.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapIcon />
              <span>Ouvrir la map</span>
            </a>
          </div>
        </div>
      </section>

      <div className="minecraft-content">
        <MinecraftStatus />

        <section id="rejoindre" className="minecraft-section">
          <div className="section-heading pixel-heading">
            <h2>Comment rejoindre</h2>
            <p>Quatre étapes pour entrer dans le monde.</p>
          </div>

          <div className="steps-grid">
            {joinSteps.map((step) => (
              <article className="step-card block-panel" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="minecraft-section map-section" aria-labelledby="map-title">
          <div className="map-preview block-panel" aria-hidden="true">
            <div className="map-island">
              <span className="map-pin" />
            </div>
          </div>
          <div className="map-copy">
            <h2 id="map-title" className="pixel-heading">
              Carte live
            </h2>
            <p>Explore le monde en temps réel depuis ton navigateur.</p>
            <a
              className="large-map-link"
              href={minecraftServer.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapIcon />
              <span>map.leonmorival.xyz</span>
              <ArrowIcon />
            </a>
          </div>
        </section>

        <div className="minecraft-back">
          <Link href="/" className="back-home-link">
            <ArrowLeftIcon />
            <span>Retour accueil</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function SwordIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M14.6 4h5.4v5.4L9 20.4 3.6 15z" />
      <path d="M5.8 12.8 11.2 18" />
      <path d="M4 20 8 16" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 2 8 8-8 12-8-12z" />
      <path d="M4 10h16" />
      <path d="m8 10 4 12 4-12" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 12h12" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M19 12H7" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  );
}
