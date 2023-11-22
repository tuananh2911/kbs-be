import {Body, Controller, Get} from '@nestjs/common';
import { FuzzyLogic} from './fitness.service';
import {UserGymDto} from "./user-gym.dto";

@Controller('app')
export class AppController {
  constructor() {}

  @Get('gym-mode')
  getCaloConsumed(@Body('body') body: UserGymDto): number {
    const fuzzy_rules_table: number[][] = [[1, 1, 1], [2, 2, 1], [3, 3, 2]];
    const fuzzyLogic = new FuzzyLogic(fuzzy_rules_table);
    return fuzzyLogic.do_de_fuzzy(4,12,3,5,7,10,20,30,300,500,700);
  }
}
