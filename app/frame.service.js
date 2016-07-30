import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';

@Injectable()
export class FrameService {

  constructor() {
    this.startTime = window.performance.now();
    this.subject   = new Subject();
  }

  run(bpm) {
    let fps = 1 / (60 / bpm / 4);

    let loop = () => {
      requestAnimationFrame(loop);
      const lastTime = window.performance.now();
      const frame    = ~~(
        (lastTime - this.startTime) / (1000.0 / fps)
      ); // Math.floor hack
      this.subject.next(frame);
    };
    loop();
  }

  get observable() {
    return this.subject;
  }

}
