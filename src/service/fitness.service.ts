export class FuzzyLogic {
  // private fuzzy_rules_table: number[][] = [[1, 1, 1], [2, 2, 1], [3, 3, 2]];
  private readonly fuzzy_rules_table: number[][];
  constructor(fuzzyRulesTable) {
    this.fuzzy_rules_table = fuzzyRulesTable;
  }

  private member_table_value: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  private width_fuzzy_rules_table: number = 3;
  private height_fuzzy_rules_table: number = 3;

  private find_y(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
  ): number {
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;
    return m * x + b;
  }

  private find_x(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    y: number,
  ): number {
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;
    return (y - b) / m;
  }

  private do_fuzzification_of_variable(
    variable: number,
    min: number,
    average: number,
    max: number,
  ): number[] {
    let percent_min = 0,
      percent_avg = 0,
      percent_max = 0;
    if (variable <= min) {
      percent_min = 1;
    } else if (variable > min && variable < max) {
      if (variable < average) {
        percent_avg = this.find_y(min, 0, average, 1, variable);
        percent_min = 1 - percent_avg;
      } else if (variable > average) {
        percent_avg = this.find_y(average, 1, max, 0, variable);
        percent_max = 1 - percent_avg;
      } else {
        percent_avg = 1;
      }
    } else {
      percent_max = 1;
    }
    return [percent_min, percent_avg, percent_max];
  }

  public do_de_fuzzy(
    var_1: number,
    var_2: number,
    min_1,
    avg_1,
    max_1,
    min_2,
    avg_2,
    max_2,
    min_output,
    avg_output,
    max_output,
  ): number {
    const [percent_min_1, percent_avg_1, percent_max_1] =
      this.do_fuzzification_of_variable(var_1, min_1, avg_1, max_1);
    const [percent_min_2, percent_avg_2, percent_max_2] =
      this.do_fuzzification_of_variable(var_2, min_2, avg_2, max_2);
    const array_var_1 = [percent_min_1, percent_avg_1, percent_max_1];
    const array_var_2 = [percent_min_2, percent_avg_2, percent_max_2];

    const fuzzy_dict: { [key: number]: number } = { 1: 0, 2: 0, 3: 0 };
    for (let i = 0; i < array_var_1.length; i++) {
      for (let j = 0; j < array_var_2.length; j++) {
        this.member_table_value[i][j] = Math.min(
          array_var_1[j],
          array_var_2[i],
        );
      }
    }
    for (let i = 0; i < this.height_fuzzy_rules_table; i++) {
      for (let j = 0; j < this.width_fuzzy_rules_table; j++) {
        if (
          fuzzy_dict[this.fuzzy_rules_table[i][j]] <
          this.member_table_value[i][j]
        ) {
          fuzzy_dict[this.fuzzy_rules_table[i][j]] =
            this.member_table_value[i][j];
        }
      }
    }
    const output_tmp =
      fuzzy_dict[1] * (avg_output / 2) +
      fuzzy_dict[2] * avg_output +
      fuzzy_dict[3] * max_output;
    const output = output_tmp / (fuzzy_dict[1] + fuzzy_dict[2] + fuzzy_dict[3]);
    return output;
  }
  public calculateTdee(
    gender: string,
    weight: number,
    height: number,
    age: number,
    activityLevel: number,
  ): number {
    if (gender !== 'male' && gender !== 'female') {
      throw new Error("Giới tính phải là 'male' hoặc 'female'");
    }
    if (activityLevel < 1.2 || activityLevel > 1.9) {
      throw new Error('Mức độ hoạt động phải nằm trong khoảng từ 1.2 đến 1.9');
    }

    // Công thức Harris-Benedict
    let bmr: number;
    if (gender === 'male') {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      // gender === 'female'
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }

    const tdee: number = bmr * activityLevel;
    return tdee;
  }
  public calculateGoalCalories(
    tdee: number,
    timeExpect: number,
    goalWeight: number,
    currentWeight: number,
    caloriesConsumed: number,
  ): number {
    const caloriesPerKg = 7700;
    const weightDiff = goalWeight - currentWeight;
    const calorieDiff = weightDiff * caloriesPerKg;
    const calorieBonusPerDay = calorieDiff / timeExpect;
    const calorieGoal = calorieBonusPerDay + tdee + caloriesConsumed;
    return calorieGoal;
  }
  public luaChonMonAn(monAnList, caloMucTieu: number) {
    const numberOfMonAn = monAnList.length;

    // Tạo ma trận DP để lưu trữ giá trị tối đa có thể đạt được cho từng bước
    const dp: number[][] = [];

    for (let i = 0; i <= numberOfMonAn; i++) {
      dp[i] = [];
      for (let j = 0; j <= caloMucTieu; j++) {
        dp[i][j] = 0;
      }
    }

    // Bắt đầu tính giá trị tối đa có thể đạt được
    for (let i = 1; i <= numberOfMonAn; i++) {
      const monAn = monAnList[i - 1];
      for (let j = 1; j <= caloMucTieu; j++) {
        if (monAn.Calo <= j) {
          dp[i][j] = Math.max(
            dp[i - 1][j],
            dp[i - 1][j - monAn.Calo] + monAn.Calo,
          );
        } else {
          dp[i][j] = dp[i - 1][j];
        }
      }
    }

    // Thuật toán đã hoàn thành, bây giờ chúng ta xác định danh sách các món ăn được chọn
    const monAnDuocChon = [];
    let i = numberOfMonAn;
    let j = caloMucTieu;

    while (i > 0 && j > 0) {
      if (dp[i][j] !== dp[i - 1][j]) {
        const monAn = monAnList[i - 1];
        monAnDuocChon.push(monAn);
        j -= monAn.Calo;
      }
      i--;
    }

    return monAnDuocChon.reverse();
  }
}
