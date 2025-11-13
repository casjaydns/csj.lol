# Configuration Guide

## Environment Variables

### Required Variables
- `PORT` - Server port (default: 2550)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://127.0.0.1:27017/shrtnr)
- `NODE_ENV` - Environment mode: development or production (default: development)

### Optional Variables

#### Hostname Configuration
Set ONE of these (priority order):
1. `URLHOST` - Primary hostname variable
2. `HOST` - Alternative hostname variable
3. `DOMAIN` - Alternative hostname variable  
4. `HOSTNAME` - Alternative hostname variable

If none are set, the hostname will be auto-detected from request headers.

#### Branding Configuration
- `PROJECT_NAME` - Project display name (default: "shrtnr")
- `PROJECT_REPO` - Repository URL (default: "https://github.com/casjaydns/shrtnr")

## Example .env File

```bash
# Server Configuration
PORT=2550
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/shrtnr

# Hostname (choose one or let it auto-detect)
URLHOST=myshortener.com

# Branding
PROJECT_NAME="My URL Shortener"
PROJECT_REPO="https://github.com/myorg/myrepo"
```

## How It Works

### Backend
The server reads environment variables on startup and serves them via `/api/config` endpoint:

```json
{
  "projectName": "shrtnr",
  "projectRepo": "https://github.com/casjaydns/shrtnr"
}
```

### Frontend
All pages load `config.js` which:
1. Fetches configuration from `/api/config`
2. Updates page titles dynamically
3. Updates repository links automatically

## Testing

Test your configuration:

```bash
# Test environment variable loading
node -e "require('dotenv').config(); console.log('PROJECT_NAME:', process.env.PROJECT_NAME || 'shrtnr')"

# Start the server
npm start
```

## Migration from Old Version

If upgrading from csj.lol to shrtnr:
1. No changes required - defaults work out of the box
2. Optionally set `PROJECT_NAME="csj.lol"` to keep old branding
3. All functionality remains unchanged

