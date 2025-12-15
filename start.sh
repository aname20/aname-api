#!/bin/sh
set -e

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start the application
exec node dist/main
