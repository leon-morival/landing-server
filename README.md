# Landing Server

Site Next.js pour les services de `leonmorival.xyz`.

## Minecraft whitelist

La page Minecraft contient un formulaire de candidature. Une demande valide envoie uniquement une notification dans le webhook configure avec :

- le pseudo Minecraft ;
- l'identifiant Discord renseigne ;
- le message du joueur.

Le site ne modifie pas directement la whitelist Minecraft.

Variable necessaire :

```bash
DISCORD_WHITELIST_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

## Developpement

```bash
npm install
npm run dev
```

Ouvre ensuite http://localhost:3000.

## Production Docker

Le plus simple sans CI/CD : le serveur clone le repo, puis Docker build et lance l'app.

```bash
git pull --ff-only
docker compose up -d --build
```

Le fichier `.env` du serveur doit contenir :

```bash
DISCORD_WHITELIST_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

Le compose utilise un reseau Docker externe nomme `nginx`. Cree-le une seule fois sur le serveur si besoin :

```bash
docker network create nginx
```

Le conteneur n'expose pas de port directement sur l'hote. Ton conteneur nginx doit etre sur le meme reseau Docker et proxy vers :

```text
http://landing-server:3000
```

Exemple de bloc nginx :

```nginx
server {
    listen 80;
    server_name leonmorival.xyz www.leonmorival.xyz;

    add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet, noimageindex" always;

    location / {
        proxy_pass http://landing-server:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Auto-update simple

Le script [scripts/update-from-git-docker.sh](scripts/update-from-git-docker.sh) verifie si `origin/main` a un nouveau commit. Si oui, il fait :

```bash
git pull --ff-only
docker compose up -d --build --remove-orphans
```

Sur Ubuntu, tu peux l'appeler toutes les minutes avec un timer systemd :

```ini
# /etc/systemd/system/landing-server-update.service
[Unit]
Description=Update landing-server from Git

[Service]
Type=oneshot
Environment=APP_DIR=/var/www/landing-server
Environment=BRANCH=main
ExecStart=/var/www/landing-server/scripts/update-from-git-docker.sh
```

```ini
# /etc/systemd/system/landing-server-update.timer
[Unit]
Description=Check landing-server Git updates

[Timer]
OnBootSec=2min
OnUnitActiveSec=1min
Persistent=true

[Install]
WantedBy=timers.target
```

Puis :

```bash
sudo chmod +x /var/www/landing-server/scripts/update-from-git-docker.sh
sudo systemctl daemon-reload
sudo systemctl enable --now landing-server-update.timer
```
