FROM node:18-alpine

# Install Python and bash
RUN apk add --no-cache python3 bash

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV SCRIPTS_PATH=/data/scripts.json

CMD ["npm", "start"]

