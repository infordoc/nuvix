# --- STAGE 1: BUILDER ---
FROM oven/bun:latest AS builder

ARG APP_NAME
ARG NPM_TOKEN
ENV GITHUB_TOKEN=$NPM_TOKEN
ENV APP_NAME=$APP_NAME

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
# This is the final image, which is as small as possible.
FROM oven/bun:slim AS runtime

# Set environment variables for the runtime image.
ARG APP_NAME NPM_TOKEN
ENV APP_NAME=$APP_NAME
ENV GITHUB_TOKEN=$NPM_TOKEN
ENV NODE_ENV=production

WORKDIR /app

# Copy the final build artifacts and necessary runtime files from the 'builder' stage.
COPY --from=builder /app/dist/pkg/${APP_NAME} ./
COPY --from=builder /app/dist/${APP_NAME} ./
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env* /app/.npmrc ./

RUN bun i
ENV GITHUB_TOKEN=''

CMD ["bun", "main.js"]