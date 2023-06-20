import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatSidenav } from "@angular/material/sidenav";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import {  
    LocalDatabaseService, 
    UtilsService
} from "../../../core";
import { 
    AppService, 
    ChartService, 
    IBarChartOptions, 
    ILayout, 
    ILineChartOptions, 
    NavService, 
    ValidationsService 
} from "../../../services";
import { 
    IPositionsComponent, 
    ISection, 
    ISectionID,
} from './interfaces';



@Component({
  selector: 'app-positions',
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnInit, OnDestroy, IPositionsComponent {
    // Position Sidenav Element
	@ViewChild("positionSidenav") positionSidenav: MatSidenav|undefined;
	public positionSidenavOpened: boolean = false;

    // Layout
	public layout: ILayout = this._app.layout.value;
	private layoutSub?: Subscription;

    // Initialization & Loading State
    public initializing: boolean = false;
    public initialized: boolean = false;
    public loaded: boolean = false;

    // Navigation
    public readonly sections: ISection[] = [
        { id: "summary", name: "Summary", icon: "dashboard"},
        { id: "pnl", name: "PNL", icon: "download"},
        { id: "fees", name: "Fees", icon: "upload"},
        { id: "amounts", name: "Amounts", icon: "aspect_ratio"},
        { id: "prices", name: "Prices", icon: "price_check"},
        { id: "positions", name: "Positions", icon: "format_list_numbered"},
    ];
    public activeSection = this.sections[0];
    public sectionLoaded: boolean = false;

    
    constructor(
        public _nav: NavService,
        public _app: AppService,
        private _validations: ValidationsService,
        private route: ActivatedRoute,
        private _localDB: LocalDatabaseService,
        private _chart: ChartService,
        private dialog: MatDialog,
        private _utils: UtilsService
    ) { }

    async ngOnInit(): Promise<void> {
        // Initialize layout
        this.layoutSub = this._app.layout.subscribe((nl: ILayout) => { this.layout = nl });


    }


    ngOnDestroy(): void {
        if (this.layoutSub) this.layoutSub.unsubscribe();
    }















}
