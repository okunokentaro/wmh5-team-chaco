import {Injectable} from '@angular/core';
import MIDI from './module/MIDI';
import Rx from 'rxjs/Rx';

@Injectable()
export class MidiAdaputer {
  constructor() {
    
    this.subject = new Rx.Subject();
    this.subject.subscribe((v) => {
      console.log(v);
    });
  }

  emit(v) {
    this.subject.next(v);
  }

}
