import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomDateAdapterService {

  constructor() { }

  format(date: Date, displayFormat: Object): string {
    if (!date) return '';
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
