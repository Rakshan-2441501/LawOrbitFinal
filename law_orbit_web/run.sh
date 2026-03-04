#!/bin/bash

# LawOrbit Web App Run Script

echo "🚀 Starting LawOrbit Setup..."

# 1. Install Dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
else
    echo "✅ Dependencies already installed."
fi

# 2. Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found! Creating one..."
    echo "DB_HOST=127.0.0.1" > .env
    echo "DB_USER=root" >> .env
    echo "DB_PASSWORD=" >> .env
    echo "DB_NAME=law_orbit_db" >> .env
    echo "PORT=3000" >> .env
fi

# 3. Check MySQL Status
echo "🔍 Checking MySQL database status..."
if ! mysqladmin ping -u root --silent; then
    echo "❌ MySQL is NOT running."
    echo "Attempting to start MySQL..."
    
    # Try common start commands
    if command -v brew &> /dev/null; then
        brew services start mysql
    elif [ -f "/opt/anaconda3/bin/mysql.server" ]; then
        /opt/anaconda3/bin/mysql.server start
    else
        mysql.server start
    fi
    
    # Wait for MySQL to start
    sleep 5
    
    if ! mysqladmin ping -u root --silent; then
        echo "❌ Automated start failed."
        echo "👉 Please start MySQL manually and try again."
        exit 1
    fi
fi

echo "✅ MySQL is running."

# 4. Initialize Database
echo "🌱 Initializing Database..."
npm run init-db

if [ $? -eq 0 ]; then
    echo "✅ Database ready."
else
    echo "❌ Database initialization failed. Check your DB_PASSWORD in .env file."
    echo "   Use: nano .env"
    exit 1
fi

# 5. Start Server
echo "🚀 Starting Server..."
npm start
