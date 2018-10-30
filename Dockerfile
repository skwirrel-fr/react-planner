FROM node:8.11.3

WORKDIR /app

COPY lerna.json package.json ./
COPY ./client/package.json ./client/
COPY ./server/package.json ./server/

RUN npm install --global lerna

COPY . /app

RUN lerna bootstrap

RUN lerna run postinstall
