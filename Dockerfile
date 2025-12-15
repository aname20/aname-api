# Use the official Node.js image as the base image
FROM node:22-alpine

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

# List dist directory to verify build output
RUN echo "Checking dist directory..." && ls -la dist/ || echo "dist/ not found!"

# Remove dev dependencies after build
RUN npm prune --production

# Torna o script executável
RUN chmod +x start.sh

# Expose the application port
EXPOSE 3000

# Command to run the application com migrações
CMD ["./start.sh"]
