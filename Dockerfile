# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm install

# Copy source code and config
COPY . .

# Build the application (compiles TS to JS in dist/)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled files from builder
COPY --from=builder /app/dist ./dist
# Copy migration files for programmatic runner
COPY --from=builder /app/src/db/migrations ./src/db/migrations

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
