FROM node:14.16.1-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN apk update
RUN apk upgrade
RUN apk add --no-cache git
RUN npm i --production

COPY . /app

EXPOSE 8000
CMD ["apk", "update"]
CMD ["apk", "add", "git"]
CMD ["npm", "run", "start"]
