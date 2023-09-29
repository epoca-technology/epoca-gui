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
        candlestickBundles: "candlesticks_bundle"
    }

    constructor(
        private _utils: UtilsService
    ) { }










    /********************
     * Database Backups *
     ********************/





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
















    /********************************
     * Prediction Candlestick Files *
     ********************************/





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














    /****************************
     * Candlestick Bundle Files *
     ****************************/





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
















    /******************************
     * Cloud File General Helpers *
     ******************************/





    

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
}
