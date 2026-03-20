FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV SENTIMENT_API_URL=http://sentiment-service:8000

EXPOSE 5000

CMD ["node", "server.js"]
