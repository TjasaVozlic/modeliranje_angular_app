import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopsisComponent } from './topsis/topsis.component';
import { WsmComponent } from './wsm/wsm.component';
import { PrometheeComponent } from './promethee/promethee.component';
import { AhpComponent } from './ahp/ahp.component';
import { EnsembleComponent } from './ensemble/ensemble.component';
import { DataComponent } from './data/data.component';

const routes: Routes = [
  {path: "topsis", component: TopsisComponent},
  {path: "waspas", component: WsmComponent},
  {path: "promethee", component: PrometheeComponent},
  {path : "ahp", component: AhpComponent},
  {path: "ensemble", component : EnsembleComponent},
  {path: "data", component : DataComponent},
  {path: "", redirectTo: "/data", pathMatch: "full"}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
