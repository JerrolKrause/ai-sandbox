interface Ops<t> {
  /** Key in the model to access a property */
  key: keyof t;
  /** Apply normalization or standardization to this value */
  op?: null | 'n' | 's';
  /** A function that receives the model and returns a value. This will be used in place of the actual value in the model */
  value?: (m: t) => number;
}

/**
 * Convert model data to training data
 * @param passengers
 * @returns
 */
export const modelToTrainingData = <t>(models: t[] | null, values: Ops<t>[] | null) => {
  if (!models || !values) {
    return [];
  }

  // First Operation:
  // Loop through all the models and put all the same values in one array
  // This allows that data to be normalized or standardized
  const flattenedData: any[][] = [];
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

  // Second Operation
  // Perform the normalization or standardization as required
  const mappedData = flattenedData.map((data, i) => mapData(data, values[i].op));

  // Third Operation
  // Reassemble the normalized/standardized data back into the original models array with all the values joined up
  const finalOutput: number[][] = [];
  for (var x = 0; x < models.length; x++) {
    const modelNew: number[] = [];
    for (var y = 0; y < values.length; y++) {
      modelNew.push(mappedData[y][x]);
    }
    finalOutput.push(modelNew);
  }

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
