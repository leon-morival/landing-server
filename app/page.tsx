import Link from "next/link";
import HomeElement, {
  AstroneerIcon,
  JellyfinIcon,
  MinecraftIcon,
} from "./components/HomeElement";
import { astroneerServer, siteConfig } from "./lib/server-config";

export default function Home() {
  return (
    <main className="stellar-page home-page">
      <section className="home-shell" aria-labelledby="home-title">
        <nav className="home-nav" aria-label="Navigation principale">
          <Link href="/" className="brand-lockup" aria-label="Accueil">
            <span className="brand-mark">L</span>
            <span>{siteConfig.name}</span>
          </Link>
        </nav>

        <div className="home-hero">
          <h1 id="home-title">{siteConfig.title}</h1>
          <p>{siteConfig.description}</p>
        </div>

        <div className="service-grid" aria-label="Services disponibles">
          <HomeElement
            title="Jellyfin"
            description="Films, séries et bibliothèque privée."
            href={siteConfig.jellyfinUrl}
            actionLabel="Ouvrir"
            variant="jellyfin"
            external
          >
            <JellyfinIcon />
          </HomeElement>

          <HomeElement
            title="Minecraft"
            description="Infos, statut et carte live du monde."
            href={siteConfig.minecraftPath}
            actionLabel="Voir le serveur"
            variant="minecraft"
          >
            <MinecraftIcon />
          </HomeElement>

          <HomeElement
            title={astroneerServer.name}
            description="Infos et adresse du serveur dédié."
            href={siteConfig.astroneerPath}
            actionLabel="Voir le serveur"
            variant="astroneer"
          >
            <AstroneerIcon />
          </HomeElement>
        </div>

        <div className="home-footer-hint" aria-hidden="true">
          <span />
          <strong>Services privés</strong>
          <span />
        </div>
      </section>
    </main>
  );
}
