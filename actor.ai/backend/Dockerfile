# Build stage
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Production stage
FROM node:16-alpine

WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm ci --only=production

COPY --from=build /app/src ./src
COPY --from=build /app/.env.production ./.env

EXPOSE 3001
CMD ["node", "src/index.js"] 