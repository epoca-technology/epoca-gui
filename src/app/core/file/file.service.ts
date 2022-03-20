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
        forecastModels: '',
        candlestickSpreadsheets: 'candlestick_spreadsheets'
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






    /* Forecast Models */
    
    // @TODO










    /* Candlestick Spreadsheets */






    /**
     * Retrieves a list of all the spreadsheet files currently stored.
     * @returns Promise<IDownloadedFile[]>
     */
    public async listCandlestickSpreadsheets(): Promise<IDownloadedFile[]> {
        return this.getDownloadedFiles(this.path.candlestickSpreadsheets);
    }




    


    /**
     * Retrieves the download URL for a specific Candlestick Spreadsheet.
     * @param backupName 
     * @returns Promise<string>
     */
    public getCandlestickSpreadsheetDownloadURL(fileName: string): Promise<string> {
        return this.getDownloadURL(this.path.candlestickSpreadsheets, fileName);
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
                items.push({
                    name: item.name,
                    size: await this.getFileSize(path, item.name),
                    creation: Number(item.name.split('.')[0])
                });
            }

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
     * @returns Promise<number>
     */
    private async getFileSize(path: string, name: string): Promise<number> {
        try {
            // Download the data
            const data: FullMetadata = await getMetadata(ref(this.storage, `${path}/${name}`));

            // Return the size if found
            if (data && typeof data.size == "number") {
                return data.size;
            } else {
                console.error(`The downloaded metadata did not include the size for ${name}`, data);
                return 0;
            }
        } catch (e) {
            console.log(`Error when retrieving ${path}/${name}'s size:`, e);
            return 0;
        }
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
}
