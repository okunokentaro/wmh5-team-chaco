import {Component, Inject} from '@angular/core';
import * as lodash from "lodash";

import {FrameService} from './frame.service';
import {MidiAdaputer} from './midiAdaputer';

const DEFAULT_BPM = 120;

@Component({
  selector  : 'wm-app',
  directives: [],
  providers : [FrameService, MidiAdaputer],
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
      .on {
        background: #ff0;
      }
    </style>
    <h1>{{f}}</h1>
    <ul class="grids">
      <li
        *ngFor="let grid of grids; let idx = index"
        class="grid"
        [class.on]="grid.note"
        (click)="onClickGrid($event, idx)"
      ></li>
    </ul>
    <input type="range" [ngModel]="bpm" (ngModelChange)="onBpmChange($event)" name="bpm" min="40" max="200">
    <button (click)="contract()">-</button>
    <button (click)="expand()">+</button>
    {{bpm}}
  `
})
export class AppComponent {
  constructor(@Inject(FrameService) frame,
              @Inject(MidiAdaputer) midiAdapter) {
    this.frame = frame;
    this.midiAdapter = midiAdapter;

    this.range = 16;
    this.grids = lodash.range(this.range).map((i) => {
      return {
        note: false
      }
    });
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
      const current = this.f % this.grids.length;
      if (this.grids[current].note) {
        this.midiAdapter.emit(current);
      }
    });
  }

  onClickGrid(ev, idx) {
    console.log(`onClickGrid`, idx);
    this.grids[idx].note = !this.grids[idx].note;
  }
}