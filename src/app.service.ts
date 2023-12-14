import { Body, Injectable } from '@nestjs/common';
import { UserGymDto } from './dtos/user-gym.dto';
import { FuzzyLogic } from './service/fitness.service';

@Injectable()
export class AppService {
  async getCaloConsumed(body: UserGymDto): Promise<any> {
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
    const minWeight = 18.5 * (body.height * body.height);
    const avgWeight = 20.7 * (body.height * body.height);
    const maxWeight = 23 * (body.height * body.height);
    let minDiffWeight = 0;
    let avgDiffWeight = 0;
    let maxDiffWeight = 0;
    if (body.goalSelect === 'loseWeight') {
      maxDiffWeight = body.currentWeight - minWeight;
      const rangeWeight = (body.currentWeight - minWeight) / 3;
      avgDiffWeight = body.currentWeight - (minWeight + rangeWeight);
      minDiffWeight = body.currentWeight - (minWeight + rangeWeight * 2);
    } else {
      maxDiffWeight = maxWeight - body.currentWeight;
      const rangeWeight = (maxWeight - body.currentWeight) / 3;
      avgDiffWeight = maxWeight - (body.currentWeight + rangeWeight * 2);
      minDiffWeight = maxWeight - (body.currentWeight + rangeWeight);
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
    return {
      caloToMaintain: tdee,
      caloToReachGoal: goalCalo,
      timeToReachGoal: timeToGoal,
    };
  }
}