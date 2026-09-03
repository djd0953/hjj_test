FROM node:18-bullseye-slim

WORKDIR /usr/src/app

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
ENV CHOKIDAR_INTERVAL=100

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

EXPOSE 9000

CMD ["pnpm", "run", "dev"]
