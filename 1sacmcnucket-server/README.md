# 1SacMcNucket — Personal Image Archive Server

A real backend for your image archive: a small Node/Express server that
stores uploaded images on disk and serves the gallery to any browser
that can reach it.

## Run it locally

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

Images are saved to the `uploads/` folder, and their metadata (name,
id, timestamp) is tracked in `db.json`. Both are created automatically
on first run.

## Put it on the public internet

Running it on your own machine only makes it reachable on your local
network. To get a real public URL, deploy it to a host that runs
Node.js servers. Good free/cheap options:

- **Render.com** — connect a GitHub repo, pick "Web Service," it
  detects `npm start` automatically.
- **Railway.app** — same idea, very quick from a GitHub repo or the CLI.
- **Fly.io** — `fly launch` in this folder, follow the prompts.
- A **VPS** (DigitalOcean, Linode, etc.) if you want full control —
  run with `pm2` or a `systemd` service so it stays up, and put it
  behind Nginx with a free HTTPS cert from Let's Encrypt.

Whichever you pick, the steps are the same:
1. Push this folder to a GitHub repo (or upload it directly if the
   host allows).
2. Set the start command to `npm start` (already in `package.json`).
3. The host gives you a public URL — that's your live site.

**One thing to watch:** most free hosts wipe the filesystem on
redeploy or restart (this is called an "ephemeral" filesystem), which
would delete your uploaded images. For anything you want to keep
long-term, either:
- pick a host with a persistent disk/volume (Render and Railway both
  offer this, sometimes on a paid tier), or
- swap local disk storage for a proper object store like
  **Cloudflare R2** or **AWS S3** — I can help wire that up if you'd
  like.

## API

| Method | Path              | Description                    |
|--------|-------------------|---------------------------------|
| GET    | `/api/images`     | List all stored images          |
| POST   | `/api/images`     | Upload images (`multipart/form-data`, field name `images`) |
| DELETE | `/api/images/:id` | Delete one image                |
