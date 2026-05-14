# Deploy

This repo now deploys as:

- `app`: Spring Boot serving `/api` and the exported Next.js frontend
- `host nginx`: Oracle host-level reverse proxy, shared with other projects

The production database target is Supabase Postgres. Axis 1 report photos are
stored through the asset-storage abstraction, with R2 enabled in production.

## Server bootstrap

1. Install Docker Engine and Docker Compose v2 on the Oracle host.
2. Make sure `kitchenpermit.com` points to the Oracle public IP.

   ```bash
   dig +short kitchenpermit.com
   ```

3. Add a host nginx site entry for `kitchenpermit.com`.
4. Point that host entry at `127.0.0.1:8810`.
5. Keep Cloudflare in front, matching the same pattern used by `CarMoneyPit`.

Use [deploy/host-nginx-kitchenpermit.conf](C:/Development/Owner/hood/deploy/host-nginx-kitchenpermit.conf)
as the starting point.

No manual `/opt/hood/.env` file is required for the production workflow.
The GitHub Action writes only `docker-compose.yml` on the server, following the
same pattern as `CarMoneyPit`.

## GitHub Actions secrets

Create these repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `OCI_HOST`
- `OCI_USERNAME`
- `OCI_KEY`
- `APP_DATASOURCE_URL`
- `APP_DATASOURCE_USERNAME`
- `APP_DATASOURCE_PASSWORD`
- `GEMINI_API_KEY` (optional)
- `HOOD_AXIS1_ASSET_STORAGE_DRIVER` (`r2` when R2 is ready)
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ENDPOINT`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_REGION` (`auto`)
- `CLOUDFLARE_R2_KEY_PREFIX` (`axis1-reports`)
- `HOOD_BILLING_PROVIDER` (`paddle` when billing is ready)
- `HOOD_BILLING_ENVIRONMENT` (`sandbox` while testing, `production` when live)
- `PADDLE_COMPANY_PRICE_ID`

The workflow maps those Cloudflare secret names into Spring-friendly
`HOOD_AXIS1_R2_*` environment variables inside the app container.

For Supabase, use the transaction pooler URL on port `6543` with
`prepareThreshold=0`, for example:

```text
jdbc:postgresql://aws-1-region.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
```

Current production constants are written by the workflow itself:

- base url: `https://kitchenpermit.com`
- support email: `support@kitchenpermit.com`
- published app port: `8810`
- database keepalive: enabled, first ping after 60 seconds, then every 12 hours

The workflow now mirrors `CarMoneyPit`:

- builds and pushes `DOCKERHUB_USERNAME/kitchenpermit:latest`
- SSHes into OCI
- writes `~/deploy/hood/docker-compose.yml`
- stops the previous container, pulls the image, starts it, and verifies
  `http://127.0.0.1:8810/`

## Manual deploy

If you need to deploy outside Actions, the workflow-generated compose is the
source of truth. The host nginx sample file remains a manual step:

```bash
./gradlew bootJar
docker build -t <dockerhub-user>/kitchenpermit:manual .
docker push <dockerhub-user>/kitchenpermit:manual
```

Then update `~/deploy/hood/docker-compose.yml` on the server to point at the
manual image tag if needed.

After changing the host nginx config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```
