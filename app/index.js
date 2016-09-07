import 'core-js';
import 'rxjs/Rx';
import 'zone.js/dist/zone';

import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppComponent} from './app.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
