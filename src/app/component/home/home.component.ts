import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
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

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  displayedColumns: string[] = ['I_id', 'I_name', 'I_QtyUnit', 'Item_Qty', 'Item_Rate', 'Item_Value', 'Action'];
  dataSource = new MatTableDataSource<IRitem>();

  editIndex: number = -1;  // To toggle between Add and Edit mode

  entityIResult: Iresult = <Iresult>{};
  reference: IRitem = <IRitem>{};

  entityICustomer: Icustomer = <Icustomer>{}


  jsonItems = <IItem[]>ItemJson
  customers = <Icustomer[]>customerJson;

  customerControl = new FormControl<string | Icustomer>('');
  itemControl = new FormControl<IItem | string>('');
  filteredOptions!: Observable<Icustomer[]>;

  itemsjson = <IItem[]>ItemJson; // Initialize with item JSON data

  selectedCustomerDetails: any = null;

  constructor(private resultService: ResultServiceService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.itemsjson = <IItem[]>[];
    this.entityIResult.Items = <IRitem[]>[];
    this.reference.Item = <IItem>{};
    this.filteredOptions = this.customerControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : value?.acc_name;
        return filterValue ? this._filter(filterValue) : this.customers.slice();
      })
    );
    this.updateTableData();
    this.itemsjson = ItemJson; // Load items here
  }

  openAddEditModal(idx?: number, item?: IRitem) {
    this.editIndex = idx !== undefined ? idx: -1;
    if (this.editIndex >= 0 && item) {
      this.reference = Object.assign({}, item);
    }
    else
    { 
      this.reference = <IRitem>{};
      this.reference.Item = <IItem>{};
    }

    //  this.entityItem = this.itemsjson.filter(f => f.I_id ==  this.reference.I_id)[0];
     // Trigger change detection to update the view
     this.cd.detectChanges();

  }

  saveItem(): void {

    if (this.editIndex >= 0) {
      // Edit mode: update the existing item
      let items = this.entityIResult.Items;

      const index = items!.findIndex(i => i.Item_Id === this.reference.Item_Id);
      if (index !== -1) {
        items![index] = {
          ...this.reference,
          Item_Value: this.calculateItemValue(this.reference),
        };
      }
    } else {
      // Add mode: add a new item
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
    //this.itemControl.setValue(item);
  }

  validateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.entityIResult.order_no = input.value
  }

  updateItemValue(Obj: IRitem): void {
    Obj.Item_Value = parseFloat((Obj.Item_Qty * Obj.Item_Rate).toFixed(2));
    this.updateFinalAmount();
  }

  private calculateItemValue(Obj: IRitem): number {
    return parseFloat((Obj.Item_Qty * Obj.Item_Rate).toFixed(2));
  }

  private updateFinalAmount(): void {
    this.entityIResult.Amount = this.entityIResult.Items!.reduce((sum, current) => sum + current.Item_Value, 0);
    this.entityIResult.Amount = parseFloat(this.entityIResult.Amount.toFixed(2));
  }

  onOptionSelected(event: any): void {
    this.selectedCustomerDetails = event.option.value;
    this.entityIResult.cust_id = this.selectedCustomerDetails.acc_code;
  }


  formatDate(event: any): void {
    const inputDate = event.target.value; // This will be in yyyy-MM-dd format
    this.entityIResult.Order_date = this.formatToDDMMYYYY(new Date(inputDate));
  }

  formatToYYYYMMDD(dateString: string): string {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/').map(Number);
    const formattedDate = new Date(year, month, day);
    return formattedDate.toISOString().split('T')[0];
  }

  private formatToDDMMYYYY(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  clearItemSelection(): void {
    this.reference = <IRitem>{};
    this.editIndex = -1;
  }

  
  submitData(): void {


    // const itemsWithoutItemName = this.items.map(({ Item_name, Sr_No, ...item }) => item);
    // this.entityIResult.Items=itemsWithoutItemName;

    // const result: Iresult = {
    //   order_no: this.entityIResult.order_no,
    //   Order_date: this.entityIResult.Order_date,
    //   cust_id: this.entityIResult.cust_id,
    //   Amount: this.entityIResult.Amount,
    //   Items: itemsWithoutItemName
    // };
    this.entityIResult.Items=undefined;
    this.resultService.postResult(this.entityIResult).subscribe((responce) => {
      console.log("Data posted successfully...")
      window.location.reload();
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
