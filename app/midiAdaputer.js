import {Injectable} from '@angular/core';
import MIDI from './module/MIDI';
import Rx from 'rxjs/Rx';

@Injectable()
class MidiAdaputer {
  constructor {
    this.midi = new MIDI();
    this.subject = new Rx.Subject();
    this.subject.subscribe((v) => {

    });
  }

  emit(v) {
    this.subject.next(v);
  }

}

export class MidiAdaputer;