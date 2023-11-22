import {Body, Controller, Get} from '@nestjs/common';
import { FuzzyLogic} from './fitness.service';
import {UserGymDto} from "./user-gym.dto";
import {range} from "rxjs";

@Controller('app')
export class AppController {
  constructor() {}

  @Get('gym-mode')
  getCaloConsumed(@Body('body') body: UserGymDto): { timeToGoal: number; caloNeed: number; caloConsumed: number } {
    const fuzzyRulesTableExercise: number[][] = [[1, 1, 1], [2, 2, 1], [3, 3, 2]];
    const fuzzyRulesTableNutrition: number[][] = [[2, 2, 3], [1, 2, 2], [1, 2, 2]];

    const fuzzyLogicExercise = new FuzzyLogic(fuzzyRulesTableExercise);
    const fuzzyLogicNutrition = new FuzzyLogic(fuzzyRulesTableNutrition);
    const caloConsumed = fuzzyLogicExercise.do_de_fuzzy(body.frequentlyGym,body.numberPushUp,3,5,7,10,20,30,300,500,700);
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
        throw new Error('Số nhập vào không hợp lệ. Vui lòng nhập số từ 1 đến 7.');
    }
    const tdee = fuzzyLogicNutrition.calculateTdee(body.gender, body.currentWeight,body.height,body.age,activityLevel);
    let timeToGoal = 0;
    const diffWeight = Math.abs(body.goalWeight - body.currentWeight);
    const bmi = body.currentWeight/(body.height*body.height);
    let minBmi = 18.5
    let avgBmi = 20.7;
    let maxBmi = 23;
    let minDiffWeight = 0;
    let avgDiffWeight = 0;
    let maxDiffWeight = 0;
    if(body.goalSelect === 'loseWeight'){
      maxDiffWeight = (bmi-minBmi)*(body.height*body.height);
      const rangeBmi = (bmi - 18.5)/3;
      avgDiffWeight = (bmi - (minBmi+rangeBmi))*(body.height*body.height);
      minDiffWeight = (bmi - (minBmi+rangeBmi*2))*(body.height*body.height);
    }else {
      maxDiffWeight = (maxBmi-bmi)*(body.height*body.height);
      const rangeBmi = (maxBmi-bmi)/3;
      avgDiffWeight = (maxBmi - (bmi+rangeBmi*2))*(body.height*body.height);
      minDiffWeight = (maxBmi - (bmi+rangeBmi))*(body.height*body.height);
    }
    timeToGoal = fuzzyLogicNutrition.do_de_fuzzy(body.frequentlyGym,diffWeight,3,5,7,minDiffWeight,avgDiffWeight,maxDiffWeight,diffWeight*7,diffWeight*7*2,diffWeight*7*3);

    const goalCalo = fuzzyLogicNutrition.calculateGoalCalories(tdee,timeToGoal,body.goalWeight,body.currentWeight,caloConsumed);
    return {caloConsumed:caloConsumed,caloNeed:goalCalo, timeToGoal:timeToGoal}
  }
}
