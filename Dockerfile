# Multi-stage Dockerfile for production deployment

# Base stage
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

# Build server
FROM base AS build-server
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY apps/server ./apps/server
COPY pnpm-workspace.yaml package.json ./
RUN cd apps/server && pnpm build

# Build web
FROM base AS build-web
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY apps/web ./apps/web
COPY pnpm-workspace.yaml package.json ./
RUN cd apps/web && pnpm build

# Production server image
FROM node:20-alpine AS server
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build-server /app/apps/server/dist ./dist
COPY --from=build-server /app/apps/server/package.json ./
COPY --from=deps /app/apps/server/node_modules ./node_modules
EXPOSE 5050
CMD ["node", "dist/index.js"]

# Production web image
FROM node:20-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build-web /app/apps/web/.next ./.next
COPY --from=build-web /app/apps/web/public ./public
COPY --from=build-web /app/apps/web/package.json ./
COPY --from=deps /app/apps/web/node_modules ./node_modules
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]