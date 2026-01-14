# Maplyo

Maplyo is an open-source CRM sales funnel optimized for territory teams that need to visualize prospects directly on an interactive map. The core application tracks prospects from first contact to close, overlays sales intelligence on geographic data, and gives distributed teams a unified pipeline view.

## What is Maplyo?
Maplyo combines a Vue.js single-page experience with an Express.js API and a MySQL data layer. Sales teams can geocode prospects, manage funnels, review forecasts, and collaborate on a shared map-driven workspace that stays performant even with large datasets.

## Open-core model
This repository contains the AGPLv3 open-source core. Commercial extensions are developed separately and may add proprietary integrations, analytics, or industry-specific features without being part of this codebase.

## Core features
- Interactive map view with geocoded prospects, clustering, and revenue-weighted markers
- Drag-and-drop sales funnel board with customizable stages and forecasting widgets
- Prospect, company, and user management, including status history and todos
- Secure authentication, basic RBAC, and audit-friendly change tracking
- CSV import/export helpers plus REST APIs for automation
- Built-in troubleshooting dashboards to highlight geocoding or data quality gaps

## Quickstart
### Prerequisites
- Node.js 18+
- npm 9+
- MySQL 8+ with a database user that can create schemas
- (Optional) Docker and Docker Compose if you plan to containerize later

### Local development (temporary steps)
1. TODO: Document the authoritative `.env` template for both frontend and backend services.
2. TODO: Provide an automated database migration workflow (scripts currently live under `/database/migrations`).
3. TODO: Publish sample data seeding instructions for demo environments.

While those TODOs are being finalized, you can run the core manually:

```bash
# Install dependencies
git clone https://github.com/Maplyo/Maplyo.git
cd Maplyo
npm install

# Configure environment
type .env.example > .env   # or copy manually and edit credentials

# Start services (run in separate terminals)
npm run server:dev   # Express API on http://localhost:3001
npm run dev          # Vite dev server on http://localhost:3000
```

### Docker Compose (coming soon)
Docker Compose definitions are the recommended way to bootstrap Maplyo in development and staging. The reference compose file is under active construction and will cover the Vue frontend, Express backend, MySQL, seeded data, and optional observability sidecars. Until the file lands in this repository, please rely on the local development steps above.

## Architecture overview
- **Frontend (Vue 3 + Vite)**: SPA housed under `/src`, using Pinia for state, Leaflet for mapping, and Tailwind CSS for styling.
- **Backend (Express.js)**: REST API entry point in `/server/index.cjs` plus supporting scripts under `/scripts` for provisioning and admin ops.
- **Database (MySQL)**: Schema migrations stored under `/database/migrations`, designed for ACID transactions and geospatial queries.
- **Geospatial services**: Map tiles and geocoding rely on Leaflet-compatible tile servers and Node Geocoder; swap providers through configuration.
- **Authentication & authorization**: JWT-based sessions with role-aware endpoints and guard helpers in `/src/stores/auth.js`.

## Commercial extensions boundary
The AGPL core exposes stable public REST endpoints, webhooks, and event hooks intended for extensions. The intended architecture keeps paid/closed extensions as separate processes or services that communicate over these APIs (HTTP, WebSocket, message bus, or other network boundaries). Because extensions run outside this repository and interact through published interfaces, they remain separate works while still respecting the AGPL obligations of the core.

## Licensing
Maplyo Core is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0-only). In plain language, you are free to run, study, modify, and redistribute the software, but if you offer a modified version of the core over a network you must make the corresponding source code available under the same license. See [LICENSE](LICENSE) for the full legal text.

## Contributions
Community contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the branching strategy, review expectations, Developer Certificate of Origin (DCO) sign-off requirements, and testing notes before opening a pull request.

## Security
Security vulnerabilities should be reported privately. Consult [SECURITY.md](SECURITY.md) for the current reporting process, contact details, and disclosure expectations.

## Support
Maplyo Core is supported by the community through GitHub Issues and Discussions, while commercial support and proprietary extensions are offered separately. For more detail see [SUPPORT.md](SUPPORT.md).

## Trademark / branding
“Maplyo” is used here purely as a project name; no trademark rights are granted by this repository.
