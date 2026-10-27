FROM ghcr.io/puppeteer/puppeteer:25.8.0

USER root
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV PORT=8888
EXPOSE 8888

USER pptruser
CMD ["node", "api.js"]
