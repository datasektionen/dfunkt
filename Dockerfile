FROM node:12.22.12

WORKDIR /app

COPY . .

RUN npm install

# CMD [ "npm", "start", "||", "sleep", "2073600"]