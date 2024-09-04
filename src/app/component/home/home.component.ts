import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import customerData from '../../jsonData/customer.json';
import {Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { Icustomer } from '../../interfaces/icustomer';
import { IRitem, Iresult } from '../../interfaces/iresult';
import { MatTableDataSource } from '@angular/material/table';
import { ResultServiceService } from '../../services/result-service.service';
import ItemJson from '../../jsonData/item.json';
import { IItem } from '../../interfaces/i-item';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  finalAmount: number = 0;
  id = 0;
  displayedColumns: string[] = ['I_id', 'I_name', 'I_QtyUnit', 'Item_Qty','Item_Rate','Item_Value','Action'];
  dataSource = new MatTableDataSource<IRitem>();

  entityIResult: Iresult = <Iresult>{
    order_no: '',
    Order_date: '',
    cust_id: 0,
    Amount: 0,
    Items:[
    {
      Item_Id: 0,
      Item_Unit: '',
      Item_Qty: 0,
      Item_Rate: 0,
      Item_Value: 0,
    }
    ]
  };
  entityItem:IItem = <IItem>{
    I_id: 0,
    I_name: '',
    I_QtyUnit:'',
  };

  reference:any;

  selectedItemId!:number;
  editItemName: string = '';
  editItemUnit: string = '';
  editItemQty: number = 0;
  editItemRate: number = 0;

  order_no: string = '';
  Order_date: string = '';
  cust_id: number = 0;
  Amount: number = 0;

  selectedItemQty: number = 0;
  selectedItemRate: number = 0;

  customerControl = new FormControl<string | Icustomer>('');
  filteredOptions!: Observable<Icustomer[]>;
  itemsjson!: Observable<IItem[]>;
  customers: Icustomer[] = customerData;
  selectedCustomerDetails: any = null;

  itemControl = new FormControl<IItem | string>('');
  selectedItemDetails: IItem | undefined;

  // New array to store the items
  items: IRitem[] = [];

  constructor(private resultService :ResultServiceService) {}

  ngOnInit(): void {

    this.entityIResult.Items = <IRitem[]>[];
    this.filteredOptions = this.customerControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : value?.acc_name;
        return filterValue ? this._filter(filterValue) : this.customers.slice();
      })
    );
    this.updateTableData();
    this.itemsjson = this.loadItems(); // Load items here
  }

  loadItems(): Observable<IItem[]> {
    return of(ItemJson);
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
    this.selectedItemDetails = item;
    this.itemControl.setValue(item);
    console.log('Selected Item:', item);
  }
  


  validateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.order_no = input.value
  }

  updateItemValue(element: IRitem): void {
    element.Item_Value = this.calculateItemValue(element.Item_Qty, element.Item_Rate);
    this.updateFinalAmount();
  }

  private calculateItemValue(quantity: number, rate: number): number {
    return parseFloat((quantity * rate).toFixed(2));
  }

  private updateFinalAmount(): void {
    this.finalAmount = this.items.reduce((sum, current) => sum + current.Item_Value, 0);
    this.finalAmount = parseFloat(this.finalAmount.toFixed(2));
    this.Amount = this.finalAmount;
  }

  onOptionSelected(event: any): void {
    this.selectedCustomerDetails = event.option.value;
    this.cust_id = this.selectedCustomerDetails.acc_code;
    console.log('Selected Customer Details:', this.selectedCustomerDetails);
  }

  formatDate(event: any) {
    const date = new Date(event.target.value);
    const formattedDate = this.formatToDDMMYYYY(date);
    this.Order_date = formattedDate;
    console.log('Selected Date: ', formattedDate);
  }

  private formatToDDMMYYYY(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  addItem(): void {
    if (this.selectedItemDetails) {
      const newItem: IRitem = {
        Sr_No: this.items.length + 1,
        Item_Id: this.selectedItemDetails.I_id,
        Item_name: this.selectedItemDetails.I_name,
        Item_Unit: this.selectedItemDetails.I_QtyUnit,
        Item_Qty: this.selectedItemQty,
        Item_Rate: this.selectedItemRate,
        Item_Value: this.calculateItemValue(this.selectedItemQty, this.selectedItemRate),
      };

      this.items.push(newItem);
      this.clearItemSelection();
      this.updateTableData();
      console.log(newItem);
    }
  }

  clearItemSelection(): void {
    this.selectedItemDetails = undefined;
    this.selectedItemQty = 0;
    this.selectedItemRate = 0;
  }


  submitData(): void {
  
    const result: Iresult = {
      order_no: this.order_no,
      Order_date: this.Order_date,
      cust_id: this.cust_id,
      Amount: this.Amount,
      Items: this.items
    };
  
    // Convert the result to JSON format
    // const resultJson = JSON.stringify(result, null, 2);
    // console.log(resultJson);

    this.resultService.postResult(result).subscribe((responce)=>{
      console.log("Data posted successfully...")
      window.location.reload();
    })
  }
  

  // Update the dataSource with the new items array
  private updateTableData(): void {
    this.dataSource.data = this.items;
    this.updateFinalAmount();

  }

  selectedItem(itemId: any){

    this.selectedItemId = itemId;
    const item = this.items.find(i => i.Item_Id === itemId);
  
  if (item) {
    this.editItemName = item.Item_name;
    this.editItemUnit = item.Item_Unit;
    this.editItemQty = item.Item_Qty;
    this.editItemRate = item.Item_Rate;
  }
  }
  updateItem() {
    const index = this.items.findIndex(i => i.Item_Id === this.selectedItemId);

    if (index !== -1) {
      this.items[index].Item_Unit = this.editItemUnit;
      this.items[index].Item_Qty = this.editItemQty
      this.items[index].Item_Rate = this.editItemRate;
      this.items[index].Item_Value = this.editItemQty * this.editItemRate;
      
      this.updateFinalAmount();
      this.updateTableData();
      console.log(this.items)
    }
  }

  deleteItem(){
    this.items = this.items.filter(item => item.Item_Id !== this.selectedItemId);
    this.updateTableData();
    console.log(this.items)

  }
  
}
