FROM node:22.20.0-slim
WORKDIR /api.devsonic.cl
COPY ./entrypoint.sh /api.devsonic.cl/entrypoint.sh
COPY ./.env /api.devsonic.cl/dist/
COPY ./dist /api.devsonic.cl/dist
COPY ./package.json /api.devsonic.cl/
COPY ./prisma /api.devsonic.cl/dist/prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates
RUN npm install --omit=dev
RUN chmod +x ./entrypoint.sh
EXPOSE 3000
CMD ["./entrypoint.sh"]