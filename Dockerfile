FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY backend/start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 4000

CMD ["./start.sh"]
