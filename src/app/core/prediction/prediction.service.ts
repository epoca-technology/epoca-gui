import { Injectable } from '@angular/core';
import { IPredictionService } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class PredictionService implements IPredictionService {

  constructor() { }
}
