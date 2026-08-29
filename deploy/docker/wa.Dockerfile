FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY server.js ./
ENV NODE_ENV=production PORT=5001 DATA_DIR=/data
RUN mkdir -p /data && chown -R node:node /app /data
USER node
EXPOSE 5001
CMD ["node", "server.js"]
