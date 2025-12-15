#!/bin/sh
set -e

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build the application if dist/main doesn't exist
if [ ! -f "dist/main.js" ]; then
  echo "Building application..."
  npm run build
fi

# Start the application
exec node dist/main
