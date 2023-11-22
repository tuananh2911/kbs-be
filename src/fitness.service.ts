import {Injectable} from '@nestjs/common';
import {spawn} from 'child_process';

export class FuzzyLogic {
    // private fuzzy_rules_table: number[][] = [[1, 1, 1], [2, 2, 1], [3, 3, 2]];
    private readonly fuzzy_rules_table: number[][];
    constructor(fuzzyRulesTable) {
        this.fuzzy_rules_table = fuzzyRulesTable;
    }

    private member_table_value: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    private width_fuzzy_rules_table: number = 3;
    private height_fuzzy_rules_table: number = 3;

    private find_y(x1: number, y1: number, x2: number, y2: number, x: number): number {
        let m = (y2 - y1) / (x2 - x1);
        let b = y1 - m * x1;
        return m * x + b;
    }

    private find_x(x1: number, y1: number, x2: number, y2: number, y: number): number {
        let m = (y2 - y1) / (x2 - x1);
        let b = y1 - m * x1;
        return (y - b) / m;
    }

    private do_fuzzification_of_variable(variable: number, min: number, average: number, max: number): number[] {
        let percent_min = 0, percent_avg = 0, percent_max = 0;
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

    public do_de_fuzzy(var_1: number, var_2: number, min_1,avg_1,max_1,min_2,avg_2,max_2,min_output,avg_output,max_output): number {
        let [percent_min_1, percent_avg_1, percent_max_1] = this.do_fuzzification_of_variable(var_1, min_1, avg_1, max_1);
        let [percent_min_2, percent_avg_2, percent_max_2] = this.do_fuzzification_of_variable(var_2, min_2, avg_2, max_2);
        let array_var_1 = [percent_min_1, percent_avg_1, percent_max_1];
        let array_var_2 = [percent_min_2, percent_avg_2, percent_max_2];

        let fuzzy_dict: { [key: number]: number } = { 1: 0, 2: 0, 3: 0 };
        for (let i = 0; i < array_var_1.length; i++) {
            for (let j = 0; j < array_var_2.length; j++) {
                this.member_table_value[i][j] = Math.min(array_var_1[j], array_var_2[i]);
            }
        }
        for (let i = 0; i < this.height_fuzzy_rules_table; i++) {
            for (let j = 0; j < this.width_fuzzy_rules_table; j++) {
                if (fuzzy_dict[this.fuzzy_rules_table[i][j]] < this.member_table_value[i][j]) {
                    fuzzy_dict[this.fuzzy_rules_table[i][j]] = this.member_table_value[i][j];
                }
            }
        }
        let output_tmp = (fuzzy_dict[1] * this.find_x(min_output, 1, avg_output, 0, fuzzy_dict[1]) + fuzzy_dict[2] * 500 + fuzzy_dict[3] * this.find_x(avg_output, 1, max_output, 0, fuzzy_dict[3]));
        let output = output_tmp / (fuzzy_dict[1] + fuzzy_dict[2] + fuzzy_dict[3]);
        return output
    }
}
