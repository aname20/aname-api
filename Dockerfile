# Use the official Node.js image as the base image
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install ALL dependencies (including dev) for building
RUN npm install && npm cache clean --force

# Copy the rest of the application files
COPY . .

# Gerar Prisma Client para o ambiente do container
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Copy start script
COPY start.sh ./

# Gerar Prisma Client no container de produção
RUN npx prisma generate

# Torna o script executável
RUN chmod +x start.sh

# Expose the application port
EXPOSE 3000

# Command to run the application com migrações
CMD ["./start.sh"]
