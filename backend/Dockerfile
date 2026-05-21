FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm

# Install dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/configs/package.json ./packages/configs/
COPY backend/package.json ./backend/
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS builder
COPY packages/ ./packages/
COPY backend/ ./backend/
RUN pnpm --filter=backend run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/

EXPOSE 5000
CMD ["node", "backend/dist/server.js"]
