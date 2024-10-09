import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { QueueService } from './queue/queue.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Инициализация');

  const config = new DocumentBuilder()
    .setTitle('API Управления Очередью')
    .setDescription('API для управления очередью посетителей')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  try {
    const queueService = app.get(QueueService);
    await queueService.resetQueue();
    logger.log('Очередь была сброшена при запуске приложения');
  } catch (error) {
    logger.error('Не удалось сбросить очередь при запуске', error.stack);
    process.exit(1);
  }

  await app.listen(3000);
  logger.log('Приложение работает по адресу: http://localhost:3000');
}

bootstrap();
