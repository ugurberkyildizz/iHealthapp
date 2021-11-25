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
            { name: 'jdo', keypath: 'jdo', options: { unique: false } }, // doktorlar (branşlar yoluyla ürün gruplarına bağlı)
            { name: 'jec', keypath: 'jec', options: { unique: false } }, // eczaneler (branş ve ürün grubuna bağlı değil)
            { name: 'jgo', keypath: 'jgo', options: { unique: false } }, // strateji / görsel yollar
            { name: 'jbr', keypath: 'jbr', options: { unique: false } }, // branşlar (ana birleşim kümesi, ürün grupları bağlı)
            { name: 'jug', keypath: 'jug', options: { unique: false } }, // ürün grupları (sadece broşürün ürün grubu ismini yazmak için)
            { name: 'jpl', keypath: 'jpl', options: { unique: false } }, // günlük plan (sadece liste gösterimi için, doktor ya da ezcaneye kısayol verecek)
            { name: 'jct', keypath: 'jct', options: { unique: false } }, // şehirler (sadece doktor ve eczane şehirlerini yazmak için)
            { name: 'jhs', keypath: 'jhs', options: { unique: false } }, // hastaneler (sadece doktorların hastanelerini yazmak için)
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

      // DOKTORLAR > id, nm , s , h, b (ID, Doktor Adı , Şehir, Hastane , Branş)
      // ECZANELER > id , gln, nm , fc , s (ID , GLN , Eczane Adı, Eczacı adı , Şehir)
      // İlk data senkronize olduğunda, Doktor datasına hastane ve şehir isimlerini, eczane datasına da şehir isimlerini birleştirelim

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


