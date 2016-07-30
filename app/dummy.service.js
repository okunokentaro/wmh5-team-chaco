import {Injectable} from '@angular/core';

@Injectable()
export class DummyService {
  get() {
    return 'It\'s a dummy!';
  }
}