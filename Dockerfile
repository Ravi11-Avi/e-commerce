FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install --omit=dev --prefix backend && \
    npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "backend/server.js"]
