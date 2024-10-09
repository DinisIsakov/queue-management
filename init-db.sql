DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
        RAISE NOTICE 'Создаю роль admin...';
        CREATE ROLE admin WITH LOGIN PASSWORD 'admin';
        ALTER ROLE admin CREATEDB;
        RAISE NOTICE 'Роль admin успешно создана и ей присвоены права на создание БД.';
    ELSE
        RAISE NOTICE 'Роль admin уже существует, пропускаю создание.';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'queue_management') THEN
        RAISE NOTICE 'Создаю базу данных queue_management...';
        CREATE DATABASE queue_management OWNER admin;
        RAISE NOTICE 'База данных queue_management успешно создана.';
    ELSE
        RAISE NOTICE 'База данных queue_management уже существует, пропускаю создание.';
    END IF;
END
$$;

\connect queue_management;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
