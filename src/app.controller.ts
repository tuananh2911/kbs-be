import {Body, Controller, Get, Post} from '@nestjs/common';
import { FuzzyLogic } from './service/fitness.service';
import { UserGymDto } from './dtos/user-gym.dto';
import { range } from 'rxjs';
import { Repository } from 'typeorm';
import { Dish } from './entity/dish.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('app')
export class AppController {
  constructor(
    @InjectRepository(Dish) private readonly dishRepository: Repository<Dish>,
  ) {}

  @Post('gym-mode')
  async getCaloConsumed(@Body() body: UserGymDto): Promise<any> {
    const fuzzyRulesTableExercise: number[][] = [
      [1, 1, 1],
      [2, 2, 1],
      [3, 3, 2],
    ];
    const fuzzyRulesTableNutrition: number[][] = [
      [2, 2, 3],
      [1, 2, 2],
      [1, 2, 2],
    ];

    const fuzzyLogicExercise = new FuzzyLogic(fuzzyRulesTableExercise);
    const fuzzyLogicNutrition = new FuzzyLogic(fuzzyRulesTableNutrition);
    const caloConsumed = fuzzyLogicExercise.do_de_fuzzy(
      body.frequentlyGym,
      body.numberPushUp,
      3,
      5,
      7,
      10,
      20,
      30,
      300,
      500,
      700,
    );
    let activityLevel = 0;
    switch (body.frequentlyGym) {
      case 0:
        activityLevel = 1.2; // Lightly Active
        break;
      case 1:
      case 2:
      case 3:
        activityLevel = 1.375; // Lightly Active
        break;
      case 4:
      case 5:
        activityLevel = 1.55; // Very Active
        break;
      case 6:
        activityLevel = 1.725; // Very Active
        break;
      case 7:
        activityLevel = 1.9; // Extra Active
        break;
      default:
        throw new Error(
          'Số nhập vào không hợp lệ. Vui lòng nhập số từ 1 đến 7.',
        );
    }
    const tdee = fuzzyLogicNutrition.calculateTdee(
      body.gender,
      body.currentWeight,
      body.height,
      body.age,
      activityLevel,
    );
    let timeToGoal = 0;
    const diffWeight = Math.abs(body.goalWeight - body.currentWeight);
    const bmi = body.currentWeight / (body.height * body.height);
    const minBmi = 18.5;
    const avgBmi = 20.7;
    const maxBmi = 23;
    let minDiffWeight = 0;
    let avgDiffWeight = 0;
    let maxDiffWeight = 0;
    if (body.goalSelect === 'loseWeight') {
      maxDiffWeight = (bmi - minBmi) * (body.height * body.height);
      const rangeBmi = (bmi - 18.5) / 3;
      avgDiffWeight = (bmi - (minBmi + rangeBmi)) * (body.height * body.height);
      minDiffWeight =
        (bmi - (minBmi + rangeBmi * 2)) * (body.height * body.height);
    } else {
      maxDiffWeight = (maxBmi - bmi) * (body.height * body.height);
      const rangeBmi = (maxBmi - bmi) / 3;
      avgDiffWeight =
        (maxBmi - (bmi + rangeBmi * 2)) * (body.height * body.height);
      minDiffWeight = (maxBmi - (bmi + rangeBmi)) * (body.height * body.height);
    }
    timeToGoal = fuzzyLogicNutrition.do_de_fuzzy(
      body.frequentlyGym,
      diffWeight,
      3,
      5,
      7,
      minDiffWeight,
      avgDiffWeight,
      maxDiffWeight,
      diffWeight * 7,
      diffWeight * 7 * 2,
      diffWeight * 7 * 3,
    );

    const goalCalo = fuzzyLogicNutrition.calculateGoalCalories(
      tdee,
      timeToGoal,
      body.goalWeight,
      body.currentWeight,
      caloConsumed,
    );
    // const dishBreakfast = await this.dishRepository.findBy({
    //   buoiPhucVu: 'Buổi Sáng',
    // });
    // const mealBreakfast = fuzzyLogicNutrition.luaChonMonAn(
    //   dishBreakfast,
    //   goalCalo * 0.3,
    // );
    // const dishLunch = await this.dishRepository.findBy({
    //   buoiPhucVu: 'Buổi Trưa',
    // });
    // const mealLunch = fuzzyLogicNutrition.luaChonMonAn(
    //   dishLunch,
    //   goalCalo * 0.4,
    // );
    // const dishDinner = await this.dishRepository.findBy({
    //   buoiPhucVu: 'Buổi Tối',
    // });
    // const mealDinner = fuzzyLogicNutrition.luaChonMonAn(
    //   dishDinner,
    //   goalCalo * 0.3,
    // );
    return {
      caloToMaintain: tdee,
      caloToReachGoal: goalCalo,
      timeToReachGoal: timeToGoal,
      // mealBreakfast: mealBreakfast,
      // mealLunch: mealLunch,
      // mealDinner: mealDinner,
    };
  }
}
