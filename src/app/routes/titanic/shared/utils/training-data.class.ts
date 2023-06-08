import { AutoNN } from './training.models';

export class TrainingModel<t> implements AutoNN.Model<t> {
  public data: number[] = [];
  public max = Math.max(...this.values);
  public min = Math.min(...this.values);

  constructor(public values: number[], public operation: AutoNN.Operation<t>) {
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
}
