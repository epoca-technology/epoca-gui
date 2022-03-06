import { Component, OnInit } from '@angular/core';
import { IMlModelsComponent } from './interfaces';
import { NavService } from '../../../services';

@Component({
  selector: 'app-ml-models',
  templateUrl: './ml-models.component.html',
  styleUrls: ['./ml-models.component.scss']
})
export class MlModelsComponent implements OnInit, IMlModelsComponent {

    // Load State
    public loaded = false;

    constructor(
        public _nav: NavService
    ) { }

    ngOnInit(): void {
        this.loaded = true;
    }

}
