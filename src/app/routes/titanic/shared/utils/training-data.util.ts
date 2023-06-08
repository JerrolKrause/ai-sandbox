import { TrainingModel } from './training-data.class';
import { AutoNN } from './training.models';

/**
 * Convert model data to training data
 * @param passengers
 * @returns
 */
export const modelToTrainingData = <t>(models: t[] | null, values: AutoNN.Operation<t>[] | null, output: AutoNN.Operation<t>): AutoNN.TrainingModel<t> => {
  console.log('models', models);
  // Hold source data used in the compilation of the training data
  // Consumers of the training data will need to know what data to normalize/standardize against without recalculating it
  const source = {} as AutoNN.Source<t>;
  // Loop through each value and create the container record in the source object
  values?.forEach(v => {
    if (!source[v.key]) {
      source[v.key] = {
        data: [],
        max: 0,
        min: 0,
      };
    }
  });

  if (!models || !values) {
    return {
      trainingData: [],
      source,
    };
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

  // Loop through the new dataset and
  flattenedData.forEach((data, i) => {
    const value = values[i];
    const temp = new TrainingModel(data, value);
    console.log('Class', temp);
    // source[value.key].values = values;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const denormalize = (num: number) => num * (max - min) + min;
    const normalize = (num: number) => (num - min) / (max - min);
    const sourceOjb = {
      data,
      max,
      min,
      denormalize,
      normalize,
    };
    source[value.key] = { ...source[value.key], ...sourceOjb };
  });
  console.warn('flattenedData', flattenedData);
  // Second Operation
  // Perform the normalization or standardization as required
  const mappedData = flattenedData.map((data, i) => mapData(data, values[i].op));
  console.warn('mappedData', mappedData);
  // Third Operation
  // Reassemble the normalized/standardized data back into the original models array with all the values joined up
  const trainingData = [];
  for (var x = 0; x < models.length; x++) {
    const modelNew: number[] = [];
    for (var y = 0; y < values.length; y++) {
      modelNew.push(mappedData[y][x]);
    }

    // Format the model used for brain.js. Add in the output model
    trainingData.push({
      input: modelNew,
      output: [models[x][output.key]],
    });
  }
  console.warn('source, trainingData', { source, trainingData });
  return { source, trainingData };
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
