# Deployment Guide

This guide walks you through deploying the College Event Management System on a Linux-based college server using Nginx as a reverse proxy, PM2 for Node.js process management, and MongoDB.

## Prerequisites
- A Linux Server (Ubuntu/Debian recommended)
- Node.js (v18+) and npm installed
- MongoDB installed locally OR a MongoDB Atlas connection string
- Nginx installed (`sudo apt install nginx`)

## 1. Environment Setup

### Clone Repository
```bash
git clone <your-repo-url>
cd college-event-hub
```

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit the `.env` file with proper production values (set `NODE_ENV=production` and add a strong `JWT_SECRET`).

### Seed Database (Optional but recommended for testing)
```bash
node seed.js
```

### Frontend Setup
```bash
cd ../frontend
npm install
npm run build
```
This will generate a `dist` folder containing the compiled static assets.

## 2. Process Management with PM2
Install PM2 globally to keep the Node.js backend running indefinitely:
```bash
sudo npm install -g pm2
cd ../backend
pm2 start server.js --name "college-event-api"
pm2 save
pm2 startup
```

## 3. Nginx Configuration

Create a new configuration file for Nginx:
```bash
sudo nano /etc/nginx/sites-available/eventhub
```

Add the following configuration (replace `your_domain_or_IP` with your actual domain or server IP):

```nginx
server {
    listen 80;
    server_name your_domain_or_IP;

    # Serve React Frontend Static Files
    location / {
        root /path/to/college-event-hub/frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;  # Crucial for React Router
    }

    # Reverse Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/eventhub /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 4. Maintenance
To view backend logs:
```bash
pm2 logs college-event-api
```

To update the app in the future:
```bash
git pull
cd frontend && npm install && npm run build
cd ../backend && npm install
pm2 restart college-event-api
```
