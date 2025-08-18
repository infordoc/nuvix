# --- STAGE 1: BUILDER ---
# This stage is for building the application. We use a full Node.js image to have all necessary tools.
FROM node:20 AS builder

ARG APP_NAME
ARG NPM_TOKEN
ENV GITHUB_TOKEN=$NPM_TOKEN
ENV APP_NAME=$APP_NAME

# Install Bun, as it's not pre-installed on the base Node image.
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Install global dependencies first, as they are less likely to change.
RUN npm install -g libpg-query

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json bun.lock .npmrc ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/platform/package.json ./apps/platform/package.json
COPY libs/core/package.json ./libs/core/package.json
COPY libs/pg-meta/package.json ./libs/pg-meta/package.json
COPY libs/utils/package.json ./libs/utils/package.json
RUN bun install --frozen-lockfile

COPY . .
RUN bun turbo build --filter=@nuvix/$APP_NAME --force

# --- STAGE 2: RUNTIME ---
# This is the final image, which should be as small as possible.
# It only contains what is needed to run the application in production.
FROM oven/bun AS runtime

# Set environment variables for the runtime image.
ARG APP_NAME NPM_TOKEN
ENV APP_NAME=$APP_NAME
ENV GITHUB_TOKEN=$NPM_TOKEN
ENV NODE_ENV=production

# Set the working directory for the runtime.
WORKDIR /app

# Copy the final build artifacts and necessary runtime files from the 'builder' stage.
COPY --from=builder /app/dist/pkg/${APP_NAME} ./
COPY --from=builder /app/dist/${APP_NAME} ./

COPY --from=builder /app/assets ./assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env* /app/.npmrc ./
COPY --from=builder /app/node_modules/libpg-query ./node_modules/libpg-query

RUN bun i
ENV GITHUB_TOKEN=''

CMD ["bun", "main.js"]