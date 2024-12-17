import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { config } from 'dotenv'

config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use((req, res, next) => {
    res.header('X-Powered-By', 'SkillUp');
    res.header('Server', 'SkillUp Backend');
    next();
  });

  app.enableCors({
    origin: ['https://www.merabestie.com', 'http://localhost:3000', "*"],
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-HTTP-Method-Override', 'Accept'],
  })

  console.log('🚀 Server is running on http://localhost:3000');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
