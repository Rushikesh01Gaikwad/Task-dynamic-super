import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HomeComponent } from './component/home/home.component';
import { NavbarComponent } from './component/navbar/navbar.component';
import { MatLabel } from '@angular/material/form-field';
import { MatHint } from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDatepickerModule,
    MatLabel,
    MatHint,
    MatTableModule,
    HttpClientModule,
    FormsModule,
    NgSelectModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [
    DatePipe,
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
