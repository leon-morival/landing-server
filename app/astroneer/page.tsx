import type { Metadata } from "next";
import Link from "next/link";
import CopyAddressButton from "../components/CopyAddressButton";
import { astroneerServer } from "../lib/server-config";

const joinSteps = [
  {
    number: "1",
    title: "Lance Astroneer",
    text: "Ouvre le jeu avec ton compte habituel et une version à jour.",
  },
  {
    number: "2",
    title: "Ouvre le multijoueur",
    text: "Va dans les serveurs dédiés depuis le menu de coopération.",
  },
  {
    number: "3",
    title: "Ajoute l'adresse",
    text: `Renseigne ${astroneerServer.address} dans la connexion serveur.`,
  },
  {
    number: "4",
    title: "Rejoins la partie",
    text: "Connecte-toi au serveur et retrouve la base partagée.",
  },
];

export const metadata: Metadata = {
  title: "Astroneer | Le serveur de Leon",
};

export default function AstroneerPage() {
  return (
    <main className="astroneer-page notranslate" translate="no">
      <nav className="minecraft-nav" aria-label="Navigation Astroneer">
        <Link href="/" className="minecraft-brand">
          <HomeIcon />
          <span>Accueil</span>
        </Link>
        <div className="minecraft-nav-links">
          <Link href="/">Accueil</Link>
          <a href="#infos">Infos</a>
          <a href="#rejoindre">Rejoindre</a>
          <Link href="/minecraft">Minecraft</Link>
        </div>
      </nav>

      <section className="astroneer-hero" aria-labelledby="astroneer-title">
        <div className="astroneer-orbit" aria-hidden="true">
          <span className="astroneer-planet" />
          <span className="astroneer-moon" />
          <span className="astroneer-rover" />
        </div>

        <div className="minecraft-hero-content astroneer-hero-content">
          <h1 id="astroneer-title">Astroneer</h1>
          <p>Serveur dédié privé pour explorer, automatiser et construire entre amis.</p>

          <div className="server-address block-panel">
            <PlanetIcon />
            <span>{astroneerServer.address}</span>
          </div>

          <div className="minecraft-actions">
            <CopyAddressButton value={astroneerServer.address} />
          </div>
        </div>
      </section>

      <div className="minecraft-content">
        <section id="infos" className="minecraft-section">
          <div className="section-heading pixel-heading">
            <h2>Infos serveur</h2>
            <p>Les informations utiles pour te connecter.</p>
          </div>

          <div className="status-panel block-panel astroneer-info-panel">
            <InfoItem label="Adresse" value={astroneerServer.address} />
            <InfoItem label="Type" value={astroneerServer.access} />
            <InfoItem label="Jeu" value="Astroneer" />
            <InfoItem label="Accès" value="Privé" />
          </div>
        </section>

        <section id="rejoindre" className="minecraft-section">
          <div className="section-heading pixel-heading">
            <h2>Comment rejoindre</h2>
            <p>Quatre étapes pour entrer sur le serveur.</p>
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

type InfoItemProps = {
  label: string;
  value: string;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="status-item notranslate" translate="no">
      <span className="status-label">{label}</span>
      <strong className="status-value">{value}</strong>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m3 11 9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function PlanetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="5" />
      <path d="M3 12c4-5 14-7 18-3" />
      <path d="M4 15c5 4 13 5 17 0" />
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
