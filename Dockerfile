FROM node:22-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY apps/api apps/api
RUN npm run build --workspace @grantflow/api

ENV NODE_ENV=production
CMD ["npm", "run", "start", "--workspace", "@grantflow/api"]
