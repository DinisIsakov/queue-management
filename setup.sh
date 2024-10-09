#!/bin/bash

if [ -f ".env" ]; then
  export $(cat .env | xargs)
else
  echo "Ошибка: файл .env не найден."
  exit 1
fi

if [[ -z "$DATABASE_NAME" || -z "$DATABASE_USERNAME" || -z "$DATABASE_PASSWORD" ]]; then
  echo "Ошибка: Не все необходимые переменные окружения загружены."
  exit 1
fi

echo "Остановка и удаление контейнеров и volumes..."
docker-compose down -v || {
  echo "Ошибка при остановке контейнеров."
  exit 1
}

echo "Запуск контейнера с базой данных..."
docker-compose up -d postgres || {
  echo "Ошибка при запуске контейнера с базой данных."
  exit 1
}

echo "Ожидание запуска базы данных..."
until docker exec queue_management_db pg_isready -U "$DATABASE_USERNAME"; do
  sleep 5
  echo "Ожидание запуска базы данных..."
done

echo "База данных готова."

echo "Запуск контейнера с приложением..."
docker-compose up -d app || {
  echo "Ошибка при запуске контейнера с приложением."
  exit 1
}

echo "Компиляция TypeScript файлов..."
docker exec -it queue_management_app yarn build || {
  echo "Ошибка при компиляции TypeScript файлов."
  exit 1
}

echo "Выполнение миграций..."
docker exec -it queue_management_app yarn typeorm migration:run -d ./dist/database/data-source.js || {
  echo "Ошибка при выполнении миграций."
  exit 1
}

echo "Отслеживание логов приложения..."
docker logs -f queue_management_app
