import { MasterPageModule } from '$components';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { TitanicRouting } from './titanic-routing.module';
import { TitanicComponent } from './titanic.component';

@NgModule({
  imports: [CommonModule, MasterPageModule, SliderModule, TitanicRouting, ReactiveFormsModule, SelectButtonModule, ProgressSpinnerModule],
  declarations: [TitanicComponent],
})
export class TitanicModule {}
