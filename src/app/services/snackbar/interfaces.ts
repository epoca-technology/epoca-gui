import {MatSnackBarRef, TextOnlySnackBar} from "@angular/material/snack-bar";

export interface ISnackbarService {
	success(message: string, action: boolean): MatSnackBarRef<TextOnlySnackBar>,
	info(message: string, action: boolean): MatSnackBarRef<TextOnlySnackBar>,
	error(error: any, action: boolean): MatSnackBarRef<TextOnlySnackBar>
}
