import {BehaviorSubject} from "rxjs";


export interface IAppService {
	// Layout
	layout: BehaviorSubject<ILayout>
}


// Layout
export type ILayout = 'mobile'|'desktop';
export type ILayoutAlias = 'xs'|'sm'|'md'|'lg'|'xl';