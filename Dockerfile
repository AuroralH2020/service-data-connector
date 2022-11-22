FROM node:16-slim as base

FROM base as develop

WORKDIR /service
COPY --chown=node:node package*.json tsconfig.json ./
# RUN npm install --production
RUN npm ci && npm cache clean --force

FROM develop as release

WORKDIR /service
RUN chown -R node:node /service
COPY --chown=node:node dist ./dist
RUN rm -rf /service/package-lock.json
USER node

CMD ["./dist/src/server.js"]

