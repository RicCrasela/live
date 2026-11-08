# syntax=docker/dockerfile:1
# VibeLive — Next.js 15 production image (Alpine, patched OS packages)
FROM node:26-alpine3.24 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:26-alpine3.24 AS runner
# Patch base OS packages; zlib 1.4-r0 fixes ALPINE-CVE-2026-4738 (1.3.2-r1).
RUN apk update \
 && apk upgrade \
 && apk add --upgrade 'zlib=1.4-r0' \
 && mkdir -p /var/cache/apk
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
# next start binds 0.0.0.0 and honors $PORT; -H/-p in the start script pin it.
CMD ["npm", "start"]
