export interface Icustomer {
    acc_code: number;
    acc_name: string;
    address: {
        office?: string;
        place: {
            city: string;
            district: {
                name: string;
                state: string;
            }
        }
    };
}
