FROM node:22.20.0-slim
WORKDIR /api.devsonic.cl
COPY ./.env /api.devsonic.cl/
COPY ./dist /api.devsonic.cl/dist
COPY ./package.json /api.devsonic.cl/
RUN apt-get update -y && apt-get install -y openssl ca-certificates
RUN npm install --omit=dev
EXPOSE 3000
CMD ["npm", "run", "start:prod"]