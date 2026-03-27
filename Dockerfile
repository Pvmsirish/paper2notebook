# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy external packages needed at runtime (serverExternalPackages)
# pdf-parse and all its dependencies including bundled pdfjs
COPY --from=deps /app/node_modules/pdf-parse ./node_modules/pdf-parse
COPY --from=deps /app/node_modules/node-ensure ./node_modules/node-ensure
COPY --from=deps /app/node_modules/debug ./node_modules/debug
COPY --from=deps /app/node_modules/ms ./node_modules/ms

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
