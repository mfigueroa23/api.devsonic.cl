FROM node:22.20.0-slim
WORKDIR /api.devsonic.cl
COPY ./.env /api.devsonic.cl/
COPY ./dist/* /api.devsonic.cl/
COPY ./package.json /api.devsonic.cl/
COPY ./prisma/ /api.devsonic.cl/prisma/
COPY ./entrypoint.sh /api.devsonic.cl/
RUN apt-get update -y && apt-get install -y openssl ca-certificates
RUN npm install --omit=dev
RUN chmod +x ./entrypoint.sh
EXPOSE 3000
CMD ["./entrypoint.sh"]