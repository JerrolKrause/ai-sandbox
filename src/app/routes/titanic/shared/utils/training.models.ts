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
    data: number[];
    values: number[];
    max: number;
    min: number;
    normalize: (num: number) => number;
    denormalize: (num: number) => number;
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
