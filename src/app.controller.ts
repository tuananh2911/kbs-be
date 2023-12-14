import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Put,
} from '@nestjs/common';
import { UserGymDto } from './dtos/user-gym.dto';
import { Repository } from 'typeorm';
import { Dish } from './entity/dish.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { NutritionDtos } from './dtos/nutrition.dtos';
import { MealDayInterfaces } from './interfaces/meal-day.interfaces';
import { ExerciseDto } from './dtos/exercise.dto';
import { FuzzyLogic } from './service/fitness.service';
import axios from 'axios';
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

  @Put('nutrition')
  async recomendNutrition(@Body() body: NutritionDtos) {
    const { caloToReachGoal } = await this.appService.getCaloConsumed(body);
    const caloBreakfast = 0.3 * caloToReachGoal;
    const caloDinner = 0.5 * caloToReachGoal;
    const caloLunch = 0.2 * caloToReachGoal;
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

  @Post('exercise')
  async getExercise(@Body() data: ExerciseDto) {
    const fuzzyRulesTableExercise: number[][] = [
      [1, 1, 1],
      [2, 2, 1],
      [3, 3, 2],
    ];
    const fuzzyLogicExercise = new FuzzyLogic(fuzzyRulesTableExercise);
    const indexStrong = this.caculateCaloPrevious(
      data.soNhayDay,
      data.soHitDat,
      data.soKeoXa,
      data.soKmChayBo,
      data.soMBoi,
    );
    const caloConsumed = fuzzyLogicExercise.do_de_fuzzy(
      data.frequentlyGym,
      indexStrong,
      3,
      6,
      9,
      50,
      100,
      150,
      300,
      500,
      700,
    );
    const numberExercise = data.numberExercise;
    const timeExercise = data.timeToGym;
    let params;
    if (data.muscle) {
      params = {
        calo_per_day: Math.floor(caloConsumed), // ví dụ giá trị
        exercises_per_week: numberExercise, // ví dụ giá trị
        time_for_exercise: timeExercise * 60, // ví dụ giá trị
        muscle_group: data.muscle,
      };
    } else {
      params = {
        calo_per_day: Math.floor(caloConsumed), // ví dụ giá trị
        exercises_per_week: numberExercise, // ví dụ giá trị
        time_for_exercise: timeExercise * 60, // ví dụ giá trị
      };
    }
    return await axios({
      method: 'GET',
      url: `http://127.0.0.1:8000/exercise_plan/`,
      headers: {
        'Content-Type': 'application/json',
      },
      params: params,
    })
      .then((res) => {
        return res.data;
      })
      .catch((error) => {
        throw new BadRequestException(error.message);
      });
  }

  caculateCaloPrevious(soNhayDay, soHitDat, soKeoXa, soKmChayBo, soMBoi) {
    let dem = 0;
    if (soNhayDay != 0) {
      dem += 1;
    }
    if (soHitDat != 0) {
      dem += 1;
    }
    if (soKeoXa != 0) {
      dem += 1;
    }
    if (soKmChayBo != 0) {
      dem += 1;
    }
    if (soMBoi != 0) {
      dem += 1;
    }
    const calo =
      (soNhayDay * (1 / 6) +
        soHitDat * (10 / 6) +
        soKeoXa * 1 +
        soKmChayBo * 62.5 +
        soMBoi * 0.33) /
      dem;
    return calo;
  }
}
