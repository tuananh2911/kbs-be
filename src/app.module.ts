import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FuzzyLogic} from './fitness.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
