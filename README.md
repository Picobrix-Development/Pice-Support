# Pice-Support

Public support portal for Pop Up Pirate Dice mobile game.

## Features

- **Customer Support Hub** (`/support`) - Landing page with navigation to support features
- **1:1 Inquiry** (`/inquiry`) - Submit and view customer support tickets
- **Coupon Redemption** (`/redeem`) - Enter coupon codes and claim rewards

## Tech Stack

- **Frontend**: SvelteKit 2.x
- **Styling**: TailwindCSS 3.x
- **HTTP Client**: Axios
- **Deployment**: Azure Static Web Apps

## Local Development

### Prerequisites

- Node.js 18+
- Backend API running (Pice-Console-Api)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# .env is already configured for local development
# Connects to localhost:8002 (Live API) by default
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5174`

### Available Pages

- `/` - Redirects to `/support`
- `/support` - Customer support hub
- `/inquiry` - 1:1 inquiry submission and history
- `/redeem` - Coupon code redemption

## Build

```bash
npm run build
```

## Deployment

### Production URLs

- **Custom Domain**: https://support.popuppiratedice.com ✅
- **Azure URL**: https://delightful-pond-06af7b000.3.azurestaticapps.net
- **Resource Group**: PiceConsoleResource
- **Static Web App**: Pice-Support-Web

### Automatic Deployment

This project uses GitHub Actions for automatic deployment:

1. Push changes to `main` branch:
```bash
git add .
git commit -m "your commit message"
git push
```

2. GitHub Actions automatically builds and deploys to Azure Static Web Apps
3. Check deployment status: https://github.com/Picobrix-Development/Pice-Support/actions

### Environment Variables (Production)

Set in Azure Static Web Apps configuration:

**Azure Portal**:
- Navigate to: Static Web Apps → Pice-Support-Web → Configuration
- Add Application setting:
  ```
  VITE_LIVE_API_URL=https://pice-console-live-api.azurewebsites.net/api/v1
  ```

**Azure CLI**:
```bash
az staticwebapp appsettings set \
  --name Pice-Support-Web \
  --resource-group PiceConsoleResource \
  --setting-names VITE_LIVE_API_URL=https://pice-console-live-api.azurewebsites.net/api/v1
```

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## Project Structure

```
Pice-Support/
├── src/
│   ├── lib/
│   │   ├── api.js           # Axios API client
│   │   └── utils/
│   │       └── dateFormat.js # Date formatting utilities
│   ├── routes/
│   │   ├── support/         # Support hub page
│   │   ├── inquiry/         # Inquiry page
│   │   ├── redeem/          # Redeem page
│   │   ├── +layout.svelte   # Root layout (simple, no auth)
│   │   └── +page.svelte     # Root page (redirects to /support)
│   ├── app.css              # Global styles
│   └── app.html             # HTML template
├── static/                  # Static assets
├── .env                     # Environment variables
└── package.json             # Dependencies
```

## Related Projects

- **Pice-Console**: Admin console for game management
- **Pice-Console-Api**: Backend API (FastAPI)

## License

Private - Picobrix Development
