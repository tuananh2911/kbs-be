import { Body, Controller, Get, Post } from '@nestjs/common';
import { FuzzyLogic } from './service/fitness.service';
import { UserGymDto } from './dtos/user-gym.dto';
import { range } from 'rxjs';
import { Repository } from 'typeorm';
import { Dish } from './entity/dish.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { NutritionDtos } from './dtos/nutrition.dtos';
import { MealDayInterfaces } from './interfaces/meal-day.interfaces';

@Controller('app')
export class AppController {
  constructor(
    @InjectRepository(Dish) private readonly dishRepository: Repository<Dish>,
    private appService: AppService,
  ) {}

  @Post('gym-mode')
  async getCaloConsumed(@Body() body: UserGymDto): Promise<any> {
    return await this.appService.getCaloConsumed(body);
  }

  @Get('nutrition')
  async recomendNutrition(@Body() body: NutritionDtos) {
    let data = new UserGymDto();
    data = { ...body };
    const { caloToReachGoal } = await this.appService.getCaloConsumed(data);
    const caloBreakfast = 0.2 * caloToReachGoal;
    const caloDinner = 0.4 * caloToReachGoal;
    const caloLunch = 0.4 * caloToReachGoal;
    let percentVegetable = 0.2;
    let percentProtein = 0.4;
    let percentCarb = 0.4;
    if (body.percentVegetable) {
      percentVegetable = body.percentVegetable;
    }
    if (body.percentProtein) {
      percentProtein = body.percentProtein;
    }
    if (body.percentCarb) {
      percentCarb = body.percentCarb;
    }
    const nutrition = [];

    for (let i = 2; i < 9; i++) {
      let mealDay: MealDayInterfaces;
      mealDay.mealBreakfast = this.randomNutrition(
        caloBreakfast * percentVegetable,
        caloBreakfast * percentProtein,
        caloBreakfast * percentCarb,
      );
      mealDay.mealDinner = this.randomNutrition(
        caloDinner * percentVegetable,
        caloDinner * percentProtein,
        caloDinner * percentCarb,
      );
      mealDay.mealLunch = this.randomNutrition(
        caloLunch * percentVegetable,
        caloLunch * percentProtein,
        caloLunch * percentCarb,
      );
      nutrition.push(mealDay);
    }
  }
  randomNutrition(calo1, calo2, calo3) {
    return nutrition;
  }

  @Get('exercise')
  async recommendExercise() {}
}
