<div align="center">

# 🔗 shrtnr

### A modern, lightweight URL shortener built with Node.js

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg?cacheSeconds=2592000)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/casjaydns/shrtnr)
[![License: WTFPL](https://img.shields.io/badge/License-WTFPL-yellow.svg)](#)
[![Twitter: casjaysdev](https://img.shields.io/twitter/follow/casjaysdev.svg?style=social)](https://twitter.com/casjaysdev)

[Homepage](https://github.com/casjaydns/shrtnr) • [Demo](https://gitsh.vercel.app) • [Report Bug](https://github.com/casjaydns/shrtnr/issues) • [Request Feature](https://github.com/casjaydns/shrtnr/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [🐳 Docker Deployment](#-docker-deployment)
- [📡 API Documentation](#-api-documentation)
- [🛠️ Development](#️-development)
- [👤 Author](#-author)
- [🤝 Contributing](#-contributing)
- [⭐ Show your support](#-show-your-support)
- [📝 License](#-license)

---

## ✨ Features

- 🔗 **URL Shortening** - Create short, memorable links with optional custom slugs
- 📊 **Click Tracking** - Automatic analytics with click counters for each link
- 🎨 **Custom Branding** - Fully configurable project name and styling via environment variables
- 🌐 **Multiple Domains** - Support for 37+ domain names out of the box
- 🔒 **Rate Limiting** - Built-in protection against abuse (3 requests per 10 seconds)
- 📱 **Responsive UI** - Beautiful Dracula-themed interface that works on all devices
- 🔌 **RESTful API** - Complete API with JSON responses and console client support (curl, wget, httpie)
- 🚀 **Reverse Proxy Ready** - Automatic hostname detection from X-Forwarded headers
- 📄 **Pagination** - Browse all URLs with sorting options (newest/oldest)
- 🐳 **Docker Support** - Ready-to-deploy with Docker Compose
- 💾 **MongoDB Backend** - Reliable data storage with Monk ODM

---

## 🚀 Quick Start

### Prerequisites

- 📦 Node.js 18 or higher
- 🗄️ MongoDB (local or remote)
- 📝 Git

### Installation

1️⃣ **Clone the repository**

```bash
git clone https://github.com/casjaydns/shrtnr.git
cd shrtnr
```

2️⃣ **Install dependencies**

```bash
npm install
```

3️⃣ **Configure environment variables**

```bash
cp env.sample .env
```

Edit `.env` with your settings:

```env
PORT=2550
URLHOST=yourdomain.com
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/shrtnr

# Branding (optional)
PROJECT_NAME="shrtnr"
PROJECT_REPO="https://github.com/casjaydns/shrtnr"
```

4️⃣ **Start the server**

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

5️⃣ **Visit** `http://localhost:2550` 🎉

---

## ⚙️ Configuration

### Environment Variables

#### 🌐 **Hostname Configuration**

Set ONE of these (priority order):

```bash
URLHOST=yourdomain.com    # 1st priority
HOST=yourdomain.com       # 2nd priority
DOMAIN=yourdomain.com     # 3rd priority
HOSTNAME=yourdomain.com   # 4th priority
```

💡 If none are set, the app will auto-detect from request headers.

#### 🎨 **Branding Configuration**

```bash
PROJECT_NAME="Your Shortener"                    # Default: "shrtnr"
PROJECT_REPO="https://github.com/you/yourrepo"   # Default: casjaydns/shrtnr
```

#### 🗄️ **Database Configuration**

```bash
MONGODB_URI=mongodb://localhost:27017/shrtnr
```

#### 🔧 **Server Configuration**

```bash
PORT=2550                  # Default: 2550
NODE_ENV=production        # production or development
```

📚 See [CONFIGURATION.md](CONFIGURATION.md) for detailed configuration guide.

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start services (app + MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker only

```bash
# Build image
docker build -t shrtnr .

# Run container
docker run -d \
  -p 2550:2550 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/shrtnr \
  -e URLHOST=yourdomain.com \
  shrtnr
```

---

## 📡 API Documentation

### Create Short URL

```bash
curl -X POST http://localhost:2550/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/casjaydns/shrtnr",
    "slug": "github"
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "url": "https://github.com/casjaydns/shrtnr",
  "slug": "github",
  "clicks": 0,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "shortUrl": "http://localhost:2550/github"
}
```

### List All URLs

```bash
curl http://localhost:2550/api/urls?page=1&limit=10&sort=newest
```

### Redirect to Original URL

```bash
curl -L http://localhost:2550/github
# Redirects to https://github.com/casjaydns/shrtnr
```

🔗 Visit `/api` in your browser for interactive API documentation.

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev           # 🔥 Start development server with hot reload
npm run build-css     # 🎨 Build Tailwind CSS (watch mode)
npm start             # 🚀 Start production server
npm install           # 📦 Install dependencies
```

### Tech Stack

- **Backend:** Express.js, Node.js
- **Database:** MongoDB (Monk ODM)
- **Frontend:** Vue.js 2.6, Tailwind CSS (Dracula theme)
- **Build Tools:** Tailwind CSS
- **Deployment:** Docker, Nginx, Systemd

### Project Structure

```
shrtnr/
├── 📄 index.js              # Main Express server
├── 📦 package.json          # Dependencies and scripts
├── 🐳 Dockerfile            # Docker image definition
├── 🐳 docker-compose.yaml   # Multi-container setup
├── 📁 public/               # Static files
│   ├── 📄 index.html        # Home page
│   ├── 📄 list/             # URL list page
│   ├── 📄 about/            # About page
│   ├── 📄 api/              # API documentation
│   ├── 🎨 css/              # Stylesheets
│   └── 📜 js/               # JavaScript files
├── 📁 scripts/              # Deployment scripts
├── 📁 contrib/              # Nginx & systemd configs
└── 📚 CONFIGURATION.md      # Detailed config guide
```

---

## 👤 Author

**CasjaysDev**

- 🌐 Website: <http://malaks-us.github.io/jason>
- 🐦 Twitter: [@casjaysdev](https://twitter.com/casjaysdev)
- 💻 Github: [@casjay](https://github.com/casjay)
- 💬 Support: [CasjaysDev Support](https://help.casjay.pro)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/casjaydns/shrtnr/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⭐ Show your support

Give a ⭐️ if this project helped you!

[![Support via Patreon](https://img.shields.io/badge/Patreon-Support-orange.svg)](https://www.patreon.com/casjay)
[![Support via PayPal](https://img.shields.io/badge/PayPal-Donate-blue.svg)](https://www.paypal.me/casjaysdev)

---

## 📝 License

This project is licensed under the **WTFPL** License - see the [LICENSE.md](LICENSE.md) file for details.

Copyright © 1999-2024 [CasjaysDev](https://github.com/casjay)

---

<div align="center">

**Made with 💜 by [Jason M. Hempstead (Casjay)](https://github.com/casjay)**

[⬆ back to top](#-shrtnr)

</div>
