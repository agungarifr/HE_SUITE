FROM ghcr.io/puppeteer/puppeteer:25.8.0

USER root
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Grant permissions to pptruser for runtime writes (.env, public/data, knowledge_base)
RUN touch .env && chown -R pptruser:pptruser /app

ENV PORT=8888
EXPOSE 8888

USER pptruser
CMD ["node", "api.js"]
