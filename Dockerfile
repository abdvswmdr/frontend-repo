FROM node:20.20.2-alpine AS deps
WORKDIR /opt/frontend
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20.20.2-alpine
WORKDIR /opt/frontend
COPY --from=deps /opt/frontend/node_modules ./node_modules
COPY . .
EXPOSE 8079
USER node
CMD ["node", "server.js"]
