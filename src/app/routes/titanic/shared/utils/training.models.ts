export module AutoNN {
  export interface Operation<t> {
    /** Key in the model to access a property */
    key: keyof t;
    /** Apply normalization or standardization to this value */
    op?: null | 'n' | 's';
    /** A function that receives the model and returns a value. This will be used in place of the actual value in the model */
    value?: (m: t) => number;
  }

  export interface Model<t> {
    /** The key of the input model */
    key: keyof t;
    /** The final output data after any modifications like normalization or standardization */
    data: number[];
    /** The source input data before any modifications */
    values: number[];
    /** The highest number in the values array */
    max: number;
    /** The lowest number in the values array */
    min: number;
    /** The average of the numbers in the values array */
    mean: number;
    /** The middle number in a set of numbers */
    median: number;
    /** How spread out numbers are from the average (mean) value */
    standardDeviation: number;
    /**
     * Normalize an array of numbers to a range between 0 and 1.
     * @param num
     * @returns
     */
    normalize: (num: number) => number;
    /**
     * De-normalize a number back to its original value.
     * @param num
     * @returns
     */
    denormalize: (num: number) => number;
    /**
     * Standardize an array of numbers, transforming it to have a mean of 0 and a standard deviation of 1
     * @param num
     * @returns
     */
    standarize: (num: number) => number;
    /**
     * De-standardize a number back to its original value.
     * @param num
     * @returns
     */
    destandarize: (num: number) => number;
    /**
     * Calculate the median value of the input data
     * @param arr
     * @returns
     */
    medianCalculate: (arr: number[]) => number;
  }

  export interface SourceData {
    data: number[];
    max: number;
    min: number;
  }

  export type Source<t> = Record<keyof t, SourceData>;

  export interface TrainingModel<t> {
    trainingData: any[];
    source: Source<t>;
  }
}
