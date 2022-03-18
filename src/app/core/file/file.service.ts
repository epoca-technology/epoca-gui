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
        forecastModels: ''
    }

    constructor() { }







    /* Database Backups */




    /**
     * Retrieves a list of all the database backup files currently stored.
     * @return Promise<IDownloadedFile[]>
     */
    public async listDatabaseBackups(): Promise<IDownloadedFile[]> {
        // Init the list of items
        let items: IDownloadedFile[] = [];

        // Download all the files
        const result: ListResult = await this.listAll(this.path.dbBackups);

        // Populate the list if any files were found
        if (result && result.items && result.items.length) {
            // Iterate over each item and extract the name and the size
            for (let item of result.items) {
                items.push({
                    name: item.name,
                    size: await this.getFileSize(this.path.dbBackups, item.name)
                });
            }

            // Return the final list
            return items;
        } else {
            return []
        }
    }




    





    /**
     * Retrieves the download URL for a specific Database Backup.
     * @param backupName 
     * @return Promise<string>
     */
    public getDatabaseBackupDownloadURL(backupName: string): Promise<string> {
        return this.getDownloadURL(this.path.dbBackups, backupName);
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
