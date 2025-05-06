#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}News Analyzer Setup Script${NC}"
echo "This script will help you set up the News Analyzer application."
echo

# Check if Node.js is installed
echo -e "${YELLOW}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v14 or later.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js ${NODE_VERSION} is installed.${NC}"

# Check if MongoDB is running
echo -e "${YELLOW}Checking MongoDB connection...${NC}"
if ! command -v mongosh &> /dev/null; then
    echo -e "${YELLOW}MongoDB CLI (mongosh) not found. Skipping MongoDB check.${NC}"
    echo -e "${YELLOW}Please ensure MongoDB is running on mongodb://localhost:27017${NC}"
else
    if ! mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        echo -e "${RED}MongoDB is not running. Please start MongoDB service.${NC}"
        exit 1
    fi
    echo -e "${GREEN}MongoDB is running.${NC}"
fi

# Setting up server
echo -e "${YELLOW}Setting up server...${NC}"
cd server || { echo -e "${RED}Server directory not found!${NC}"; exit 1; }

echo -e "${YELLOW}Installing server dependencies...${NC}"
npm install || { echo -e "${RED}Failed to install server dependencies!${NC}"; exit 1; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created. Please update it with your API keys.${NC}"
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# Setting up client
echo -e "${YELLOW}Setting up client...${NC}"
cd ../client || { echo -e "${RED}Client directory not found!${NC}"; exit 1; }

echo -e "${YELLOW}Installing client dependencies...${NC}"
npm install || { echo -e "${RED}Failed to install client dependencies!${NC}"; exit 1; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created.${NC}"
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

echo
echo -e "${GREEN}Setup complete!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update the API keys in server/.env"
echo "2. Start the server: cd server && npm run dev"
echo "3. Start the client: cd client && npm start"
echo
echo -e "${GREEN}Enjoy your news!${NC}"