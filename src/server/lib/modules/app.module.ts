import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { databaseProviders } from '../providers/database.providers';
import { AuthorizerMiddleware } from '../middlewares/authorizer.middleware';
import { FileSystemService } from 'lib/services/fs.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FileSystemService, ...databaseProviders],
  exports: [...databaseProviders],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizerMiddleware)
      .forRoutes("/liveEvent")
  }

}
