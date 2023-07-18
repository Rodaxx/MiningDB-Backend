FROM node:18

WORKDIR /usr/src/app

COPY . .

RUN npm ci --omit=dev

EXPOSE 80

CMD [ "node", "index.js" ]