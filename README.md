# Queue Management System

Вакансия

https://proscom.notion.site/Senior-Backend-Node-js-Proscom-1d8f966aaef14605bc706c585f328230?pvs=4

Тестовое задание

https://drive.google.com/file/d/1M66GqJI_DrrW1BGof--WmzhDC1WzdsE1/view?usp=sharing

Демонстрация работы

https://www.loom.com/share/0ea4030bff504acbace45b78829f499c

## Описание

Проект **Queue Management System** — это система управления очередью, разработанная с использованием фреймворка [NestJS](https://nestjs.com/).

Приложение поддерживает работу с очередями, посетителями и билетами, использует PostgreSQL для хранения данных, и имеет встроенную документацию API через Swagger.

## Запуск

```bash
$ bash setup.sh
```

Запустится два Docker-контейнера: один для базы данных, другой для приложения.

## Тестирование

```bash
$ yarn test
```

## Настройка окружения

Так как это тестовое задание, то для удобства я не помещал в .gitignore файл .env.

## API Документация

Документация API доступна по адресу: http://localhost:3000/api после запуска приложения. Документация автоматически генерируется с помощью Swagger.

## Автор

- Author - [Dinis]
