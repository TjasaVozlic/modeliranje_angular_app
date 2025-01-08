import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopsisComponent } from './topsis/topsis.component';
import { WsmComponent } from './wsm/wsm.component';
import { PrometheeComponent } from './promethee/promethee.component';
import { AhpComponent } from './ahp/ahp.component';
import { HeaderComponent } from './header/header.component';
import { EnsembleComponent } from './ensemble/ensemble.component';
import { DataComponent } from './data/data.component';
import { MatTableModule } from '@angular/material/table';
import { MatHeaderCell, MatRowDef } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

@NgModule({
  declarations: [
    AppComponent,
    TopsisComponent,
    WsmComponent,
    PrometheeComponent,
    AhpComponent,
    HeaderComponent,
    EnsembleComponent,
    DataComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatTableModule, // Za uporabo mat-table
    MatSortModule, // Za sortiranje stolpcev
    MatPaginatorModule, // Za straničenje
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
