import { Memoize, removeNils } from '$shared';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, debounceTime, filter, map, mergeMap, take } from 'rxjs';
import { Passenger, PassengerNormalized } from './shared/models';
import { TitanicService } from './shared/services/titanic.service';
import { modelToTrainingData } from './shared/utils';

declare var brain: any;

type Nillable<T> = {
  [P in keyof T]?: T[P] | null | undefined;
};

interface State {
  loading: boolean;
  survivalOdds: number | null;
  timeToTrain: number | null;
}

@Component({
  selector: 'app-titanic',
  templateUrl: './titanic.component.html',
  styleUrls: ['./titanic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitanicComponent implements OnInit, OnDestroy {
  public state$ = new BehaviorSubject<State>({ loading: true, survivalOdds: null, timeToTrain: null });

  public passengerForm = this.fb.group<PassengerNormalized>({
    PassengerId: 0,
    Pclass: 0,
    Sex: 0,
    Age: 0,
    SibSp: 0,
    Parch: 0,
    Fare: 0,
  });

  public sexOptions = [
    { label: 'None', value: null },
    { label: 'Male', value: 1 },
    { label: 'Female', value: 0 },
  ];

  public siblingOptions = [
    { label: 'None', value: null },
    { label: 0, value: this.normalizeNumberRange(0, 0, 8) },
    { label: 1, value: this.normalizeNumberRange(1, 0, 8) },
    { label: 2, value: this.normalizeNumberRange(2, 0, 8) },
    { label: 3, value: this.normalizeNumberRange(3, 0, 8) },
    { label: 4, value: this.normalizeNumberRange(4, 0, 8) },
    { label: 5, value: this.normalizeNumberRange(5, 0, 8) },
    { label: 6, value: this.normalizeNumberRange(6, 0, 8) },
    { label: 7, value: this.normalizeNumberRange(7, 0, 8) },
    { label: 8, value: this.normalizeNumberRange(8, 0, 8) },
  ];

  public classOptions = [
    { label: 'None', value: null },
    { label: '1st Class', value: this.normalizeNumberRange(1, 1, 3) },
    { label: '2nd Class', value: this.normalizeNumberRange(2, 1, 3) },
    { label: '3rd Class', value: this.normalizeNumberRange(3, 1, 3) },
  ];

  private net = new brain.NeuralNetworkGPU();
  private localStorageKey = 'titanic';

  constructor(private fb: FormBuilder, private svc: TitanicService) {
    this.passengerForm.reset();
    this.passengerForm.valueChanges.pipe(takeUntilDestroyed(), debounceTime(10)).subscribe(passenger => this.formChange(passenger));

    // Retrain neural net when passenger data changes
    this.svc.passengers$
      .pipe(
        takeUntilDestroyed(),
        filter(x => !!x),
        // map(passengers => this.normalizePassengers(passengers)),
        map(passengers => {
          passengers = passengers?.filter((_x, i) => i < 10) || [];
          // console.log(passengers);
          console.time('Remap Time');
          console.log(
            modelToTrainingData(passengers, [
              { key: 'Sex', value: p => (p.Sex === 'male' ? 1 : 0) },
              { key: 'Age', op: 'n' },
              { key: 'SibSp', op: 'n' },
            ]),
          );
          console.timeEnd('Remap Time');
          /**
          // console.log('Passengers', passengers);
          const men = passengers?.filter(x => x.Sex === 'male');
          console.log(
            'Male',
            men?.filter(x => x.Survived).length + '/' + men.length,
            Math.floor((men?.filter(x => x.Survived).length / men.length) * 100) + '%',
          );
          const women = passengers?.filter(x => x.Sex !== 'male');
          console.log(
            'Women',
            women?.filter(x => x.Survived).length + '/' + women.length,
            Math.floor((women?.filter(x => x.Survived).length / women.length) * 100) + '%',
          );
           */
          return passengers?.map(passenger => {
            return {
              input: [passenger.Sex === 'male' ? 1 : 0],
              output: [passenger.Survived],
            };
          });
        }),

        mergeMap(dataset => this.svc.trainNeuralNet$(dataset, this.localStorageKey)),
      )
      .subscribe(message => {
        /** */
        // console.log('Training took: ', Math.floor(message.timeStamp / 1000), 'seconds', message);
        // console.time('Loading model took: ');
        this.net = new brain.NeuralNetworkGPU();
        this.net.fromJSON(message.data);
        // console.log('Model: ', message.data);
        this.stateChange({ loading: false, timeToTrain: message.timeStamp });
        // console.timeEnd('Loading model took: ');
        /**
          console.time('Training took: ');
          this.net = new brain.NeuralNetworkGPU();
          this.net.train(message);

          this.stateChange({ loading: false, timeToTrain: message.timeStamp });
          console.timeEnd('Training took: ');
        */
      });
  }

  ngOnInit() {
    //  console.log(1, this.svc.mapData([0, 50, 100], []));
  }

  /**
   * Remove any stored/trained model and reset state
   */
  public resetModel() {
    localStorage.removeItem(this.localStorageKey);
    this.stateChange({ loading: true, timeToTrain: null });
    this.svc.loadData();
  }

  /**
   * Change route state
   * @param state
   */
  private stateChange(state: Partial<State>) {
    this.state$.pipe(take(1)).subscribe(stateOld => this.state$.next({ ...stateOld, ...state }));
  }

  /**
   * When the form changes, display the results in the browser
   * @param passenger
   */
  private formChange(passenger: Nillable<PassengerNormalized>) {
    const data = removeNils({ ...passenger });

    try {
      const result = this.net.run([data.Sex]);
      this.stateChange({ survivalOdds: Math.floor(result[0] * 100) });
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Normalizes a number to a range between 0 and 1.
   *
   * @param {number} value - The number to be normalized.
   * @param {number} min - The minimum value in the range of the input.
   * @param {number} max - The maximum value in the range of the input.
   * @returns {number} - The normalized number, now within a range of 0 to 1.
   *
   * @private
   */
  private normalizeNumberRange(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  /**
   * Denormalizes a number from a range of 0 to 1 back to its original range.
   *
   * @param {number} value - The number to be denormalized (expected to be in the range [0,1]).
   * @param {number} min - The minimum value of the original range.
   * @param {number} max - The maximum value of the original range.
   * @returns {number} - The denormalized number, now within the range defined by `min` and `max`.
   *
   * @private
   */
  private denormalizeNumberRange(value: number, min: number, max: number): number {
    return value * (max - min) + min;
  }

  /**
   *
   * @param passengers
   * @returns
   */
  @Memoize()
  private determineValidRanges(passengers: Passenger[]) {
    // First, we calculate the range of each field
    const ranges = passengers.reduce(
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
    return ranges;
  }

  normalizePassengers(passengers: Passenger[] | null) {
    if (!passengers) {
      return [];
    }
    const ranges = this.determineValidRanges(passengers);
    // console.log('Ranges', ranges);
    const temp = [...passengers];
    temp.length = 20;

    // Then, we normalize each passenger
    return passengers.map(passenger => {
      const toFixed = 1;
      return {
        input: {
          // PassengerId: (passenger.PassengerId - ranges.PassengerId[0]) / (ranges.PassengerId[1] - ranges.PassengerId[0]),
          // Survived: (passenger.Survived - ranges.Survived[0]) / (ranges.Survived[1] - ranges.Survived[0]),
          // Pclass: Number(((passenger.Pclass - ranges.Pclass[0]) / (ranges.Pclass[1] - ranges.Pclass[0])).toFixed(toFixed)),
          Sex: passenger.Sex === 'male' ? 1 : 0, // We treat 'Sex' as a categorical variable
          // Age: Number(((passenger.Age - ranges.Age[0]) / (ranges.Age[1] - ranges.Age[0])).toFixed(toFixed)),
          // SibSp: Number(((passenger.SibSp - ranges.SibSp[0]) / (ranges.SibSp[1] - ranges.SibSp[0])).toFixed(toFixed)),
          // Parch: Number(((passenger.Parch - ranges.Parch[0]) / (ranges.Parch[1] - ranges.Parch[0])).toFixed(toFixed)),
          // Ticket: passenger.Ticket, // 'Ticket' is a unique string identifier and cannot be meaningfully normalized
          // Fare: (passenger.Fare - ranges.Fare[0]) / (ranges.Fare[1] - ranges.Fare[0]),
          // Cabin: passenger.Cabin, // 'Cabin' is a categorical variable and cannot be meaningfully normalized
          // Embarked: passenger.Embarked, // 'Embarked' is a categorical variable and cannot be meaningfully normalized
        },
        // output: [passenger.Survived],
        /** */
        output: {
          Survived: passenger.Survived,
        },
      };
    });
  }

  ngOnDestroy() {}
}
