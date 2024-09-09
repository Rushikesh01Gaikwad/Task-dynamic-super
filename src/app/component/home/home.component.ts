import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Icustomer } from '../../interfaces/icustomer';
import { IRitem, Iresult } from '../../interfaces/iresult';
import { MatTableDataSource } from '@angular/material/table';
import { ResultServiceService } from '../../services/result-service.service';
import ItemJson from '../../jsonData/item.json';
import { IItem } from '../../interfaces/i-item';
import customerJson from '../../jsonData/customer.json';
import { DateServiceService } from '../../services/date-service.service';
import { RoundValueService } from '../../services/round-value.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  displayedColumns: string[] = ['I_id', 'I_name', 'I_QtyUnit', 'Item_Qty', 'Item_Rate', 'Item_Value', 'Action'];
  dataSource = new MatTableDataSource<IRitem>();

  editIndex: number = -1;
  dateInvalid: boolean = false
  selectedCustomerDetails: any = null;

  entityIResult: Iresult = <Iresult>{};
  reference: IRitem = <IRitem>{};
  entityICustomer: Icustomer = <Icustomer>{}

  jsonItems = <IItem[]>ItemJson
  customers = <Icustomer[]>customerJson;

  customerControl = new FormControl<string | Icustomer>('');
  itemControl = new FormControl<IItem | string>('');
  filteredOptions!: Observable<Icustomer[]>;

  constructor(private resultService: ResultServiceService, private cd: ChangeDetectorRef, private dateService: DateServiceService, private round: RoundValueService) { }

  ngOnInit(): void {
    this.jsonItems = <IItem[]>[];
    this.entityIResult.Items = <IRitem[]>[];
    this.reference.Item = <IItem>{};
    this.filteredOptions = this.customerControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : value?.acc_name;
        return filterValue ? this._filter(filterValue) : this.customers.slice();
      })
    );
    // this.dataSource.data= this.entityIResult.Items;
    this.updateTableData();
    this.jsonItems = ItemJson;
  }

  openAddEditModal(idx?: number, item?: IRitem) {
    this.editIndex = idx !== undefined ? idx : -1;
    if (this.editIndex >= 0 && item) {
      this.reference = Object.assign({}, item);
    }
    else {
      this.reference = <IRitem>{};
      this.reference.Item = <IItem>{};
    }
    this.cd.detectChanges();

  }

  saveItem(): void {

    if (this.editIndex >= 0) {
      this.entityIResult.Items![this.editIndex] = {
        ...this.reference,
        Item_Value: this.calculateItemValue(this.reference),
      };
    } else {
      this.reference.Item_Value = this.calculateItemValue(this.reference);
      this.entityIResult.Items!.push(this.reference);
      console.log(this.entityIResult.Items)
    }

    this.clearItemSelection();
    this.updateTableData();
  }

  displayFn(customer: Icustomer | null): string {
    return customer ? customer.acc_name : '';
  }

  private _filter(value: string): Icustomer[] {
    const filterValue = value.toLowerCase();
    return this.customers.filter(customer =>
      customer.acc_name.toLowerCase().includes(filterValue)
    );
  }

  onItemSelected(item: IItem): void {
    this.reference.Item_Id = item.I_id;
    this.reference.Item = item;

    this.cd.detectChanges();
    this.updateTableData();
  }

  validateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.entityIResult.order_no = input.value
  }

  private calculateItemValue(Obj: IRitem): number {
    // return +((Obj.Item_Qty * Obj.Item_Rate).toFixed(2));
    return this.round.roundValue2(+(Obj.Item_Qty * Obj.Item_Rate))

  }

  private updateFinalAmount(): void {
    this.entityIResult.Amount = this.entityIResult.Items!.reduce((sum, current) => sum + current.Item_Value, 0);
    // this.entityIResult.Amount = +(this.entityIResult.Amount.toFixed(2));
    this.entityIResult.Amount = this.round.roundValue2(+(this.entityIResult.Amount))
  }

  onOptionSelected(event: any): void {
    this.selectedCustomerDetails = event.option.value;
    this.entityIResult.cust_id = this.selectedCustomerDetails.acc_code;
  }

  async handleDateChange(event: any) {
    var inputDate = new Date(event.target.value);
    if (this.dateService.validateDate(inputDate)) {
      this.dateInvalid = false
    } else {
      this.dateInvalid = true
    }
  }

  clearItemSelection(): void {
    this.reference = <IRitem>{};
    this.editIndex = -1;
  }

  submitData(): void {
    this.entityIResult.Order_date = (this.dateService.formatDate(this.entityIResult.Order_date)!)
    this.resultService.postResult(this.entityIResult).subscribe((responce) => {
      console.log(responce)
      if (responce) {
        console.log("Data posted successfully...")
        window.location.reload();
      }
      else {

      }
    }, (error) => {
      console.log(error.massage)
    })
  }

  private updateTableData(): void {
    this.dataSource.data = this.entityIResult.Items || [];
    this.updateFinalAmount();
  }

  deleteItem() {
    this.entityIResult.Items = this.entityIResult.Items?.filter(item => item.Item_Id !== this.reference.Item_Id);
    this.reference = <IRitem>{};
    this.updateTableData();
  }
}
