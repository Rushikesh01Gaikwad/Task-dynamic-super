import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoundValueService {

  constructor() { }

  roundValue2(value: number, decimalPlaces: number = 2){
    return +(value.toFixed(decimalPlaces))
  }

}
