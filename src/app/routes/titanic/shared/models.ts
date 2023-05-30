export interface Passenger {
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

export interface PassengerNormalized {
  PassengerId: number;
  Survived?: number;
  Pclass: number;
  Sex: number;
  Age: number;
  SibSp: number;
  Parch: number;
  Fare: number;
}
