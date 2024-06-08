import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import "dotenv/config";

async function startServer() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8000);
}
startServer();
 