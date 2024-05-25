FROM node:12.22.12-alpine

RUN mkdir /app && chown node:node /app
USER node:node
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]
