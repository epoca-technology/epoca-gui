import { Component, OnInit, Input } from '@angular/core';
import { IModel } from 'src/app/core';
import { IModelContentComponent } from './interfaces';

@Component({
  selector: 'app-model-content',
  templateUrl: './model-content.component.html',
  styleUrls: ['./model-content.component.scss']
})
export class ModelContentComponent implements OnInit, IModelContentComponent {
	@Input() model!: IModel;
    constructor() { }

    ngOnInit(): void {
    }

}
