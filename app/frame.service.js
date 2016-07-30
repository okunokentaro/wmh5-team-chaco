import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Rx';

@Injectable()
export class FrameService {

  constructor() {
    this.startTime = window.performance.now();
    this.fps       = 1;

    this.subject = new Subject();
  }

  run() {
    let loop = () => {
      requestAnimationFrame(loop);
      const lastTime = window.performance.now();
      const frame    = ~~(
        (lastTime - this.startTime) / (1000.0 / this.fps)
      ); // Math.floor hack
      this.subject.next(frame);
    };
    loop();
  }

  get observable() {
    return this.subject;
  }

}
