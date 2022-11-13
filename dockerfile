FROM node:16-alpine
COPY ./dist /app/dist
COPY ./node_modules /app/node_modules
WORKDIR /app

ARG DATABASE_URL
ARG JWT_SECRET

ENV DATABASE_URL $DATABASE_URL
ENV JWT_SECRET $JWT_SECRET

EXPOSE 3000
EXPOSE 3002

CMD ["node","dist/src/main.js"]