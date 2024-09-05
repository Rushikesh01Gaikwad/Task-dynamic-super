import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {Observable, of} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { Icustomer } from '../../interfaces/icustomer';
import { IRitem, Iresult } from '../../interfaces/iresult';
import { MatTableDataSource } from '@angular/material/table';
import { ResultServiceService } from '../../services/result-service.service';
import ItemJson from '../../jsonData/item.json';
import { IItem } from '../../interfaces/i-item';
import customerData from '../../jsonData/customer.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  displayedColumns: string[] = ['I_id', 'I_name', 'I_QtyUnit', 'Item_Qty','Item_Rate','Item_Value','Action'];
  dataSource = new MatTableDataSource<IRitem>();

  selectedItemId!:number;
  isEditMode: boolean = false;  // To toggle between Add and Edit mode

  entityIResult: Iresult = <Iresult>{};
  entityIRItem: IRitem = <IRitem>{};
  entityItem: IItem = <IItem>{};
  entityICustomer: Icustomer = <Icustomer>{}

  reference:any;
  jsonItems = <IItem[]>ItemJson
  selectedItemUnit: string | undefined;

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

  openAddEditModal(isEdit: boolean, item?: IRitem) {
    this.isEditMode = isEdit;

    if (isEdit && item) {
      // Populate the fields with existing item details for editing
      this.selectedItemId = item.Item_Id;

      this.selectedItemQty = item.Item_Qty;
      this.selectedItemRate = item.Item_Rate;
    } else {
      // Reset fields for adding new item

      this.selectedItemDetails = undefined;
      this.selectedItemQty = 0;
      this.selectedItemRate = 0;
    }
  }

  saveItem(): void {
    if (this.isEditMode && this.selectedItemId !== null) {
      // Edit mode: update the existing item
      const index = this.items.findIndex(i => i.Item_Id === this.selectedItemId);
      if (index !== -1) {
        this.items[index].Item_Qty = this.selectedItemQty;
        this.items[index].Item_Rate = this.selectedItemRate;
        this.items[index].Item_Value = this.calculateItemValue(this.selectedItemQty, this.selectedItemRate);
      }
    } else {
      // Add mode: add new item
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
      }
    }

    // Reset form and update table data
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

    this.selectedItemDetails = item;
    this.itemControl.setValue(item);
    console.log('Selected Item:', item);
  }

  setItemName():void
  {

  }

  validateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.entityIResult.order_no = input.value
  }

  updateItemValue(element: IRitem): void {
    element.Item_Value = this.calculateItemValue(element.Item_Qty, element.Item_Rate);
    this.updateFinalAmount();
  }

  private calculateItemValue(quantity: number, rate: number): number {
    return parseFloat((quantity * rate).toFixed(2));
  }

  private updateFinalAmount(): void {
    this.entityIResult.Amount = this.items.reduce((sum, current) => sum + current.Item_Value, 0);
    this.entityIResult.Amount = parseFloat(this.entityIResult.Amount.toFixed(2));
  }

  onOptionSelected(event: any): void {
    this.selectedCustomerDetails = event.option.value;
    this.entityIResult.cust_id = this.selectedCustomerDetails.acc_code;
    console.log('Selected Customer Details:', this.selectedCustomerDetails);
  }
  

  formatDate(event: any): void {
    const inputDate = event.target.value; // This will be in yyyy-MM-dd format
    this.entityIResult.Order_date = this.formatToDDMMYYYY(new Date(inputDate));
    console.log('Selected Date: ', this.entityIResult.Order_date);
  }

  formatToYYYYMMDD(dateString: string): string {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/').map(Number);
    const formattedDate = new Date(year, month, day);
    return formattedDate.toISOString().split('T')[0]; // yyyy-MM-dd
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
    this.selectedItemId!;
  }


  submitData(): void {

    const itemsWithoutItemName = this.items.map(({ Item_name,Sr_No, ...item }) => item);
  
    const result: Iresult = {
      order_no: this.entityIResult.order_no,
      Order_date: this.entityIResult.Order_date,
      cust_id: this.entityIResult.cust_id,
      Amount: this.entityIResult.Amount,
      Items: itemsWithoutItemName
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
    this.entityIRItem.Item_name = item.Item_name || '';
    this.entityIRItem.Item_Unit = item.Item_Unit;
    this.entityIRItem.Item_Qty = item.Item_Qty;
    this.entityIRItem.Item_Rate = item.Item_Rate;
  }
  }
  updateItem() {
    const index = this.items.findIndex(i => i.Item_Id === this.selectedItemId);

    if (index !== -1) {
      this.items[index].Item_Unit = this.entityIRItem.Item_Unit;
      this.items[index].Item_Qty = this.entityIRItem.Item_Qty
      this.items[index].Item_Rate = this.entityIRItem.Item_Rate;
      this.items[index].Item_Value = this.entityIRItem.Item_Qty * this.entityIRItem.Item_Rate;
      
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
