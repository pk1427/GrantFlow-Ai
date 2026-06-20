FROM node:22-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential curl ca-certificates pkg-config libssl-dev \
  && rm -rf /var/lib/apt/lists/*

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal
ENV PATH="/root/.cargo/bin:/root/.local/bin:${PATH}"

RUN cargo install casper-client-rs

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

COPY apps/api apps/api
RUN npm run build --workspace @grantflow/api

ENV NODE_ENV=production
CMD ["npm", "run", "start", "--workspace", "@grantflow/api"]
