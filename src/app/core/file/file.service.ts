import { Injectable } from "@angular/core";
import { 
    getStorage, 
    FirebaseStorage, 
    ref, 
    getDownloadURL, 
    listAll, 
    ListResult, 
    getMetadata, 
    FullMetadata,
    deleteObject,
    uploadBytesResumable,
    StorageReference
} from "firebase/storage";
import * as moment from "moment";
import { Observable } from "rxjs";
import { UtilsService } from "../utils";
import { 
    IFileService, 
    IPath, 
    IDownloadedFile, 
    IFileInput, 
    IFileFormat, 
    IUploadedFile
} from "./interfaces";




@Injectable({
  providedIn: "root"
})
export class FileService implements IFileService {
    // Storage Instance
    private readonly storage: FirebaseStorage = getStorage();

    // Paths
    private readonly path: IPath = {
        dbBackups: "db_backups",
        predictionCandlesticks: "prediction_candlesticks",
        candlestickBundles: "candlesticks_bundle",
        epoch: "epoch"
    }

    constructor(
        private _utils: UtilsService
    ) { }







    /* Database Backups */





    /**
     * Retrieves a list of all the database backup files currently stored.
     * @returns Promise<IDownloadedFile[]>
     */
    public async listDatabaseBackups(): Promise<IDownloadedFile[]> {
        return this.getDownloadedFiles(this.path.dbBackups);
    }




    


    /**
     * Retrieves the download URL for a specific Database Backup.
     * @param backupName 
     * @returns Promise<string>
     */
    public getDatabaseBackupDownloadURL(backupName: string): Promise<string> {
        return this.getDownloadURL(this.path.dbBackups, backupName);
    }











    /* Prediction Candlestick Files */






    /**
     * Retrieves a list of all the prediction candlestick files currently stored.
     * @returns Promise<IDownloadedFile[]>
     */
    public async listPredictionCandlestickFiles(): Promise<IDownloadedFile[]> {
        return this.getDownloadedFiles(this.path.predictionCandlesticks);
    }




    


    /**
     * Retrieves the download URL for a specific Prediction Candlesticks file.
     * @param backupName 
     * @returns Promise<string>
     */
    public getPredictionCandlestickDownloadURL(fileName: string): Promise<string> {
        return this.getDownloadURL(this.path.predictionCandlesticks, fileName);
    }












    /* Candlestick Bundle Files */






    /**
     * Retrieves a list of all the candlestick bundle files currently stored.
     * @returns Promise<IDownloadedFile[]>
     */
    public async listCandlestickBundleFiles(): Promise<IDownloadedFile[]> {
        return this.getDownloadedFiles(this.path.candlestickBundles);
    }




    


    /**
     * Retrieves the download URL for a specific Candlestick Bundle File
     * @param fileName 
     * @returns Promise<string>
     */
    public getCandlestickBundleDownloadURL(fileName: string): Promise<string> {
        return this.getDownloadURL(this.path.candlestickBundles, fileName);
    }








    /* Epoch File */




    /**
     * Initializes the upload task for an epoch file and returns
     * the observable that will serve as a medium during the process.
     * @param file 
     * @param epochID 
     * @returns Observable<number|IUploadedFile>
     */
    public uploadEpochFile(file: File, epochID: string): Observable<number|IUploadedFile> {
        return this.uploadCloudFile(file, `${this.path.epoch}/${epochID}.zip`);
    }





    /**
     * Deletes an Epoch file in a persistant way from the cloud.
     * Keep in mind this function is safe to invoke.
     * @param epochID 
     * @returns Promise<void>
     */
    public deleteEpochFile(epochID: string): Promise<void> {
        return this.deleteCloudFile(`${this.path.epoch}/${epochID}.zip`);
    }













    /* Cloud File General Helpers */






    

    /**
     * Returns the file list result for a given path.
     * @param path 
     * @returns Promise<ListResult>
     */
    private listAll(path: string): Promise<ListResult> {
        return listAll(ref(this.storage, path))
    }









    /**
     * Retrieves a list of files stored in a path.
     * @param path 
     * @returns 
     */
    private async getDownloadedFiles(path: string): Promise<IDownloadedFile[]> {
        // Init the list of items
        let items: IDownloadedFile[] = [];

        // Download all the files
        const result: ListResult = await this.listAll(path);

        // Populate the list if any files were found
        if (result && result.items && result.items.length) {
            // Iterate over each item and extract the name and the size
            for (let item of result.items) {
                // Retrieve the file metadata
                const md: FullMetadata = await this.getFileMetadata(path, item.name);

                // Append the item
                items.push({
                    name: item.name,
                    size: md.size,
                    creation: moment(md.timeCreated).valueOf()
                });
            }

            // Sort the items by creation date descending
            items.sort((a, b) => (b.creation > a.creation) ? 1 : -1);

            // Return the final list
            return items;
        } else {
            return []
        }
    }








    /**
     * Retrieves the size of a file safely. If there is an error it 
     * will log it and return 0.
     * @param path 
     * @param name 
     * @returns Promise<FullMetadata>
     */
    private async getFileMetadata(path: string, name: string): Promise<FullMetadata> {
        return await getMetadata(ref(this.storage, `${path}/${name}`));
    }








    /**
     * Retrieves the File"s download URL.
     * @param path 
     * @param name 
     * @returns Promise<string>
     */
    private getDownloadURL(path: string, name: string): Promise<string> {
        return getDownloadURL(ref(this.storage, `${path}/${name}`));
    }








    /* Cloud File Upload */






	/*
	* Builds the upload task
	* for a file to be uploaded to
	* firebase storage
	* @param file
	* @param ref
	* @returns Observable<number|IUploadedFile>
	* */
	private uploadCloudFile(file: File, refString: string): Observable<number|IUploadedFile> {
        // Init the ref, the task and the name of the file
        const storageRef: StorageReference = ref(this.storage, refString);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        // Listen for state changes, errors, and completion of the upload.
        return new Observable((observer) => {
            uploadTask.on(
                // Subscribe to all state changes
                "state_changed",

                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                (snapshot) => {
					observer.next(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) || 0);
                },

                // Handle any potential errors
                (e) => { observer.error(e) },

                // When the upload completes, download the URL and complete the observable
                async () => {
					// Init values
					const name: string = uploadTask.snapshot.metadata.name;
                    let url: string|undefined;

                    // Attempt to download the URL, if there is an error, delete the file prior to completing the observable
                    try {
                        try { url = await getDownloadURL(ref(this.storage, refString)) }
                        catch (e) {
                            console.log("Error when retrieving the download URL for the uploaded file. Attempting again in a few seconds.", e);
                            await this._utils.asyncDelay(5);
                            url = await getDownloadURL(ref(this.storage, refString))
                        }

                        // Finally, complete the observable with the uploaded file
                        observer.next({name: name, url: url});
                        observer.complete();
                    } catch (e) {
                        await this.deleteCloudFile(refString);
                        observer.error(e);
                    }
                }
            );
        });
    }










    /**
     * Deletes a file at a provided ref string in a persistant way.
     * If it fails after 3 attempts, it resolves. This function
     * is safe to invoke.
     * @param refString 
     * @param count?
     * @returns Promise<void>
     */
    private async deleteCloudFile(refString: string, count?: number): Promise<void> {
        // Init the count in case it wasn't provided
        count = typeof count == "number" ? count: 0;

        // Attempt to delete the file
        try {
            await deleteObject(ref(this.storage, refString));
        } catch (e) {
			if (count >= 3) {
				console.log('[FileService]: The file could not be deleted after 3 attempts.');
				console.log(e);
				return
			} else {
				console.log('[FileService]: Error when trying to delete a file. Attempting again in a few seconds.');
				console.log(e);
				await this._utils.asyncDelay(5);
				await this.deleteCloudFile(refString, ++count);
			}
        }
    }











    /* File Input */





    /**
     * Based on a given file change event and configuration, builds
     * and returns the File Input object.
     * @param event 
     * @param acceptedFormats 
     * @param maxSizeBytes 
     * @param touched 
     * @returns IFileInput
     */
    public getFile(
        event: any, 
        acceptedFormats: IFileFormat[], 
        maxSizeBytes: number, 
        touched?: boolean
    ): IFileInput {
        // Init the default file
        let fileInput: IFileInput = {
            touched: touched == true,
            file: null,
            acceptedFormats: acceptedFormats,
            maxSizeBytes: maxSizeBytes,
            error: undefined
        }

		// If it hasnt been touched, return the default file
		if (!touched) return fileInput;

		// If it isn't pristine, make sure the event was provided
		if (!event || !event.target || !event.target.files || !event.target.files.length) {
			console.log(event);
			fileInput.error = "The provided event did not include any files.";
			return fileInput;
		}

		// Extract and validate the file
		const file: File = event.target.files[0];
		
		// Validate the size of the file
		if (file.size > fileInput.maxSizeBytes) {
			fileInput.error = `The file size (${file.size}) is superior to the limit (${fileInput.maxSizeBytes}).`
			return fileInput;
		}

        // Validate the format
        if (!fileInput.acceptedFormats.includes(<IFileFormat>file.type)) {
			fileInput.error = `The format of the file (${file.type}) is not accepted.`
			return fileInput;
        }

        // Finally, complete and return the file input
        fileInput.file = file;
        return fileInput;
    }









    /* General File Helpers */





    /**
     * Given a path, it will extract the file name and then
     * remove the extension from it if applies
     * @param fullPath 
     * @param removeExtension? 
     * @returns string
     */
    public getFileNameFromPath(fullPath: string, removeExtension?: boolean): string {
        // Extract the file name from the path
        const fileName = fullPath.replace(/^.*[\\\/]/, '');

        // Return it without the extension
        return removeExtension ? this.removeExtensionFromFileName(fileName): fileName;
    }


    


    /**
     * Removes an extension from a file name. For example: 
     * _ALPHA.zip -> _ALPHA
     * @param fileName 
     * @returns string
     */
    private removeExtensionFromFileName(fileName: string): string { return fileName.replace(/\.[^/.]+$/, "")}





	
	
	/*
	* Retrieves the file extension from a Blob
	* @param file
	* @returns IFileExtension
	* */
	/*private getFileExtension(file: File): IFileExtension {
		switch (file.type) {
			case "application/json":
				return "json";
			case "application/zip":
				return "zip";
			default:
				throw new Error(`The extension could not be extracted from the file ${file.type}`);
		}
	}*/



	
	
	
	/*
	* Retrieves the file extension from its name.
	* @param fileName
	* @returns IFileExtension
	* */
	/*private getFileExtensionByName(fileName: string): IFileExtension {
        // Init the extension
        const ext: IFileExtension|string = fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);

        // Make sure an extension was extracted
        if (typeof ext != "string" || !ext.length) {
            throw new Error(`The file extension could be extracted from the file name. Received: ${ext}`);
        }

        // Finally, return it
		return <IFileExtension>ext;
	}*/











    



    /* JSON File Input Reader */








    /**
     * Given a file change event, it will extract all the information from a 
     * single or multiple JSON Files.
     * @param event
     * @returns Promise<any[]>
     */
    public async readJSONFiles(event: any): Promise<any[]> {
		// Make sure 1 or more files have been provided
		if (!event || !event.target || !event.target.files || !event.target.files.length) {
            console.log(event);
			throw new Error("The FileChange Event does not contain any files.");
		}

		// Convert the FileList into an array and iterate
		const files: Promise<any>[] = Array.from(event.target.files).map(file => {
			// Define a new file reader
			let reader = new FileReader();

			// Create a new promise
			return new Promise((resolve, reject) => {
				// Resolve the promise after reading file
				reader.onload = () => {
					// Make sure the result is a string
                    if (reader && typeof reader.result == "string") {
                        // Resolve the parsed file
                        resolve(JSON.parse(<string>reader.result.replace(/\bNaN\b/g, "0")))
                    } else {
						console.error(reader.result);
						reject("The file reader result is not a valid string that can be parsed.");
                    }
				};

				// Read the file as a text
				reader.readAsText(<Blob>file);
			});
		});

        // Return the parsed data
        return await Promise.all(files);
    }
}
