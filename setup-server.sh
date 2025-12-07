#!/bin/bash

set -e

echo "🚀 Setting up BarberPro on server..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
    pm2 startup systemd -u $USER --hp $HOME
fi

# Install MongoDB if not installed
if ! command -v mongod &> /dev/null; then
    echo "📦 Installing MongoDB..."
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    sudo apt-get update
    sudo apt-get install -y mongodb-org
    sudo systemctl start mongod
    sudo systemctl enable mongod
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt-get install -y nginx
fi

# Install Certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing Certbot..."
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Create project directory
echo "📁 Setting up project directory..."
sudo mkdir -p /var/www/barberpro
sudo mkdir -p /var/www/html/barberpro
sudo chown -R $USER:$USER /var/www/barberpro

# Clone repository if not exists
if [ ! -d "/var/www/barberpro/.git" ]; then
    echo "📥 Cloning repository..."
    read -p "Enter your Git repository URL: " REPO_URL
    git clone $REPO_URL /var/www/barberpro
fi

cd /var/www/barberpro

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads
chmod 755 backend/uploads

# Setup backend environment
echo "⚙️ Setting up backend environment..."
cd backend
if [ ! -f ".env" ]; then
    cp .env.production .env
    echo "⚠️  Please edit backend/.env with your production values"
fi
npm install
cd ..

# Setup frontend
echo "⚙️ Setting up frontend..."
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/barberpro/
sudo chown -R www-data:www-data /var/www/html/barberpro
cd ..

# Copy Nginx configuration
echo "⚙️ Configuring Nginx..."
sudo cp nginx-barberpro.conf /etc/nginx/sites-available/barberpro
sudo ln -sf /etc/nginx/sites-available/barberpro /etc/nginx/sites-enabled/barberpro

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Install SSL certificate
echo "🔒 Setting up SSL certificate..."
read -p "Enter your email for SSL certificate: " EMAIL
sudo certbot --nginx -d barberappointment.duckdns.org --non-interactive --agree-tos --email $EMAIL || echo "⚠️  SSL setup failed, you can run: sudo certbot --nginx -d barberappointment.duckdns.org"

# Start backend with PM2
echo "🚀 Starting backend with PM2..."
cd backend
NODE_ENV=production pm2 start server.js --name barberpro-backend --env production
pm2 save
cd ..

echo ""
echo "✅ Server setup complete!"
echo ""
echo "Your application is available at:"
echo "https://barberappointment.duckdns.org"
echo ""
echo "Useful commands:"
echo "  pm2 status                    - Check backend status"
echo "  pm2 logs barberpro-backend    - View backend logs"
echo "  pm2 restart barberpro-backend - Restart backend"
echo ""
echo "Uploads directory: /var/www/barberpro/backend/uploads"
