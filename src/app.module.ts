import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FuzzyLogic } from './service/fitness.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './database/database.module';
import { Dish } from './entity/dish.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Dish]),
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number(),
        FOLDER_TMP: Joi.string().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
