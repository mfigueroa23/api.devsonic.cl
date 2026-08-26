FROM node:24.16.0-slim

# System dependencies first for better layer caching
RUN apt-get update -y && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Setup pnpm via corepack (pnpm v11)
RUN npm install --global corepack@latest && \
    corepack enable && \
    corepack prepare pnpm@11 --activate

WORKDIR /api.devsonic.cl

# Dependency manifests first — pnpm install layer is cached until these change
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./
COPY ./prisma ./prisma
COPY ./prisma.config.ts ./

# Install all deps (prisma CLI is a devDep), generate client, then prune to production
RUN pnpm install --frozen-lockfile && \
    ./node_modules/.bin/prisma generate && \
    pnpm prune --production

# Application artifacts (changes on every build — last to preserve cache)
COPY ./dist ./dist
COPY ./entrypoint.sh ./

# Security: set permissions and drop to non-root user
RUN chmod +x ./entrypoint.sh && \
    chown -R node:node /api.devsonic.cl

USER node

EXPOSE 3000
CMD ["./entrypoint.sh"]
