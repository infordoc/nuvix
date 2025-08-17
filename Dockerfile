# -------- Stage 1: Base Build --------
FROM node:20-slim AS base
WORKDIR /app

# Install build-time tools:
# - curl, unzip → Bun
# - python3, build-essential → node-gyp
# - git → libpg-query build
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl unzip python3 build-essential ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"
ARG NPM_TOKEN
ENV GITHUB_TOKEN=${NPM_TOKEN}

COPY package.json bun.lock .npmrc ./

# Install libpg-query with npm in isolation (since Bun can't handle it well)
RUN mkdir /tmp/libpg && cd /tmp/libpg \
    && npm init -y \
    && npm install libpg-query --no-save \
    && mkdir -p /app/node_modules \
    && cp -R node_modules/libpg-query /app/node_modules/ \
    && rm -rf /tmp/libpg

RUN bun install --no-save
COPY . .


# -------- Stage 2: Development --------
FROM base AS development
WORKDIR /app
EXPOSE 4000 4100
CMD ["bun", "dev"]


# -------- Stage 3: Production Build --------
FROM base AS build
WORKDIR /app
RUN bun turbo build --filter=@nuvix/api --filter=@nuvix/platform


# -------- Stage 4: Runtime --------
FROM oven/bun:1-slim AS runtime
WORKDIR /app

COPY --from=build /app ./

EXPOSE 4000 4100