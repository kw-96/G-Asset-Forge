export declare class FileSystemManager {
    private readonly userDataPath;
    private readonly sharedDrivePath;
    constructor();
    private detectSharedDrive;
    private initializeDirectories;
    readFile(filePath: string): Promise<any>;
    writeFile(filePath: string, data: any): Promise<any>;
    exists(filePath: string): Promise<boolean>;
    createDirectory(dirPath: string): Promise<any>;
    private resolvePath;
    private isSharedPath;
    private getLocalFallbackPath;
    getSharedDriveStatus(): {
        available: boolean;
        path: string | null;
    };
    getUserDataPath(): string;
}
//# sourceMappingURL=FileSystemManager.d.ts.map