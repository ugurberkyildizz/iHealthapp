import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PozitifcubeHttpService } from '../pozitifcube-http.service';
import { FormBuilder, Validators, FormGroup, FormControl, NgForm } from '@angular/forms';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable , Subscription } from 'rxjs';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { GalleryItem, ImageItem } from '@ngx-gallery/core';
import { SelectorMatcher } from '@angular/compiler';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {

  @ViewChild('DatatableComponent', {static: true}) table: DatatableComponent;
  

  listsubscribes:any = [];

  public tempAllSessionData:any = [];
  public sessionData: any = [];

  public galleryItems: GalleryItem[];
  public imageData:any = [];
  public isugselected:any = 0;

  public formid: any;
  public userForm: FormGroup;
  public isuserlogin:boolean = false;
  public loadingeffect = false;
  public newimageurllist:any = [];
  public downloadprocessimgindex:any = 0;
  public imageurl:any = '';
  public imgToDataURL:any;
  public searchViewPage: any;
  public tempdata: any = [];
  public tabledata: any = [];
  public columns: any = [];
  public searchtype : any = 0;
  public buttonViewPage: any = 1;
  public selectedDetail: any = [];
  public username: any = '';
  // public groupcolors:any = [];
  // public productGroup: any;

  public productGroups = [
    {ug:1 , img:'assets/files/activestix-stress.png'},
    {ug:5 , img:'assets/files/kids-biotic.jpg'},
    {ug:9 , img:'assets/files/osteo-active.png'},
    {ug:4 , img:'assets/files/pro-probiotic.png'},
    {ug:3 , img:'assets/files/red-krill-oil.png'},
    {ug:2 , img:'assets/files/sambucol-efervesan.png'}
  ];
  
  constructor( public pocu: PozitifcubeHttpService, private fb: FormBuilder , private db: NgxIndexedDBService , public modal: NgxSmartModalService ) { 

    localStorage.setItem("userlang",'tr');
    var formHandlers= {
      useremail: new FormControl('', Validators.required),
      userpassword: new FormControl('', Validators.required),
    }
    this.userForm=this.fb.group(formHandlers);

    this.imgToDataURL = url => fetch(url).then(response => response.blob()).then(blob => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result); reader.onerror = reject;  reader.readAsDataURL(blob) }));

  }

  imageHistoryInSession( imgid ){

    var pageDatatime = {'type':this.searchtype , 'sesid':this.selectedDetail['id'] || 0 , 'ugid' : this.isugselected , 'imgid' : imgid , 'time' : Math.floor(Date.now() / 1000) };
    this.sessionData.push(pageDatatime);

  }

  galleryImageChange(event){

    var currentImgId = this.imageData[ this.isugselected ][ event.currIndex ]['id'];
    this.imageHistoryInSession( currentImgId );
    
  }

  ugGalleryStart( ugid ){

   this.galleryItems = [];
    this.isugselected = 0;

    if(this.imageData[ugid]){
      this.galleryItems = this.imageData[ugid].map(item => new ImageItem({ src: item.img , thumb:item.img }));
      this.isugselected = ugid;
      var currentImgId = this.imageData[ this.isugselected ][ 0 ]['id'];
      this.imageHistoryInSession( currentImgId );
    }else this.pocu.toastr.error( 'Bu ürün grubu için görseller yüklenmemiş' );

  }

  galleryImageClick(){
    this.isugselected = 1;

    //this.galleryItems = [];
  }
  galleryCloseClick(){
    this.isugselected = 0;

    //this.galleryItems = [];
  }

  removeOldImages(){
    var imagelistids = [];
    this.newimageurllist.forEach(img => { imagelistids.push(img['id']); });
    this.db.getAll('pocuimagelist').then(
      imglist => {
        imglist.forEach(img => {
          if( !imagelistids.includes( img['id'] ) ){ // gelen yeni listede, bu resim yok
            this.db.delete('pocuimagelist', img['id'] ).then(() => {}, error => { console.log(error); } );
          }
        });
      },
      error => {}
  );
  }

  downloadImageFiles(){

    if(this.newimageurllist[ this.downloadprocessimgindex ]){
      
      var imginfo  = this.newimageurllist[ this.downloadprocessimgindex ];
      var fulldownloadurl = this.pocu.base_path +'?downloadimg='+ imginfo['im'];

      this.db.getByKey('pocuimagelist',imginfo['id']).then(
          res => {
            if(res === undefined){
              this.imgToDataURL(fulldownloadurl).then(dataUrl => { 
                
                this.db.add('pocuimagelist', {id:imginfo['id'], strateji:imginfo['nm'] , imageurl:imginfo['im'] , prodgroup:imginfo['ug'],imagedata:dataUrl , filetime:imginfo['tm']} )
                    .then( () => {
                      this.downloadprocessimgindex++;
                      this.downloadImageFiles(); // sonrakini indirir
                    },error => {
                      this.downloadImageFiles(); // bir daha indirmeyi dener
                    } );
              });
            }else{

              if(res['filetime'] == imginfo['tm']){ // vardır ve dosya aynıdır, indirmeye gerek yok, sonrakine geç
                this.downloadprocessimgindex++;
                this.downloadImageFiles();
              }else{
                this.imgToDataURL(fulldownloadurl).then(dataUrl => { 
                  
                  this.db.update('pocuimagelist', {id:imginfo['id'], strateji:imginfo['nm'] , imageurl:imginfo['im'] , prodgroup:imginfo['ug'],imagedata:dataUrl , filetime:imginfo['tm']} )
                      .then( () => {
                        this.downloadprocessimgindex++;
                        this.downloadImageFiles(); // sonrakini indirir
                      },error => {
                        this.downloadImageFiles(); // bir daha indirmeyi dener
                      } );
                });
              }
            }
          
          },
          error => { // daha önce kaydedilmemiş ise indir
            
            this.loadingeffect = false; this.pocu.toastr.error( 'Ciddi bir hata oluşmuş olabilir (e997)' );
            
          }
      );

    }else{

      if(this.downloadprocessimgindex > 0){
        this.db.getAll('pocuimagelist').then(
          imgs => { // id, strateji, imageurl , prodgroup, imagedata
            if(imgs.length == 0){ this.pocu.toastr.error( 'Görseller yüklenmemiş' ); }
            else{
              imgs.forEach(img => {
                if(!this.imageData[ img['prodgroup'] ]) this.imageData[ img['prodgroup'] ] = [];
                this.imageData[ img['prodgroup'] ].push({img:img['imagedata'] , id:img['id']});
              });
            }
          },
          error => {
            this.pocu.toastr.error( 'Ciddi bir hata oluşmuş olabilir (e995)' );
              console.log(error);
          }
        );
      }
      this.downloadprocessimgindex = 0;
      this.loadingeffect = false;
      console.log('SYNC COMPLETE');
    }

  }
  syncAllObjectsQuestion(){
    this.modal.getModal('syncAllObjectModal').open();

  }
  syncAllObjects(){
    
    if( this.isuserlogin == true ){

      this.loadingeffect = true;
      
      this.pocu.getViewList({'getuservalues':true}).subscribe((response) => {
       
        if(response['result'] == 'OK'){
          
          var newvals = { jct: response['jct'], jdo: response['jdo'], jec: response['jec'], jgo: response['jgo'],  jbr: response['jbr'], jug: response['jug'],  jpl: response['jpl'] , jhs : response['jhs'] };
          var citiesbyid:any = [] , bransugbyid:any = [] , bransbyid:any = [] , hospitalbyid:any = [];
          newvals.jct.forEach( v => { citiesbyid[v['id']] = v['nm']; });
          newvals.jbr.forEach( v => { bransbyid[v['id']] = v['nm']; bransugbyid[v['id']] = v['ug']; });
          newvals.jhs.forEach( v => { hospitalbyid[v['id']] = v['nm']; });

          if(newvals.jdo.length > 0){
            newvals.jdo.forEach((v,i) => {
              if( v['s'] > 0 ) newvals.jdo[i]['sn'] = citiesbyid[ v['s'] ];
              if( v['b'] > 0 ){ newvals.jdo[i]['bn'] = bransbyid[ v['b'] ]; newvals.jdo[i]['ug'] = bransugbyid[ v['b'] ];  }
              if( v['h'] > 0 ) newvals.jdo[i]['hn'] = hospitalbyid[ v['h'] ];
            });
          }
          if(newvals.jec.length > 0){
            newvals.jec.forEach((v,i) => {
              if( v['s'] > 0 ) newvals.jec[i]['sn'] = citiesbyid[ v['s'] ];
            });
          }

          this.db.getByKey('pocuvariables', 1).then(
              res => {
                
                // response['jug'].forEach( ug => { this.groupcolors[ ug['id'] ] = '#'+ug['cl']; });

                this.newimageurllist = response['jgo'];

                this.removeOldImages();

                if(res === undefined){
                  this.db.add('pocuvariables', newvals ).then( () => { this.downloadImageFiles(); }, error => {  this.loadingeffect = false; this.pocu.toastr.error( 'Güncelleme hatası (e002)'  );  } );
                }else{
                  newvals['id'] = 1;
                  this.db.update('pocuvariables', newvals ).then( () => { this.downloadImageFiles(); }, error => {  this.loadingeffect = false; this.pocu.toastr.error( 'Güncelleme hatası (e001)' ); } );
                }
              },
              error => {
                this.loadingeffect = false; this.pocu.toastr.error( 'Ciddi bir hata oluşmuş olabilir (e998)' );
              }
          );

        }else{
          this.loadingeffect = false;
          this.pocu.toastr.error("Veriler getirilemedi. İnternet bağlantınızı ve kullanıcı giriş durumunuzu kontrol ediniz (e003)" );
        }
      });

    }else{
      this.pocu.toastr.error("Önce kullanıcı girişi yapınız (e004)" );
    }

    this.modal.getModal('syncAllObjectModal').close();
  }





  LoginProcess(userinfo){
    
    if (this.userForm.invalid) { this.pocu.toastr.error( 'Lütfen Bilgilerinizi Giriniz (e005)' ); return; }
    else{

      userinfo.mobilelogin = true;
      this.pocu.loginPost(userinfo).subscribe((response) => {
        if(response['result'] == 'login'){
          var nullvars = { 'useremail':'','userpassword':'' }
          this.userForm.setValue(nullvars);
          localStorage.setItem("usertokenx",response['tokenx']);
          localStorage.setItem("usertokeny",response['tokeny']);
          localStorage.setItem("username",response['namesurname']);
          this.username = response['namesurname'];
          this.pocu.toastr.success( 'Giriş Yapıldı' );
          this.isuserlogin = true;
        }else{
          this.pocu.toastr.error("Bir Sorun Oluştu" );
        }
      });
    }
  }

  startProgramGroupModules(  arraythis ){

    // arraythis['jug'].forEach( ug => { this.groupcolors[ ug['id'] ] = '#'+ug['cl']; });

  }
  toCloudDataQuestion(){
    this.modal.getModal('toCloudDataModal').open();
  }

  toCloudData(){
    // SUNUCUYA GÖNDERECEK !!!!
    this.pocu.toastr.success( 'Verileriniz başarıyla gönderildi' );
    localStorage.removeItem("tempAllSessionData");
    this.tempAllSessionData = [];
    this.modal.getModal('toCloudDataModal').close();
  }
  LogoutProcessQuestion(){
    this.modal.getModal('LogoutProcessModal').open();
  }
  LogoutProcess(){
    localStorage.removeItem("usertokenx");
    localStorage.removeItem("usertokeny");
    this.username = '';
    // içerideki verileri sildirir miyiz ? düşünelim
    this.isuserlogin = false; 
    this.modal.getModal('LogoutProcessModal').close();
  }

  LoginControl(){
    
    if(localStorage.getItem("usertokenx") || localStorage.getItem("usertokeny")){
      // SUNUCUDA HALEN KULLANICI AKTİF Mİ BAKACAK ??? YA DA ZATEN SYNC YAPMAYA KALKARSA DA ATABİLİRİZ
      this.isuserlogin = true;
      this.username = localStorage.getItem('username');

      if(localStorage.getItem("tempAllSessionData")){
        this.tempAllSessionData = JSON.parse( localStorage.getItem("tempAllSessionData") );
      }
      // localStorage.setItem("tempAllSessionData", JSON.stringify(this.tempAllSessionData));

      // forEach yaparak, 1,2,3,4 hangisi cevap verirse o idli satırı getirebiliriz
      this.db.getByKey('pocuvariables', 1).then(
          pocu => { this.startProgramGroupModules( pocu ); },
          error => { this.pocu.toastr.error( 'Senkronizasyon gerçekleştiriniz (e007)' ); }
      );

      this.db.getAll('pocuimagelist').then(
        imgs => { // id, strateji, imageurl , prodgroup, imagedata
          if(imgs.length == 0){ this.pocu.toastr.error( 'Görseller yüklenmemiş' ); }
          else{
            imgs.forEach(img => {
              if(!this.imageData[ img['prodgroup'] ]) this.imageData[ img['prodgroup'] ] = [];
              this.imageData[ img['prodgroup'] ].push({img:img['imagedata'] , id:img['id']});
            });
          }
        },
        error => {
          this.pocu.toastr.error( 'Ciddi bir hata oluşmuş olabilir (e995)' );
            console.log(error);
        }
      );

    }else{
      this.isuserlogin = false;
    }
  }
  cancelProgramQuestion(){
    // Emin misiniz? Bunu sadece yanlış seçmişseniz kullanın.... gibi bi uyarıdan sonra
    this.modal.getModal('cancelProgramModal').open();

  }
  cancelProgram(){
    // Emin misiniz? Bunu sadece yanlış seçmişseniz kullanın.... gibi bi uyarıdan sonra
    this.searchtype = 0;
    this.selectedDetail = [];
    this.modal.getModal('cancelProgramModal').close();

  }
  stopProgram(){
    
    this.searchtype = 0;
    this.selectedDetail = [];
    this.tempAllSessionData.push( this.sessionData );
    this.sessionData = [];

    localStorage.setItem("tempAllSessionData", JSON.stringify(this.tempAllSessionData));
    this.modal.getModal('stopProgramModal').close();
  }

  stopProgramQuestion(){

    this.modal.getModal('stopProgramModal').open();
   /*  localStorage.setItem("tempAllSessionData", JSON.stringify(this.tempAllSessionData));
    localStorage.getItem("tempAllSessionData");
    console.log(this.tempAllSessionData); */

  }
  
  startProgram(){

    this.searchViewPage = true;
    this.searchtype = 0;
    this.tabledata = [];

  }
  
  updateFilter(event) {

    var val = event.target.value;
    val = val > 0 ? val*1 : val.toLowerCase();

    if(val.length>1 || val > 1){
      
      if(this.searchtype == 1){ // doktor

        const temp = this.tempdata.filter(function(d) {
          /* return d.nm.toLowerCase().indexOf(val) !== -1 || d.hn.toLowerCase().indexOf(val) !== -1 || !val; */
          return d.nm.toLowerCase().indexOf(val) !== -1 || d.sn.toLowerCase().indexOf(val) !== -1 || !val;
          
        });
        this.tabledata = temp;

      }else if(this.searchtype == 2){ // eczane
        const temp = this.tempdata.filter(function(d) {
          /* return d.fc.toLowerCase().indexOf(val) !== -1 || d.gln == val || d.nm.toLowerCase().indexOf(val) !== -1 || !val; */
          return d.gln == val || d.nm.toLowerCase().indexOf(val) !== -1 || !val;
        
        });
  
        this.tabledata = temp;
      }
    }else this.tabledata = [];
    /* console.log(val); */
  }

  onActivateTable( event ){

    if(event.type == 'click') {

      this.searchViewPage = false;
      this.selectedDetail = event.row;
      this.tabledata = [];

    }
  }

  updateFilterSource( type ) {

    this.searchtype = type; 
    
    if( type > 0){
      if(type == 1){
        
        this.columns = [
          {prop: 'nm', name: 'Doktor Adı'},
          {prop: 'bn', name: 'Branş'},
          {prop: 'sn', name: 'Şehir'},
          {prop: 'hn', name: 'Hastane'} 
        ]; 
      }else if(type == 2){
        this.columns = [
          {prop: 'gln', name: 'GLN'},
          {prop: 'nm', name: 'Eczane'},
          {prop: 'fc', name: 'Kişi'},
          {prop: 'sn', name: 'Şehir'}
        ];
      }

      this.db.getByKey('pocuvariables', 1).then(
        res => {
          if(res !== undefined){
            if(type == 1){
              this.tempdata = res['jdo'];
            }else if(type == 2){
              this.tempdata = res['jec'];
            }
          }
        },
        error => { this.pocu.toastr.error( 'Ciddi bir hata oluşmuş olabilir (e998)' ); }
    );
    }

  }
  closeSearch(){
    this.searchViewPage= 0;
  }
  selectRow(){

    this.searchViewPage= 0;
    this.buttonViewPage= 0;
  };


  ngOnInit() {
    
    this.LoginControl();
    
  }

  
}