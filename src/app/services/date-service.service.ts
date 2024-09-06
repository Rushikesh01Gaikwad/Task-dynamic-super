import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateServiceService {

  constructor(private datePipe:DatePipe) { }
  validateDate(date: Date): boolean   
 {
    // Your validation logic here
    const minDate = new Date('2024-04-01');
    const maxDate = new Date('2025-03-31');
    return date >= minDate && date <= maxDate;
  }

  formatDate(date:any) {
   return    this.datePipe.transform(date,'dd-MM-yyyy');
  //const indianDate = date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  //console.log(indianDate);
  
  }
}
