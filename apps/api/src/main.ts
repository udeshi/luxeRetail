import cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc, ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TypedConfigService } from './config/config.module';

async function bootstrap() {
  // rawBody: true preserves the exact request bytes on req.rawBody
  // alongside normal JSON parsing — the Stripe webhook needs those raw
  // bytes to verify the signature (see payments/interface/http).
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const config = app.get(TypedConfigService);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.use(cookieParser());
  app.enableCors({
    origin: config.get('WEB_ORIGIN').split(','),
    credentials: true,
  });

  // One Zod schema (from @org/contracts) drives both request validation and
  // the Swagger schema — see modules/*/interface/http/request/*.
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LuxeRetail API')
    .setDescription('CQRS + clean-architecture REST API for the LuxeRetail storefront, admin, and mobile apps')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, swaggerConfig));
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document);

  const port = config.get('PORT');
  await app.listen(port);
  Logger.log(`🚀 API running on http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger docs on http://localhost:${port}/${globalPrefix}/docs`);
}

bootstrap();
