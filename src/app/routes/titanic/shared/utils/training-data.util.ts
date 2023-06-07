interface Ops<t> {
  key: keyof t;
  op?: null | 'n' | 's';
}

/**
 * Convert passenger data to training data
 * @param passengers
 * @returns
 */
export const modelToTrainingData = <t>(models: t[] | null, values: Ops<t>[] | null) => {
  if (!models || !values) {
    return [];
  }
  const mappedData: any[][] = [];

  console.log('Model', models);
  console.log('Values', values);
  // Loop through models
  for (var x = 0; x < models.length; x++) {
    const m = models[x];
    // Loop through the values
    for (var y = 0; y < values.length; y++) {
      const v = values[y];
      const value = m[v.key];
      if (!mappedData[y]) {
        mappedData[y] = [];
      }
      mappedData[y].push(value);
    }
  }

  const finalOutput: number[][] = [];
  for (var x = 0; x < models.length; x++) {
    const modelNew: number[] = [];
    for (var y = 0; y < values.length; y++) {
      console.log(x, y);
      modelNew.push(mappedData[y][x]);
    }
    finalOutput.push(modelNew);
  }

  console.log('mappedData', mappedData);
  console.log('finalOutput', finalOutput);

  return finalOutput;
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
