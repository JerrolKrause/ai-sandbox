import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, fromEvent, map, take, tap } from 'rxjs';
import { Passenger } from '../models';

declare var brain: any;

@Injectable({ providedIn: 'root' })
export class TitanicService {
  /** Web worker used to train neural nets */
  private worker = new Worker('/assets/workers/train-neural-net.js');

  /** Listen to the web worker to receive trained models */
  public nnModelReceived$ = fromEvent<MessageEvent>(this.worker, 'message').pipe(filter(x => !!x && x.origin === ''));

  /** Passengers on the titanic */
  public passengers$ = new BehaviorSubject<Passenger[] | null>(null);

  public passengersRanges$ = this.passengers$.pipe(
    map(passengers => {
      return (passengers || []).reduce(
        (acc, passenger) => {
          return {
            PassengerId: [Math.min(acc.PassengerId[0], passenger.PassengerId), Math.max(acc.PassengerId[1], passenger.PassengerId)],
            Survived: [Math.min(acc.Survived[0], passenger.Survived), Math.max(acc.Survived[1], passenger.Survived)],
            Pclass: [Math.min(acc.Pclass[0], passenger.Pclass), Math.max(acc.Pclass[1], passenger.Pclass)],
            Age: [Math.min(acc.Age[0], passenger.Age), Math.max(acc.Age[1], passenger.Age)],
            SibSp: [Math.min(acc.SibSp[0], passenger.SibSp), Math.max(acc.SibSp[1], passenger.SibSp)],
            Parch: [Math.min(acc.Parch[0], passenger.Parch), Math.max(acc.Parch[1], passenger.Parch)],
            Fare: [Math.min(acc.Fare[0], passenger.Fare), Math.max(acc.Fare[1], passenger.Fare)],
          };
        },
        {
          PassengerId: [Infinity, -Infinity],
          Survived: [Infinity, -Infinity],
          Pclass: [Infinity, -Infinity],
          Age: [Infinity, -Infinity],
          SibSp: [Infinity, -Infinity],
          Parch: [Infinity, -Infinity],
          Fare: [Infinity, -Infinity],
        },
      );
    }),
  );

  constructor(private http: HttpClient) {
    this.loadData();
  }

  /**
   * Load or reload passenger data
   */
  public loadData() {
    this.passengers$.next(null);
    this.http.get<Passenger[]>('/assets/datasets/titanic2.json').subscribe(r => this.passengers$.next([...r]));
  }

  public trainNeuralNet(trainingData: any, modelId?: string) {
    // Check if model is stored in localstorage, return that instead
    if (modelId && localStorage.getItem(modelId)) {
      const model = JSON.parse(localStorage.getItem(modelId) || '{}');
      return model;
    }
    console.log('Starting neural net training. This could take a while...');
    console.time('Training model took: ');
    const net = new brain.NeuralNetworkGPU({ hiddenLayers: [3] });
    net.train(trainingData);
    const model = net.toJSON();
    if (modelId) {
      localStorage.setItem(modelId, JSON.stringify(model));
    }
    console.timeEnd('Training model took: ');
    return model;
  }

  /**
   * Train a neural net with the provided dataset
   * @param trainingData
   * @param modelId
   * @returns
   */
  public trainNeuralNet$(trainingData: any, modelId?: string, useWorker = true): Observable<{ data: any; timeStamp: number }> {
    // Check if model is stored in localstorage, return that instead
    if (modelId && localStorage.getItem(modelId)) {
      const model = JSON.parse(localStorage.getItem(modelId) || '{}');
      return new BehaviorSubject({
        data: model,
        timeStamp: 0,
      }).pipe(take(1));
    }
    // console.warn('Starting Training...', trainingData);
    // If NOT using a webworker, do computation in main thread instead
    if (!useWorker) {
      console.time('Training took: ');
      const net = new brain.NeuralNetworkGPU({ hiddenLayers: [3] });
      net.train(trainingData);
      console.timeEnd('Training took: ');
      return new BehaviorSubject({
        data: net.toJSON(),
        timeStamp: 0,
      }).pipe(
        tap(model => {
          if (modelId) {
            localStorage.setItem(modelId, JSON.stringify(model.data));
          }
        }),
        take(1),
      );
    }
    // Use web worker
    this.worker.postMessage(trainingData); // send data to the worker
    return this.nnModelReceived$.pipe(
      tap(model => {
        if (modelId) {
          localStorage.setItem(modelId, JSON.stringify(model.data));
        }
      }),
      map(response => ({
        data: response.data,
        timeStamp: response.timeStamp,
      })),

      take(1),
    );
  }

  public getAllValuesForKey<t>(array: t[] | null, key: keyof t) {
    if (!array) {
      return [];
    }
    const values = array.map(item => item[key]);

    // Remove duplicates
    return [...new Set(values)].sort().map(value => ({ label: this.toTitleCase(String(value)), value }));
  }

  private toTitleCase(str: string) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  /**
   * Takes a number array and a method array and allows the data to be either normalized or standardized.
   * @param data
   * @param method
   * @returns
   */
  public mapData(data: number[], method: ('n' | 's' | null)[]) {
    let max = Math.max(...data);
    let min = Math.min(...data);
    let mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    let standardDeviation = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / data.length);
    // Loop through data, if method array contains a corresponding N or S, normalize or standardize the data
    return data.map((num, i) => {
      switch (method[i]) {
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
  }

  private createSeededRNG(seed: number) {
    let currentSeed = seed;

    // LCG parameters from Numerical Recipes
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    return function (): number {
      currentSeed = (a * currentSeed + c) % m;
      return currentSeed / m;
    };
  }

  seededShuffle<T>(array: T[], seed: number): T[] {
    const rng = this.createSeededRNG(seed);
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
