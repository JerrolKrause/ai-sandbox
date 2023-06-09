import { MasterPageModule } from '$components';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TensorFlowRouting } from './tensor-flow-routing.module';
import { TensorFlowComponent } from './tensor-flow.component';

@NgModule({
  imports: [CommonModule, MasterPageModule, TensorFlowRouting],
  declarations: [TensorFlowComponent],
})
export class TensorFlowModule {}
