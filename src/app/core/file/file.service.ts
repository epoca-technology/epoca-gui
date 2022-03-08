import { Injectable } from '@angular/core';
import { getStorage, FirebaseStorage, ref, getDownloadURL, listAll, ListResult} from "firebase/storage";
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
     * @returns Promise<string[]>
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
     * Retrieves the download URL for a specific Database Backup.
     * @param backupName 
     * @returns Promise<string>
     */
    public downloadDatabaseBackup(backupName: string): Promise<string> {
        return getDownloadURL(ref(this.storage, `${this.path.dbBackups}/${backupName}`));
    }
}
