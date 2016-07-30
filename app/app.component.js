import {Component, Inject} from '@angular/core';

import {DummyService} from './dummy.service';

@Component({
  selector  : 'wm-app',
  directives: [],
  providers : [DummyService],
  template  : `
    <h1>hello {{text}}</h1>
  `
})
export class AppComponent {
  constructor(@Inject(DummyService) dummyService) {
    this.text = dummyService.get();
  }
}