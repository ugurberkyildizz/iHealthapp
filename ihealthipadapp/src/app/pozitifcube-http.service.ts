import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError , of , Observer } from 'rxjs';
import { retry, catchError , map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

export var dynMenuItems = [{ path: '/', title: 'Anasayfa', icon: 'git-pull-request',active: true, type: 'link' }];
export var defaulthomeurl = '/';

@Injectable({
  providedIn: 'root'
})

export class PozitifcubeHttpService {

  public ismenuget = 0;
  public canActiveRoutes : any[];
  public userInfo : any;
  public cacheParams : {};
  public activeLanguages : any;
  public hostnm = location.hostname;

  constructor( private http: HttpClient , private router: Router , public toastr: ToastrService , private translate: TranslateService) { }

  /* base_path =  this.hostnm == '192.168.1.122' || this.hostnm == 'iris.esfashop.com:8088' ? ('//'+this.hostnm+'/phpapi/') : 'https://esfaapi.pozitifcube.com/'; */

  base_path =  'https://ipower.ihealth.com.tr/mobilesync.php';

  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'X-App-Path': this.router.url }) }

  loggedInPath = this.base_path;
  loggedInHttpOptions(){
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'X-App-Path': this.router.url,
                        'X-Auth-Token': localStorage.getItem('usertokeny'), 'X-Auth-User': localStorage.getItem('usertokenx'),
                        'X-App-Lang' : localStorage.getItem('userlang')}) }
  }

  // delay / setTimeout
  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=>resolve(), ms)).then(()=>{});
  }
  
  // List page items
  getViewList( query ): Observable<any> {
    query.rqif = 'show';
    return this.http.post(this.loggedInPath , query, this.loggedInHttpOptions() )
    .pipe(
      retry(2),
      catchError(this.handleError),
      map(res => { return this.dynAuthControl(res); })
    );
  }

  // Edit an item
  editItem(item , id){
    item.formid = id;
    return this.http
      .post(this.loggedInPath, JSON.stringify(item), this.loggedInHttpOptions())
      .pipe(
        retry(2),
        catchError(this.handleError),
        map(res => { return this.dynAuthControl(res); })
      )
  }

  // Create a new item
  createItem(item){
    return this.http
      .put(this.loggedInPath, JSON.stringify(item), this.loggedInHttpOptions())
      .pipe(
        retry(2),
        catchError(this.handleError),
        map(res => { return this.dynAuthControl(res); })
      )
  }

  // Get single data by ID or get setting eg.
  getItem(qdetail:any){
    return this.http
      .get(this.loggedInPath + '/' + qdetail , this.loggedInHttpOptions())
      .pipe(
        retry(2),
        catchError(this.handleError),
        map(res => { return this.dynAuthControl(res); })
      )
  }

  getJSONResult(func:string , filter = 0) : Observable<any>{
    var query = {'filter':filter,'call':func };
    return this.http.post(this.loggedInPath + '/getjsonresult', query, this.loggedInHttpOptions() )
    .pipe(
      retry(2),
      catchError(this.handleError),
      map(res => { return this.dynAuthControl(res); })
    )
  }

  loginPost(user){
    return this.http
      .post(this.base_path, JSON.stringify(user) , this.httpOptions )
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  logoutPost(query){
    return this.http.post(this.base_path , query , this.loggedInHttpOptions() )
    .pipe(
      retry(2),
      catchError(this.handleError),
      map(res => { return this.dynAuthControl(res); })
    );
  }

  createMenu(){
    return Observable.create((observer: Observer<number>)  => {
      this.getItem('getsettings').subscribe((response) => {
        if(response['mn']){
          this.userInfo = response['us'];
          this.canActiveRoutes = response['ar'];
          this.activeLanguages = response['al'];
          dynMenuItems = response['mn'];
          defaulthomeurl = response['dh'];
          this.ismenuget = 2; observer.next(2); observer.complete();
        }else{ this.ismenuget = 3; observer.next(3); observer.complete(); }
      });
      this.delay(4000).then(any => { this.ismenuget = 5; observer.next(5); observer.complete(); });
    });
  }

  public dynAuthControl( res ){
    if(typeof res['result'] !== 'undefined'){
      if(res['result'] == 'logout'){ localStorage.removeItem('usertokenx'); localStorage.removeItem('usertokeny'); return false;}
      else if(res['result'] == 'noauth'){ return false; }
      /* if(res['result'] == 'logout'){ localStorage.removeItem('usertokenx'); localStorage.removeItem('usertokeny'); this.router.navigate(['/auth/login']); return false;}
      else if(res['result'] == 'noauth'){ this.router.navigate([ defaulthomeurl ]); return false; } */
      else{ return res; }
    }else{ return res; }
  }

  handleError(error: HttpErrorResponse) {
    if(this.ismenuget == 1) this.ismenuget = 3;
    if (error.error instanceof ErrorEvent) { console.error('An error occurred:', error.error.message); } // A client-side or network error occurred. Handle it accordingly.
    else { console.error( `Backend returned code ${error.status}, ` + `body was: ${error.error}`); } // The backend returned an unsuccessful response code. The response body may contain clues as to what went wrong,
    return throwError('Something bad happened; please try again later.'); // return an observable with a user-facing error message
  };


  playSound(filename){
    let audio = new Audio();
    audio.src = window.location.origin + "/assets/sound/"+filename;
    audio.load();
    audio.play();
  }
  
}