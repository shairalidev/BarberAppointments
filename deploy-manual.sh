#!/bin/bash

set -e

echo "Starting BarberPro Deployment Pipeline..."

cd /var/www/barberpro

echo "Pulling latest code..."
git fetch origin main
git reset --hard origin/main

echo "Installing backend dependencies..."
cd backend
npm ci

echo "Ensuring PM2 backend process exists..."
if pm2 describe barberpro-backend > /dev/null 2>&1; then
  pm2 restart barberpro-backend
else
  NODE_ENV=production pm2 start server.js --name barberpro-backend
fi

echo "Installing frontend dependencies..."
cd ../frontend
npm ci

echo "Building frontend..."
npm run build

echo "Deploying frontend to /var/www/html/barberpro..."
sudo rm -rf /var/www/html/barberpro/*
sudo cp -r dist/* /var/www/html/barberpro/

echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/html/barberpro
sudo chmod -R 755 /var/www/html/barberpro

echo "Ensuring uploads directory..."
cd ..
mkdir -p backend/uploads
sudo chown -R www-data:www-data backend/uploads
sudo chmod -R 755 backend/uploads

echo "Saving PM2 state..."
pm2 save

echo "Deployment finished. PM2 Status:"
pm2 status
