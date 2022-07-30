import { Injectable } from '@angular/core';
import { 
    getStorage, 
    FirebaseStorage, 
    ref, 
    getDownloadURL, 
    listAll, 
    ListResult, 
    getMetadata, 
    FullMetadata
} from "firebase/storage";
import * as moment from 'moment';
import { IFileService, IPath, IDownloadedFile } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class FileService implements IFileService{
    // Storage Instance
    private readonly storage: FirebaseStorage = getStorage();

    // Paths
    private readonly path: IPath = {
        dbBackups: 'db_backups',
        predictionCandlesticks: 'prediction_candlesticks',
        candlestickBundles: 'candlesticks_bundle'
    }

    constructor() { }







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
     * @param backupName 
     * @returns Promise<string>
     */
    public getCandlestickBundleDownloadURL(fileName: string): Promise<string> {
        return this.getDownloadURL(this.path.candlestickBundles, fileName);
    }












    /* File General Helpers */






    

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
     * Retrieves the File's download URL.
     * @param path 
     * @param name 
     * @returns Promise<string>
     */
    private getDownloadURL(path: string, name: string): Promise<string> {
        return getDownloadURL(ref(this.storage, `${path}/${name}`));
    }















    /* File Input Reader */








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
			throw new Error('The FileChange Event does not contain any files.');
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
						reject('The file reader result is not a valid string that can be parsed.');
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
