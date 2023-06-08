import { TrainingModel } from './training-data.class';
import { AutoNN } from './training.models';

/**
 * Convert model data to training data
 * @param passengers
 * @returns
 */
export const modelToTrainingData = <t>(
  models: t[] | null,
  values: AutoNN.Operation<t>[] | null,
  output: AutoNN.Operation<t>,
): AutoNN.TrainingModel<t> | null => {
  // console.log('models', models);

  if (!models || !values) {
    console.error('Missing essential data');
    return null;
  }

  // First Operation:
  // Loop through all the models and put all the same values in one array
  // This allows that data to be normalized or standardized
  const flattenedData: any[][] = []; // TODO: Remove any;
  // Loop through models
  for (var x = 0; x < models.length; x++) {
    const m = models[x];
    // Loop through the values
    for (var y = 0; y < values.length; y++) {
      const v = values[y];
      let value: t[keyof t] | number = m[v.key];
      if (v.value) {
        value = v.value(m);
      }
      if (!flattenedData[y]) {
        flattenedData[y] = [];
      }
      flattenedData[y].push(value);
    }
  }

  // Generate outputs, this is fed to the neural net as the output property
  const outputs = models.map(m => m[output.key]) as number[];

  // Convert the now flattened data into training model classes. This class handles most of the data operations
  const source = flattenedData.reduce((a, b, i) => {
    const value = values[i];
    return { ...a, [value.key]: new TrainingModel(b, value) };
  }, {} as AutoNN.Source<t>);

  // Convert models and flattened data into format needed by the neural net for training
  const trainingData = models.map((_m, i) => ({
    input: values.map(v => source[v.key].data[i]),
    output: [outputs[i]],
  }));

  return { source, trainingData, outputs, srcModel: models };
};

/**
 * Convert training data to passenger data
 * @param data
 */
export const dataToPassenger = (data: number[]) => {};

/**
 * Takes a number array and a method array and allows the data to be either normalized or standardized.
 * @param data
 * @param method
 * @returns
 */
export const mapData = (data: number[], method: 'n' | 's' | null | undefined) => {
  // console.log('mapData', data, method);
  let max = Math.max(...data);
  let min = Math.min(...data);
  let mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  let standardDeviation = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / data.length);
  // Loop through data, if method array contains a corresponding N or S, normalize or standardize the data
  return data.map(num => {
    switch (method) {
      // Normalize
      case 'n':
        return (num - min) / (max - min);
      // Standardize
      case 's':
        return (num - mean) / standardDeviation;
      // Do not modify number
      default:
        return num;
    }
  });
};

/**
 *
 * @param numbers
 * @param i
 * @returns
 */
export const normalize = (numbers: number[], i?: number): number | number[] => {
  const max = Math.max(...numbers);
  const min = Math.min(...numbers);

  return typeof i === 'number' ? (numbers[i] - min) / (max - min) : numbers.map(num => (num - min) / (max - min));
};
