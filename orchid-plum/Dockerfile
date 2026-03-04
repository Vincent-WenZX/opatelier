FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./
COPY patches/ ./patches/

# Install dependencies (cached unless package.json changes)
RUN npm ci

# Copy source code
COPY . .

# Build the application (admin disabled via env)
ENV DISABLE_ADMIN=true
RUN npx medusa build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/medusa-config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src ./src

ENV PATH="/app/node_modules/.bin:$PATH"
EXPOSE 9000

CMD ["sh", "-c", "medusa db:migrate && medusa start"]
