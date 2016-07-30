import {Component, Inject} from '@angular/core';
import * as lodash from "lodash";

import {FrameService} from './frame.service';

const DEFAULT_BPM = 120;

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
        color: #ffff00;
      }
      .grids {
        display: flex;
      }
      .grid {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        background: #550;
      }
    </style>
    <h1>{{f}}</h1>
    <ul class="grids">
      <li class="grid" *ngFor="let i of grids"></li>
    </ul>
    <input type="range" [ngModel]="bpm" (ngModelChange)="onBpmChange($event)" name="bpm" min="40" max="200">
    <button (click)="contract()">-</button>
  <button (click)="expand()">+</button>
    {{bpm}}
  `
})
export class AppComponent {
  constructor(@Inject(FrameService) frame) {
    this.frame = frame;
    this.range = 16;
    this.grids = lodash.range(this.range);
  }

  ngOnInit() {
    this.run(DEFAULT_BPM);
  }

  expand() {
    this.range = this.range + 4;
    this.updateGrid();
  }

  contract() {
    this.range = this.range - 4;
    this.updateGrid();
  }

  updateGrid() {
    this.grids = lodash.range(this.range);
  }

  onBpmChange(bpm) {
    this.run(bpm);
  }

  run(bpm) {
    if (this.disposable && typeof this.disposable.unsubscribe === 'function') {
      this.disposable.unsubscribe();
    }

    this.bpm = bpm;
    this.frame.run(this.bpm);
    this.disposable = this.frame.observable.subscribe((f) => {
      this.f = f;
    });
  }
}