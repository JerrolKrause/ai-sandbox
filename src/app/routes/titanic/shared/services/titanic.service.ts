import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, filter, fromEvent, map, take, tap } from 'rxjs';
import { Passenger } from '../models';

@Injectable({ providedIn: 'root' })
export class TitanicService {
  /** Web worker used to train neural nets */
  private worker = new Worker('/assets/workers/train-neural-net.js');

  /** Listen to the web worker to receive trained models */
  public nnModelReceived$ = fromEvent<MessageEvent>(this.worker, 'message').pipe(filter(x => !!x && x.origin === ''));

  /** Passengers on the titanic */
  public passengersStore$ = new BehaviorSubject<Passenger[] | null>(null);

  public passengersRanges$ = this.passengersStore$.pipe(
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
    this.passengersStore$.next(null);
    this.http.get<Passenger[]>('/assets/datasets/titanic.json').subscribe(r => this.passengersStore$.next([...r]));
  }

  /**
   * Train a neural net with the provided dataset
   * @param trainingData
   * @param modelId
   * @returns
   */
  public trainNeuralNet$(trainingData: any, modelId?: string): Observable<{ data: any; timeStamp: number }> {
    if (modelId && localStorage.getItem(modelId)) {
      const model = JSON.parse(localStorage.getItem(modelId) || '{}');
      return new BehaviorSubject({
        data: model,
        timeStamp: 0,
      }).pipe(take(1));
    }
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
}
