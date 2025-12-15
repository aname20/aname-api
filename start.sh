#!/bin/sh
set -e

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify dist directory exists
echo "Checking dist directory..."
ls -la dist/ || echo "ERROR: dist/ directory not found!"
ls -la dist/main.js || echo "ERROR: dist/main.js not found!"

# Start the application
exec node dist/main.js
