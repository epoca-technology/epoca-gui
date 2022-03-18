import { Injectable } from '@angular/core';
import { getStorage, FirebaseStorage, ref, getDownloadURL, listAll, ListResult, getMetadata, FullMetadata} from "firebase/storage";
import { IFileService, IPath } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class FileService implements IFileService{
    // Storage Instance
    private readonly storage: FirebaseStorage = getStorage();

    // Paths
    private readonly path: IPath = {
        dbBackups: 'db_backups',
        forecastModels: ''
    }

    constructor() { }







    /**
     * Retrieves a list of all the database backup files currently stored.
     * @return Promise<string[]>
     */
    public async listDatabaseBackups(): Promise<string[]> {
        // Init the list of items
        let items: string[] = [];

        // Download all the files
        const result: ListResult = await listAll(ref(this.storage, this.path.dbBackups));

        // Populate the list if any files were found
        if (result && result.items && result.items.length) {
            // Iterate over each item and extract the name
            result.items.forEach((item) => { items.push(item.name) });

            // Return the final list
            return items;
        } else {
            return []
        }
    }






    

    /**
     * Retrieves the file's metadata and returns the size in bytes.
     * If no data is found or if an error is triggered, it will return
     * 0 and log an error
     * @param name 
     * @return Promise<number>
     */
     public async getDatabaseBackupFileSize(name: string): Promise<number> {
        try {
            // Download the data
            const data: FullMetadata = await getMetadata(ref(this.storage, `${this.path.dbBackups}/${name}`));

            // Return the size if found
            if (data && typeof data.size == "number") {
                return data.size;
            } else {
                console.error(`The downloaded metadata did not include the size for ${name}`, data);
                return 0;
            }
        } catch (e) {
            console.error(`Error when downloading ${name}'s metadata: `, e);
            return 0;
        }
    }




    





    /**
     * Retrieves the download URL for a specific Database Backup.
     * @param backupName 
     * @return Promise<string>
     */
    public downloadDatabaseBackup(backupName: string): Promise<string> {
        return getDownloadURL(ref(this.storage, `${this.path.dbBackups}/${backupName}`));
    }




    


}
