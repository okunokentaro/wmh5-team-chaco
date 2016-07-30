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
      
      .g0 li {background: #0a4b3e;}
      .g1 li {background: #12512d;}
      .g2 li {background: #14405c;}
      .g3 li {background: #19244a;}
      .g4 li {background: #492359;}
      .g5 li {background: #6e4708;}
      .g6 li {background: #7c3100;}
      .g7 li {background: #661e17;}

      .g0 li.on {background: #1abc9c;}
      .g1 li.on {background: #2ecc71;}
      .g2 li.on {background: #3498db;}
      .g3 li.on {background: #4763c1;}
      .g4 li.on {background: #9b59b6;}
      .g5 li.on {background: #f1c40f;}
      .g6 li.on {background: #e67e22;}
      .g7 li.on {background: #e74c3c;}
    </style>
    <ul
      *ngFor="let key of keys"
      class="grids g{{key}}"
    >
      <li
        *ngFor="let grid of gridSet[key]; let idx = index"
        class="grid"
        [class.on]="grid.note"
        (click)="onClickGrid(key, $event, idx)"
      ></li>
    </ul>
    
  `
})
export class AppComponent {
  constructor(@Inject(FrameService) frame,
              @Inject(MidiAdaputer) midiAdapter) {
    this.frame = frame;
    this.midiAdapter = midiAdapter;

    this.range = 16;

    this.gridSet = {};
    lodash.range(8).forEach((i) => {
      this.gridSet[i] = lodash.range(this.range).map(() => {
        return {note: false, bpm: DEFAULT_BPM};
      });
    });
    this.keys = Object.keys(this.gridSet);

    // Object.keys(this.gridSet).forEach((_, i) => {
    //   window.firebaseApp.database().ref('grids' + i).set(this.gridSet[i]);
    // });
  }

  ngOnInit() {
    console.log(this.gridSet);
    Object.keys(this.gridSet).forEach((_, i) => {
      window.firebaseApp.database().ref('grids' + i).on('value', (dataSnapshot) => {
        this.gridSet[i] = dataSnapshot.child('/').val();
      });
    });

    setTimeout(() => {
      this.run(DEFAULT_BPM);
    }, 2000);
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

        const func = (i) => {
          const current = this.f % this.gridSet[i].length;
          if (this.gridSet[i][current].note) {
            data['ch' + i] = {i: current, bpm: this.bpm};
          }
        };

        Object.keys(this.gridSet).forEach((_, i) => {
          func(i);
        });

        if (0 < Object.keys(data).length) {
          this.midiAdapter.emit(data);
        }
      });
  }

  onClickGrid(ch, ev, idx) {
    console.log(`onClickGrid`, idx);
    this.gridSet[ch][idx].note = !this.gridSet[ch][idx].note;

    Object.keys(this.gridSet).forEach((_, i) => {
      window.firebaseApp.database().ref('grids' + i).set(this.gridSet[i]);
    });
  }
}