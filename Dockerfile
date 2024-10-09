FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./

RUN echo "Устанавливаю зависимости..." && yarn install

COPY . .

RUN echo "Собираю приложение..." && yarn build

EXPOSE 3000
