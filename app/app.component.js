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

    this.initGrid();

    this.bpmChangeSubject = new Rx.Subject();
    this.bpmChangeSubject.throttleTime(1000).subscribe((bpm) => {
      this.run(bpm);
    });
  }

  ngOnInit() {
    this.run(DEFAULT_BPM);

    window.firebaseApp.database().ref('grids1').on('value', (dataSnapshot) => {
      this.grids1 = dataSnapshot.child('/').val();
    });
    window.firebaseApp.database().ref('grids2').on('value', (dataSnapshot) => {
      this.grids2 = dataSnapshot.child('/').val();
    });
    window.firebaseApp.database().ref('grids3').on('value', (dataSnapshot) => {
      this.grids3 = dataSnapshot.child('/').val();
    });
    window.firebaseApp.database().ref('grids4').on('value', (dataSnapshot) => {
      this.grids4 = dataSnapshot.child('/').val();
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
    this[`grids${ch}`][idx].note = !this[`grids${ch}`][idx].note;

    window.firebaseApp.database().ref('grids1').set(this.grids1);
    window.firebaseApp.database().ref('grids2').set(this.grids2);
    window.firebaseApp.database().ref('grids3').set(this.grids3);
    window.firebaseApp.database().ref('grids4').set(this.grids4);
  }
}