import {Component, Inject} from '@angular/core';
import * as lodash from "lodash";
import Rx from 'rxjs/Rx';

import {FrameService} from './frame.service';
import {MidiAdaputer} from './midiAdaputer';

const DEFAULT_BPM = 128;

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
        margin-bottom: 8px;
      }
      .grid {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        background: #550;
      }
      .g1 li {
        background: #550;
      }
      .g2 li {
        background: #505;
      }
      .g3 li {
        background: #055;
      }
      .g4 li {
        background: #500;
      }
      .g1 li.on {
        background: #ff0;
      }
      .g2 li.on {
        background: #f0f;
      }
      .g3 li.on {
        background: #0ff;
      }
      .g4 li.on {
        background: #a00;
      }
    </style>
    <h1>{{f}}</h1>
    <ul class="grids g1">
      <li
        *ngFor="let grid of grids1; let idx = index"
        class="grid"
        [class.on]="grid.note"
        (click)="onClickGrid(1, $event, idx)"
      ></li>
    </ul>
    
    <ul class="grids g2">
      <li
        *ngFor="let grid of grids2; let idx = index"
        class="grid"
        [class.on]="grid.note"
        (click)="onClickGrid(2, $event, idx)"
      ></li>
    </ul>
    
    <ul class="grids g3">
      <li
        *ngFor="let grid of grids3; let idx = index"
        class="grid"
        [class.on]="grid.note"
        (click)="onClickGrid(3, $event, idx)"
      ></li>
    </ul>
    
    <ul class="grids g4">
      <li
        *ngFor="let grid of grids4; let idx = index"
        class="grid"
        [class.on]="grid.note"
        (click)="onClickGrid(4, $event, idx)"
      ></li>
    </ul>
    
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
<<<<<<< HEAD

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
=======
  }

  initGrid() {
    this.grids1 = lodash.range(this.range).map((i) => {
      return {
        note: false
      }
>>>>>>> master
    });

    this.grids2 = lodash.range(this.range).map((i) => {
      return {
        note: false
      }
    });

    this.grids3 = lodash.range(this.range).map((i) => {
      return {
        note: false
      }
    });

    this.grids4 = lodash.range(this.range).map((i) => {
      return {
        note: false
      }
    });
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
    this.grids1 = lodash.range(this.range);
    this.grids2 = lodash.range(this.range);
    this.grids3 = lodash.range(this.range);
    this.grids4 = lodash.range(this.range);
  }

  onBpmChange(bpm) {
    this.bpmChangeSubject.next(bpm);
  }

  run(bpm) {
    if (this.disposable && typeof this.disposable.unsubscribe === 'function') {
      console.log(`unsubscribe`);
      this.disposable.unsubscribe();
    }

    let prevFrame = null;
    this.bpm = bpm;
    this.frame.run(this.bpm);
    this.disposable = this.frame.observable
      .filter((f) => {
        if (f === prevFrame) {
          return false;
        }
        prevFrame = f;
        return true;
      })
      .subscribe((f) => {
        this.f = f;

        let data = {};

        const current1 = this.f % this.grids1.length;
        if (this.grids1[current1].note) {
          data.ch1 = {i: current1, bpm: this.bpm};
        }
        const current2 = this.f % this.grids2.length;
        if (this.grids2[current2].note) {
          data.ch2 = {i: current2, bpm: this.bpm};
        }
        const current3 = this.f % this.grids3.length;
        if (this.grids3[current3].note) {
          data.ch3 = {i: current3, bpm: this.bpm};
        }
        const current4 = this.f % this.grids4.length;
        if (this.grids4[current4].note) {
          data.ch4 = {i: current4, bpm: this.bpm};
        }

        if (0 < Object.keys(data).length) {
          this.midiAdapter.emit(data);
        }
      });
  }

  onClickGrid(ch, ev, idx) {
    console.log(`onClickGrid`, idx);
    this[`grids${ch}`][idx].note = !this[`grids${ch}`][idx].note;

    window.firebaseApp.database().ref('grids1').set(this.grids1);
    window.firebaseApp.database().ref('grids2').set(this.grids2);
    window.firebaseApp.database().ref('grids3').set(this.grids3);
    window.firebaseApp.database().ref('grids4').set(this.grids4);
  }
}