#!/bin/bash

echo "🚀 AI Agents Marketplace POC - Quick Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Create project directory
echo -e "${BLUE}📁 Creating project directory...${NC}"
if [ ! -d "ai-agents-poc" ]; then
    npx create-next-app@latest ai-agents-poc --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
else
    echo -e "${YELLOW}⚠️  Directory 'ai-agents-poc' already exists${NC}"
fi

cd ai-agents-poc

# Install additional dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install react-hot-toast lucide-react

# Create necessary directories
echo -e "${BLUE}📂 Creating project structure...${NC}"
mkdir -p hooks components lib data

# Copy files message
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Copy the provided files into your project:"
echo "   - app/page.tsx (Main marketplace page)"
echo "   - app/layout.tsx (Root layout)"
echo "   - app/globals.css (Global styles)"
echo "   - app/dashboard/page.tsx (Dashboard page)"
echo "   - hooks/useUser.ts (User management hook)"
echo "   - README.md (Documentation)"

echo ""
echo -e "${GREEN}✅ Project setup complete!${NC}"
echo ""
echo "To start development:"
echo -e "${BLUE}cd ai-agents-poc${NC}"
echo -e "${BLUE}npm run dev${NC}"
echo ""
echo "Then open http://localhost:3000 in your browser"

# Check if git is available and initialize
if command -v git &> /dev/null; then
    echo -e "${BLUE}🔧 Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit: AI Agents Marketplace POC setup"
    echo -e "${GREEN}✅ Git repository initialized${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Ready to build your AI Agents Marketplace POC!${NC}"
echo ""
echo "Demo features included:"
echo "• Beautiful glassmorphism UI"
echo "• User authentication (email/password)"
echo "• Credit-based agent usage system"
echo "• 6 demo AI agents with realistic responses"
echo "• Usage tracking and dashboard"
echo "• Credit purchase simulation"
echo "• Mobile responsive design"
echo ""
echo "Perfect for investor demos and user testing!"