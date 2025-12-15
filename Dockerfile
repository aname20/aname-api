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

# Verify nest CLI is available
RUN echo "=== Checking for @nestjs/cli ===" && \
    npm list @nestjs/cli || echo "nest CLI not found in dependencies" && \
    ls -la node_modules/.bin/ | grep nest || echo "nest binary not found"

# Build the NestJS application with verbose output
RUN echo "=== Starting NestJS build ===" && \
    npx nest build --verbose 2>&1 && \
    echo "=== Build command finished ===" && \
    echo "=== Checking dist directory recursively ===" && \
    ls -laR dist/ 2>&1 && \
    echo "=== Looking for JavaScript files ===" && \
    find dist -name "*.js" 2>&1 | head -30 || echo "No JS files found in dist!"

# Torna o script executável
RUN chmod +x start.sh

# Expose the application port
EXPOSE 3000

# Command to run the application com migrações
CMD ["./start.sh"]
