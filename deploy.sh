#!/bin/bash
# ============================================
# SPMB 2026 - Deploy Script
# ============================================
# Usage:
#   ./deploy.sh          # Deploy dengan Docker
#   ./deploy.sh --vps     # Deploy langsung di VPS (tanpa Docker)

set -e

# Colors untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   SPMB 2026 - Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Cek .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ File .env tidak ditemukan!${NC}"
    echo -e "${YELLOW}   Salin dari .env.example dan isi DATABASE_URL:${NC}"
    echo -e "   cp .env.example .env"
    exit 1
fi

# Cek DATABASE_URL
if ! grep -q "DATABASE_URL=postgresql://" .env; then
    echo -e "${RED}❌ DATABASE_URL belum diisi di .env!${NC}"
    exit 1
fi

# ====== Docker Deployment ======
deploy_docker() {
    echo -e "\n${GREEN}🐳 Deploy dengan Docker...${NC}"

    # Cek Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker tidak terinstall!${NC}"
        echo -e "${YELLOW}   Install: curl -fsSL https://get.docker.com | sh${NC}"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose tidak terinstall!${NC}"
        exit 1
    fi

    # Build dan start
    echo -e "${YELLOW}📦 Building Docker image...${NC}"
    docker compose build --no-cache

    echo -e "${YELLOW}🚀 Starting containers...${NC}"
    docker compose up -d

    echo -e "\n${GREEN}✅ Deploy berhasil!${NC}"
    echo -e "${GREEN}   Aplikasi berjalan di: http://localhost:3000${NC}"
    echo -e "\n${YELLOW}Perintah berguna:${NC}"
    echo -e "   docker compose logs -f          # Lihat logs"
    echo -e "   docker compose restart           # Restart"
    echo -e "   docker compose down              # Stop"
    echo -e "   docker compose up -d --build     # Rebuild & restart"
}

# ====== VPS Deployment (tanpa Docker) ======
deploy_vps() {
    echo -e "\n${GREEN}🖥️  Deploy langsung di VPS...${NC}"

    # Cek Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js tidak terinstall!${NC}"
        echo -e "${YELLOW}   Install: curl -fsSL https://bun.sh/install | bash${NC}"
        exit 1
    fi

    # Install dependencies
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install || bun install

    # Build
    echo -e "${YELLOW}🔨 Building aplikasi...${NC}"
    npm run build || bun run build

    # Cek PM2
    if command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}🚀 Starting dengan PM2...${NC}"
        pm2 delete spmb-2026 2>/dev/null || true
        pm2 start .next/standalone/server.js --name spmb-2026
        pm2 save
        echo -e "\n${GREEN}✅ Deploy berhasil dengan PM2!${NC}"
        echo -e "${YELLOW}Perintah berguna:${NC}"
        echo -e "   pm2 logs spmb-2026    # Lihat logs"
        echo -e "   pm2 restart spmb-2026 # Restart"
        echo -e "   pm2 stop spmb-2026    # Stop"
    else
        echo -e "${YELLOW}🚀 Starting langsung...${NC}"
        echo -e "${YELLOW}   (Disarankan install PM2: npm install -g pm2)${NC}"
        NODE_ENV=production node .next/standalone/server.js
    fi
}

# ====== Main ======
if [ "$1" = "--vps" ]; then
    deploy_vps
else
    deploy_docker
fi
