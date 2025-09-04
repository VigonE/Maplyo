# Maplyo - CRM Funnel with Interactive Map

Maplyo is a modern CRM application that combines prospect management with interactive map visualization. Manage your prospects on a map, track their progress through the sales funnel, and optimize your territorial sales strategy.

## ✨ Features

- **Interactive Map**: Visualize your prospects on a map with bubbles proportional to potential revenue
- **Prospect Management**: Add, edit, and delete prospects easily
- **Sales Funnel**: Track prospect evolution (Prospect → Quote → Order → Won/Lost)
- **Geolocation**: Automatic address geocoding to GPS coordinates
- **Drag & Drop**: Reorganize prospects by priority
- **Custom Colors**: Assign colors to categorize your prospects
- **Authentication**: Secure login system (each user has their own funnel)
- **Responsive Design**: Adaptive interface for all screens

## 🛠 Technologies

### Frontend
- **Vue.js 3** with Composition API
- **Vue Router** for navigation
- **Pinia** for state management
- **Leaflet** for interactive mapping
- **Tailwind CSS** for design
- **Vite** as build tool

### Backend
- **Express.js** Node.js server
- **MySQL** database
- **JWT** authentication
- **bcryptjs** password hashing
- **node-geocoder** address geolocation

## 🚀 Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Database Configuration

1. Create a MySQL database:
```sql
CREATE DATABASE maplyo;
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Configure variables in `.env`:
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=maplyo
JWT_SECRET=your_very_long_and_complex_secret_key
```

### Dependencies Installation

```bash
# Install dependencies
npm install
```

### Application Launch

```bash
# Start backend server (port 3001)
npm run server:dev

# In another terminal, start frontend (port 3000)
npm run dev
```

The application will be accessible at `http://localhost:3000`

## 📊 Project Structure

```
maplyo/
├── src/                    # Vue.js Frontend
│   ├── components/         # Reusable Vue components
│   ├── views/             # Main pages
│   ├── stores/            # Pinia state management
│   ├── services/          # API services
│   └── router/            # Route configuration
├── server/                # Express.js Backend
│   └── index.cjs         # Main server
├── public/               # Static assets
└── ...
```

## 🎯 Usage

### 1. Login/Registration
- Create an account or sign in
- Each user has their own prospect space

### 2. Prospect Management
- **Add**: Click "Add Prospect"
- **Edit**: Click the pencil icon
- **Delete**: Click the trash icon
- **Reorder**: Drag and drop prospects in the list

### 3. Map Visualization
- Prospects appear on the map with colored bubbles
- Bubble size is proportional to potential revenue
- Click on a bubble to see details
- Map automatically adapts to display all prospects

### 4. Funnel Tracking
- **Prospect**: Initial contact
- **Quote**: Quote sent
- **Order 1M**: Order expected within 1 month
- **Order 6M**: Order expected within 6 months
- **Won**: Deal closed
- **Lost**: Deal lost

## 🔧 Advanced Configuration

### Map Customization
- Modify `src/components/MapView.vue` to change tile provider
- Default: OpenStreetMap (free, no API key required)

### Database
- Tables are created automatically at startup
- Performance-optimized structure
- Index support for fast queries

## 🐛 Troubleshooting

### Geolocation Issues
- Check that addresses are complete and correct
- Service uses OpenStreetMap Nominatim (free but rate-limited)

### Database Issues
```bash
# Check MySQL connection
mysql -u root -p
USE maplyo;
SHOW TABLES;
```

### Permission Issues
```bash
# Check Node.js permissions
node --version
npm --version
```

## 🚀 Deployment

### Production
1. Configure environment variables
2. Build frontend: `npm run build`
3. Start server: `npm run server`

### Docker (optional)
A Dockerfile will be provided in a future version.

## 📝 Development

### Architecture
- **Frontend**: Vue.js SPA with client-side routing
- **Backend**: REST API with JWT authentication
- **Database**: MySQL with optimized relationships

### Contributions
Contributions are welcome! Check GitHub issues for planned improvements.

## 📄 License

MIT License - See LICENSE file for details.

---

**Maplyo** - Transform your sales strategy with the power of mapping! 🗺️💼
