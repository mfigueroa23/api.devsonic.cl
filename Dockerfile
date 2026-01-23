FROM node:22.20.0-slim
WORKDIR /api.devsonic.cl
COPY ./dist/ /api.devsonic.cl/
COPY ./package.json /api.devsonic.cl/
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "main.js"]