FROM node:18-bullseye-slim

WORKDIR /usr/src/app

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV CHOKIDAR_INTERVAL=100

COPY package.json package-lock.json* ./
RUN npm install --silent

EXPOSE 3000

CMD ["npm", "run", "dev"]
