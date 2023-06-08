import { AutoNN } from './training.models';

export class TrainingModel<t> implements AutoNN.Model<t> {
  public key;
  public data: number[] = [];
  public max = Math.max(...this.values);
  public min = Math.min(...this.values);
  public mean = 0;
  public median = 0;
  public standardDeviation = 0;

  constructor(public values: number[], public operation: AutoNN.Operation<t>) {
    this.key = operation.key;
    // Create Mean
    this.mean = this.values.reduce((sum, val) => sum + val, 0) / this.values.length;
    // Create standard deviation
    this.standardDeviation = Math.sqrt(this.values.map(x => Math.pow(x - this.mean, 2)).reduce((a, b) => a + b) / this.values.length);
    // Calculate median value
    this.median = this.medianCalculate(this.values);
    switch (operation.op) {
      case 'n':
        this.data = this.values.map(v => this.normalize(v));
        break;
      case 's':
        this.data = this.values.map(v => this.normalize(v));
        break;
      default:
        this.data = this.values;
        break;
    }
  }

  public normalize(num: number) {
    return (num - this.min) / (this.max - this.min);
  }

  public denormalize(num: number) {
    return num * (this.max - this.min) + this.min;
  }

  public standarize(num: number) {
    return (num - this.mean) / this.standardDeviation;
  }

  public destandarize(num: number) {
    return num * this.standardDeviation + this.mean;
  }

  /**
   * Calculate the median value of the input data
   * @param arr
   * @returns
   */
  medianCalculate(arr: number[]): number {
    const sortedArray = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sortedArray.length / 2);

    if (sortedArray.length % 2 !== 0) {
      return sortedArray[mid];
    } else {
      return (sortedArray[mid - 1] + sortedArray[mid]) / 2;
    }
  }
}
