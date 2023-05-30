import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

declare var brain: any;

interface Passenger {
  PassengerId: number;
  Survived: number;
  Pclass: number;
  Name: string;
  Sex: string;
  Age: number;
  SibSp: number;
  Parch: number;
  Ticket: number;
  Fare: number;
  Cabin: string;
  Embarked: string;
}

@Component({
  selector: 'app-titanic',
  templateUrl: './titanic.component.html',
  styleUrls: ['./titanic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitanicComponent implements OnInit, OnDestroy {
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Passenger[]>('assets/datasets/titanic.json').subscribe(dataset => {
      dataset.length = 20;
      // console.log('1-0', this.normalizePassengers(dataset));
      // const passengers = dataset.map(this.normalizePassenger);
      const passengers = this.normalizePassengers(dataset);
      console.log('Passengers', passengers);
      console.time('Training NN took');
      // Create a new neural network instance
      const net = new brain.NeuralNetworkGPU();
      net.train(passengers);
      console.timeEnd('Training NN took');

      const temp = [...passengers];
      temp.length = 20;
      temp.forEach((p, i) => {
        const output = net.run(p.input);
        console.log(dataset[i].Name, p, output);
      });
    });
  }

  normalizePassengers(passengers: Passenger[]) {
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

    // Then, we normalize each passenger
    return passengers.map(passenger => {
      return {
        input: {
          PassengerId: (passenger.PassengerId - ranges.PassengerId[0]) / (ranges.PassengerId[1] - ranges.PassengerId[0]),
          Survived: (passenger.Survived - ranges.Survived[0]) / (ranges.Survived[1] - ranges.Survived[0]),
          Pclass: (passenger.Pclass - ranges.Pclass[0]) / (ranges.Pclass[1] - ranges.Pclass[0]),
          Sex: passenger.Sex === 'male' ? 1 : 0, // We treat 'Sex' as a categorical variable
          Age: (passenger.Age - ranges.Age[0]) / (ranges.Age[1] - ranges.Age[0]),
          SibSp: (passenger.SibSp - ranges.SibSp[0]) / (ranges.SibSp[1] - ranges.SibSp[0]),
          Parch: (passenger.Parch - ranges.Parch[0]) / (ranges.Parch[1] - ranges.Parch[0]),
          // Ticket: passenger.Ticket, // 'Ticket' is a unique string identifier and cannot be meaningfully normalized
          Fare: (passenger.Fare - ranges.Fare[0]) / (ranges.Fare[1] - ranges.Fare[0]),
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
