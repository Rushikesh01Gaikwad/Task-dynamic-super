import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDirRound]'
})
export class DirRoundDirective {

  @Input('appround') decimalPlaces: number = 2

  constructor(private el: ElementRef) { }

  @HostListener('input', [`$event.target.value`]) onInput(value: string) {
    this.formatValue(value)
  }

  private formatValue(value:string){
    let NumericValue = +(value);
    if (!isNaN(NumericValue)){
      const roundedValue = NumericValue.toFixed(this.decimalPlaces);
      this.el.nativeElement.value = roundedValue
    }
  }

}
