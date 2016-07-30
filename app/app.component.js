import {Component, Inject} from '@angular/core';

import {FrameService} from './frame.service';

@Component({
  selector  : 'wm-app',
  directives: [],
  providers : [FrameService],
  template  : `
    <style>
      :host {
        display: block;
        width: 100vw;
        height: 100vh;
        background-color: #222;
      }
    </style>
    <h1>{{f}}</h1>
    <ul>
      <li *ngFor="let i of grids">{{i}}</li>
    </ul>
  `
})
export class AppComponent {
  constructor(@Inject(FrameService) frame) {
    frame.run();
    frame.observable.subscribe((f) => {
      this.f = f;
    });

    this.grids = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
  }
}