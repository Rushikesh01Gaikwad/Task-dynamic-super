export interface Iresult {

    order_no: string;
    Order_date: string;
    cust_id: number;
    Amount: number;
    Items: IRitem[];
}

export interface IRitem {
    Sr_No: number | undefined;
    Item_name: string;
    Item_Id: number;
    Item_Unit: string;
    Item_Qty: number;
    Item_Rate: number;
    Item_Value: number;
}
