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
    const nutritionUsed = [];
    for (let i = 2; i < 9; i++) {
      const mealDay: MealDayInterfaces = {
        mealBreakfast: '',
        mealDinner: '',
        mealLunch: '',
      };
      const vegetableBreakfast = await this.appService.getNutrition(
        caloBreakfast * percentVegetable,
        'vegetable',
        nutritionUsed,
      );
      mealDay.mealBreakfast += this.appService.caculateNutrition(
        vegetableBreakfast,
        caloBreakfast * percentVegetable,
      );
      mealDay.mealBreakfast += ', ';
      const proteinBreakfast = await this.appService.getNutrition(
        caloBreakfast * percentProtein,
        'protein',
        nutritionUsed,
      );
      mealDay.mealBreakfast += this.appService.caculateNutrition(
        proteinBreakfast,
        caloBreakfast * percentProtein,
      );
      mealDay.mealBreakfast += ', ';
      const carbBreakfast = await this.appService.getNutrition(
        caloBreakfast * percentCarb,
        'carb',
        nutritionUsed,
      );
      mealDay.mealBreakfast += this.appService.caculateNutrition(
        carbBreakfast,
        caloBreakfast * percentCarb,
      );

      nutritionUsed.push(vegetableBreakfast.id);
      nutritionUsed.push(proteinBreakfast.id);
      nutritionUsed.push(carbBreakfast.id);
      const vegetableDinner = await this.appService.getNutrition(
        caloDinner * percentVegetable,
        'vegetable',
        nutritionUsed,
      );
      mealDay.mealDinner += this.appService.caculateNutrition(
        vegetableDinner,
        caloDinner * percentVegetable,
      );
      mealDay.mealDinner += ', ';
      const proteinDinner = await this.appService.getNutrition(
        caloDinner * percentProtein,
        'protein',
        nutritionUsed,
      );
      mealDay.mealDinner += this.appService.caculateNutrition(
        proteinDinner,
        caloDinner * percentProtein,
      );
      mealDay.mealDinner += ', ';
      const carbDinner = await this.appService.getNutrition(
        caloDinner * percentCarb,
        'carb',
        nutritionUsed,
      );
      mealDay.mealDinner += this.appService.caculateNutrition(
        carbDinner,
        caloDinner * percentCarb,
      );
      nutritionUsed.push(vegetableDinner.id);
      nutritionUsed.push(proteinDinner.id);
      nutritionUsed.push(carbDinner.id);
      const vegetableLunch = await this.appService.getNutrition(
        caloLunch * percentVegetable,
        'vegetable',
        nutritionUsed,
      );
      mealDay.mealLunch += this.appService.caculateNutrition(
        vegetableLunch,
        caloLunch * percentVegetable,
      );
      mealDay.mealLunch += ', ';
      const proteinLunch = await this.appService.getNutrition(
        caloLunch * percentProtein,
        'protein',
        nutritionUsed,
      );
      mealDay.mealLunch += this.appService.caculateNutrition(
        proteinLunch,
        caloLunch * percentProtein,
      );
      mealDay.mealLunch += ', ';
      const carbLunch = await this.appService.getNutrition(
        caloLunch * percentCarb,
        'carb',
        nutritionUsed,
      );
      mealDay.mealLunch += this.appService.caculateNutrition(
        carbLunch,
        caloLunch * percentCarb,
      );
      nutritionUsed.push(vegetableLunch.id);
      nutritionUsed.push(proteinLunch.id);
      nutritionUsed.push(carbLunch.id);
      nutrition.push(mealDay);
    }
    return nutrition;
  }
}
