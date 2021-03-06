import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpModule } from '@angular/http';
import 'hammerjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxIndexedDBModule , DBConfig } from 'ngx-indexed-db';
import { GalleryModule , GALLERY_CONFIG } from  '@ngx-gallery/core';
// import { MatButtonModule } from '@angular/material/button';
// import { MatSliderModule } from '@angular/material/slider';
// import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { NgxSmartModalModule , NgxSmartModalService } from 'ngx-smart-modal';



export function HttpLoaderFactory(http: HttpClient) {
   return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

/*
export function migrationFactory() {
   // The animal table was added with version 2 but none of the existing tables or data needed
   // to be modified so a migrator for that version is not included.
   return {
     1: (db, transaction) => {
       const store = transaction.objectStore('people');
       store.createIndex('country', 'country', { unique: false });
     },
     3: (db, transaction) => {
       const store = transaction.objectStore('people');
       store.createIndex('age', 'age', { unique: false });
     }
   };
 }
*/


const dbConfig: DBConfig  = {
   name: 'pocuipower',
   version: 1,
   objectStoresMeta: [
      {
         store: 'pocuvariables',
         storeConfig: { keyPath: 'id', autoIncrement: true },
         storeSchema: [
            { name: 'jdo', keypath: 'jdo', options: { unique: false } }, // doktorlar (bran??lar yoluyla ??r??n gruplar??na ba??l??)
            { name: 'jec', keypath: 'jec', options: { unique: false } }, // eczaneler (bran?? ve ??r??n grubuna ba??l?? de??il)
            { name: 'jgo', keypath: 'jgo', options: { unique: false } }, // strateji / g??rsel yollar
            { name: 'jbr', keypath: 'jbr', options: { unique: false } }, // bran??lar (ana birle??im k??mesi, ??r??n gruplar?? ba??l??)
            { name: 'jug', keypath: 'jug', options: { unique: false } }, // ??r??n gruplar?? (sadece bro????r??n ??r??n grubu ismini yazmak i??in)
            { name: 'jpl', keypath: 'jpl', options: { unique: false } }, // g??nl??k plan (sadece liste g??sterimi i??in, doktor ya da ezcaneye k??sayol verecek)
            { name: 'jct', keypath: 'jct', options: { unique: false } }, // ??ehirler (sadece doktor ve eczane ??ehirlerini yazmak i??in)
            { name: 'jhs', keypath: 'jhs', options: { unique: false } }, // hastaneler (sadece doktorlar??n hastanelerini yazmak i??in)
         ]
      }
      ,
      {
         store: 'pocuimagelist',
         storeConfig: { keyPath: 'id', autoIncrement: false },
         storeSchema: [
            { name: 'strateji', keypath: 'strateji', options: { unique: false } },
            { name: 'imageurl', keypath: 'imageurl', options: { unique: false } },
            { name: 'imagedata', keypath: 'imagedata', options: { unique: false } },
            { name: 'prodgroup', keypath: 'prodgroup', options: { unique: false } },
            { name: 'filetime', keypath: 'filetime', options: { unique: false } },
         ]
      }

      // DOKTORLAR > id, nm , s , h, b (ID, Doktor Ad?? , ??ehir, Hastane , Bran??)
      // ECZANELER > id , gln, nm , fc , s (ID , GLN , Eczane Ad??, Eczac?? ad?? , ??ehir)
      // ??lk data senkronize oldu??unda, Doktor datas??na hastane ve ??ehir isimlerini, eczane datas??na da ??ehir isimlerini birle??tirelim

   ]
   // ,migrationFactory
 };
/* 
@NgModule({
   exports: [
     // MatButtonModule,
     // MatToolbarModule,
   ]
}) */

// export class MaterialModule { }

@NgModule({
   declarations: [
      AppComponent,
      DashboardComponent
   ],
   imports: [
      FormsModule,
      GalleryModule,
      NgxSmartModalModule.forRoot(),
      ReactiveFormsModule,
      ToastrModule.forRoot(),
      RouterModule,
      BrowserModule,
      // MatSliderModule,
      // MaterialModule,
      RouterModule.forRoot([
         { path: '', component: DashboardComponent }
       ]),
      CommonModule,
      BrowserAnimationsModule,
      AppRoutingModule,
      NgxDatatableModule,
      HttpClientModule,
      HttpModule,
      NgxIndexedDBModule.forRoot(dbConfig),
      NgxLoadingModule.forRoot({}),
      TranslateModule.forRoot({
         loader: {
           provide: TranslateLoader,
           useFactory: HttpLoaderFactory,
           deps: [HttpClient]
         },
       })

   ],
   providers: [ NgxSmartModalService,
     {
         provide: GALLERY_CONFIG,
         useValue: {
            // previewCloseOnClick : true,
            gestures : true,
           // dots: true,
           imageSize: 'contain'
         }
       }
     ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }


