import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseProviders } from './providers/database.providers';
import { AuthorizerMiddleware } from './middlewares/authorizer.middleware';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizerMiddleware)
      .forRoutes("/liveEvent")
  }

}
