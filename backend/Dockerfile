FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 4000

CMD ["./start.sh"]
