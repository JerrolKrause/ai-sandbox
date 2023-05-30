import { MasterPageModule } from '$components';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TitanicRouting } from './titanic-routing.module';
import { TitanicComponent } from './titanic.component';

@NgModule({
  imports: [CommonModule, MasterPageModule, TitanicRouting],
  declarations: [TitanicComponent],
})
export class TitanicModule {}
