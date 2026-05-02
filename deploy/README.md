# Deploy

This repo now deploys as:

- `app`: Spring Boot serving `/api` and the exported Next.js frontend
- `nginx`: public TLS termination and reverse proxy

The production database target is Supabase Postgres. Large assets can move to
R2 later without changing this runtime shape.

## Server bootstrap

1. Install Docker Engine and Docker Compose v2 on the Oracle host.
2. Create the deploy directory:

   ```bash
   sudo mkdir -p /opt/hood
   sudo chown $USER:$USER /opt/hood
   ```

3. Provision the TLS certificate on the Oracle host. One workable path is:

   ```bash
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   sudo certbot certonly --standalone -d hood.example.com
   ```

   This writes the certs under `/etc/letsencrypt/live/hood.example.com/`.

4. Copy `deploy/.env.example` to `/opt/hood/.env` and fill in real values.

   Set `HOOD_CERT_ROOT=/etc/letsencrypt` so the `nginx` container can read
   `/etc/letsencrypt/live/<domain>/fullchain.pem` and `privkey.pem`.

## GitHub Actions secrets

Create these repository secrets:

- `ORACLE_HOST`
- `ORACLE_USER`
- `ORACLE_SSH_KEY`
- `ORACLE_PORT` (optional, defaults to `22`)
- `ORACLE_DEPLOY_PATH` (optional, defaults to `/opt/hood`)

The workflow builds the boot jar, bakes it into a container image, pushes
`ghcr.io/<owner>/hood:latest`, uploads `compose.yaml` and
`nginx.conf.template`, then runs `docker compose pull && docker compose up -d`
over SSH.

## Manual deploy

If you need to deploy outside Actions:

```bash
./gradlew bootJar
docker build -t ghcr.io/<owner>/hood:manual .
export HOOD_IMAGE=ghcr.io/<owner>/hood:manual
docker compose -f deploy/compose.yaml --env-file deploy/.env.example up -d
```

For the real server, use `/opt/hood/.env` instead of the example file.

After a host-side certificate renewal, reload nginx:

```bash
cd /opt/hood
docker compose exec nginx nginx -s reload
```
