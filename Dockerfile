# Dockerfile for Railway / any Node host with a volume
FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Schema must exist before `npm ci` because postinstall runs `prisma generate`
COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:/app/data/journal.db"
ENV UPLOAD_DIR="/app/data/uploads"
EXPOSE 3000

CMD ["sh", "-c", "mkdir -p /app/data/uploads && npx prisma db push && npm start"]
