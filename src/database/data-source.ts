import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { config as dotenvConfig } from 'dotenv';
import { Logger } from '@nestjs/common';

dotenvConfig();

const logger = new Logger('DataSourceInitialization');

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Переменная окружения ${key} не найдена.`);
  }
  return value;
};

const migrationPath = join(__dirname, 'migration/*.js');
const entityPath = join(__dirname, '../**/*.entity.js');

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: getEnvVar('DATABASE_HOST'),
  port: parseInt(getEnvVar('DATABASE_PORT', '5432'), 10),
  username: getEnvVar('DATABASE_USERNAME'),
  password: getEnvVar('DATABASE_PASSWORD'),
  database: getEnvVar('DATABASE_NAME'),
  entities: [entityPath],
  migrations: [migrationPath],
  synchronize: false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

(async () => {
  try {
    await AppDataSource.initialize();
    logger.log('DataSource успешно инициализирован.');
  } catch (error) {
    logger.error('Ошибка при инициализации DataSource:', error);
  }
})();
