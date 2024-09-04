import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Iresult } from '../interfaces/iresult';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultServiceService {

  apiUrl = 'http://localhost:3000/results';

  constructor(private http: HttpClient) { }

  postResult(data: Iresult): Observable<Iresult> {
    return this.http.post<Iresult>(this.apiUrl, data);
  }

}
