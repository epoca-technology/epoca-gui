import {MatSnackBarRef, TextOnlySnackBar} from "@angular/material/snack-bar";

export interface ISnackbarService {
	success(message: string, action: boolean): MatSnackBarRef<TextOnlySnackBar>,
	info(message: string, action: boolean): MatSnackBarRef<TextOnlySnackBar>,
	error(message: string, action: boolean): MatSnackBarRef<TextOnlySnackBar>
}
