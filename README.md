# devagent

Prototype UI for the Dev Agent tutorial flow (repo sidebar, task picker, mock agent run, and details modal). Everything runs in the browser; there is no backend.

## Prerequisites

- **Node.js** 18 or newer (20 LTS recommended)
- **npm** 9+ (ships with recent Node installers)

Check versions:

```bash
node -v
npm -v
```

## Run locally

From this directory (`devagent`):

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the Vite dev server (hot reload):

   ```bash
   npm run dev
   ```

3. Open the URL Vite prints (usually `http://localhost:5173`) in your browser.

## Other scripts

| Command        | Purpose                                      |
| -------------- | -------------------------------------------- |
| `npm run build` | Typecheck and production build to `dist/`   |
| `npm run preview` | Serve the production build locally for smoke testing |

No environment variables or API keys are required for local development.
