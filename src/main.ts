import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Winner SOP API')
    .setDescription('AI-powered Statement of Purpose generation platform')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') ?? 3000;
  const host = configService.get<string>('HOST') || '0.0.0.0';
  await app.listen(port, host);

  const localIp = (() => {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net && net.family === 'IPv4' && !net.internal) return net.address;
      }
    }
    return undefined;
  })();

  const displayHost =
    host === '0.0.0.0' || host === '::' || host === '::1'
      ? localIp || 'localhost'
      : host;
  const base = `http://${displayHost}:${port}`;
  Logger.log(`🚀 Winner SOP API running at ${base}/${apiPrefix}`.replace(/\/+/, '/'), 'Bootstrap');
  Logger.log(`Swagger docs at ${base}/docs`, 'Bootstrap');
}

bootstrap();

