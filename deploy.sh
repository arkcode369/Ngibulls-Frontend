#!/bin/bash
set -e

echo "=== Ngibulls Deployment Script ==="

# 1. Update system & install Docker
echo "[1/5] Installing Docker..."
sudo apt update -y
sudo apt install -y docker.io docker-compose-v2
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# 2. Clone repositories
echo "[2/5] Cloning repositories..."
mkdir -p ~/ngibulls && cd ~/ngibulls
git clone https://github.com/arkcode369/Ngibulls-Frontend.git || true
git clone https://github.com/arkcode369/Ngibulls-Backend.git || true

# 3. Build & Run
echo "[3/5] Building Docker images..."
sudo docker compose up -d --build

echo "[4/5] Waiting for services to start..."
sleep 5

echo "[5/5] Checking status..."
sudo docker compose ps

echo ""
echo "=== Deployment Complete ==="
echo "Access your app at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo '<YOUR_EC2_PUBLIC_IP>')"
