import {Component, Inject} from '@angular/core';
import * as lodash from "lodash";
import Rx from 'rxjs/Rx';

import {FrameService} from './frame.service';
import {MidiAdaputer} from './midiAdaputer';

const DEFAULT_BPM = 128;
const MAX_CHANNEL = 6;

@Component({
  selector  : 'wm-app',
  directives: [],
  providers : [FrameService, MidiAdaputer],
  template  : `
    <style>
      :host {
        display: flex;
        width: 100vw;
        height: 100vh;
        background-color: #222;
        color: #ffff00;
        justify-content: center;
        align-items: center;
      }
      #container {
        
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
      .g3 li {background: #492359;}
      .g4 li {background: #6e4708;}
      .g5 li {background: #661e17;}

      .g0 li.on {background: #1abc9c;}
      .g1 li.on {background: #2ecc71;}
      .g2 li.on {background: #3498db;}
      .g3 li.on {background: #9b59b6;}
      .g4 li.on {background: #f1c40f;}
      .g5 li.on {background: #e74c3c;}
      
      .g0 li.on.active { box-shadow: 0 0 20px rgba(209, 255, 200, 0.9); }
      .g1 li.on.active { box-shadow: 0 0 20px rgba(192, 255, 182, 0.9); }
      .g2 li.on.active { box-shadow: 0 0 20px rgba(193, 234, 255, 0.9); }
      .g3 li.on.active { box-shadow: 0 0 20px rgba(241, 218, 255, 0.9); }
      .g4 li.on.active { box-shadow: 0 0 20px rgba(255, 228, 158, 0.9); }
      .g5 li.on.active { box-shadow: 0 0 20px rgba(255, 205, 215, 0.9); }
    </style>
    <div id="container">
      <ul
        *ngFor="let key of keys"
        class="grids g{{key}}"
      >
        <li
          *ngFor="let grid of gridSet[key]; let idx = index"
          class="grid"
          [class.on]="grid.note"
          [class.active]="idx === current"
          (click)="onClickGrid(key, $event, idx)"
        ></li>
      </ul>
    </div>
    
  `
})
export class AppComponent {
  constructor(@Inject(FrameService) frame,
              @Inject(MidiAdaputer) midiAdapter) {
    this.frame = frame;
    this.midiAdapter = midiAdapter;

    this.range = 16;

    this.gridSet = {};
    lodash.range(MAX_CHANNEL).forEach((i) => {
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

        this.current = this.f % this.gridSet[0].length;
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