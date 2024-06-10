import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from '../controllers/app.controller';
import { PrivateController } from "../controllers/private.controller";
import { AppService } from '../services/app.service';
import { databaseProviders } from '../providers/database.providers';
import { AuthorizerMiddleware } from '../middlewares/authorizer.middleware';
import { FileSystemService } from 'lib/services/fs.service';
import { usersRevenueProviders } from "../providers/usersRevenue.providers";

@Module({
  imports: [],
  controllers: [AppController, PrivateController],
  providers: [AppService, FileSystemService, ...databaseProviders, ...usersRevenueProviders],
  exports: [...databaseProviders],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthorizerMiddleware)
      .forRoutes("/liveEvent", "/private/queueMode")
  }

}
