import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { Observable, Subscription, timer } from 'rxjs';
import { of, fromEvent  } from 'rxjs';
import {take} from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';

const source = timer(1000, 2000);
const myObservable$:Observable<string> = of('apple', 'orange', 'grappe');
const myObserver = {
  next: (x: string) => console.log('Observer got a next value: ' + x),
  error: (err: string) => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};
const sequence = new Observable(sequenceSubscriber);
function sequenceSubscriber(observer) {
  observer.next('Apple');
  observer.next('Orange');
  observer.next('Grappe');
  observer.complete();

  return {unsubscribe() {}};
}

const httpOptions = {
  headers: new HttpHeaders(
    {
    'Content-Type': 'application/json', 
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true'
    })
};
const apiUrl = '/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit  {
  title = 'angular-observable-rxjs';
  subscription: Subscription;
  data: any[] = [];
  constructor(private http: HttpClient) {
    this.subscription=myObservable$.pipe(take(3)).subscribe(myObserver);
    sequence.subscribe({
      next(msg) { console.log(msg); },
      complete() { console.log('Finished sequence'); }
    });
    this.getProduct(1)
    .subscribe((res: any) => {
      this.data = res;
      console.log(this.data);
    }, err => {
      console.log(err);
    });
  }
  ngOnInit() {
    const subscribe = source.subscribe(val => console.log(val));
    setTimeout(() => { subscribe.unsubscribe();  }, 10000);
  }

  ngAfterViewInit() {
    //Now, every ESC key push in the HTML input element, it will clear the input value.
    const ESC_KEY = 27;
    const nameInput = document.getElementById('yourname') as HTMLInputElement;
    this.fromEvent(nameInput, 'keydown')
    .subscribe((e: KeyboardEvent) => {
      if (e.keyCode === ESC_KEY) {
        nameInput.value = '';
        console.log('Input cleared!');
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  fromEvent(target: HTMLInputElement, eventName: string) {
    return new Observable((observer) => {
      const handler = (e: unknown) => observer.next(e);
  
      target.addEventListener(eventName, handler);
  
      return () => {
        target.removeEventListener(eventName, handler);
      };
    });
  }
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(apiUrl, httpOptions)
      .pipe(
        tap(product => console.log('fetched products')),
        catchError(this.handleError('getProducts', []))
      );
  }
  
  getProduct(id: number): Observable<any> {
    const url = `${apiUrl}/${id}`;
    return this.http.get<any>(url).pipe(
      tap(_ => console.log(`fetched product id=${id}`)),
      catchError(this.handleError<any>(`getProduct id=${id}`))
    );
  }
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
