FROM node:20-slim AS build
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .
RUN npm run build
RUN npx prisma generate

FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY --from=build /app /app
RUN chown -R node:node /app && chmod -R 755 /app
EXPOSE 3000
USER node
CMD ["npm", "start"]