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
RUN echo "=== Starting NestJS build ===" && \
    npm run build 2>&1 | tee /tmp/build.log && \
    echo "=== Build output ===" && \
    cat /tmp/build.log && \
    echo "=== Build finished ===" && \
    echo "=== Checking dist directory ===" && \
    ls -laR dist/ && \
    echo "=== Looking for main.js ===" && \
    (ls -la dist/src/main.js || ls -la dist/main.js || echo "ERROR: main.js not found!")

# Torna o script executável
RUN chmod +x start.sh

# Expose the application port
EXPOSE 3000

# Command to run the application com migrações
CMD ["./start.sh"]
