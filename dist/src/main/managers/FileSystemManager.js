import * as fs from 'fs-extra';
import * as path from 'path';
import { app } from 'electron';
export class FileSystemManager {
    constructor() {
        this.userDataPath = app.getPath('userData');
        this.sharedDrivePath = this.detectSharedDrive();
        this.initializeDirectories();
    }
    detectSharedDrive() {
        // Try to detect shared network drives
        // This is a simplified implementation - in production, this would be configurable
        const possiblePaths = [
            'Z:\\', // Common Windows network drive
            '/Volumes/Shared', // macOS network volume
            '/mnt/shared' // Linux mount point
        ];
        for (const drivePath of possiblePaths) {
            try {
                if (fs.existsSync(drivePath)) {
                    return drivePath;
                }
            }
            catch (error) {
                // Continue checking other paths
            }
        }
        return null;
    }
    async initializeDirectories() {
        try {
            // Create local directories
            await fs.ensureDir(path.join(this.userDataPath, 'projects'));
            await fs.ensureDir(path.join(this.userDataPath, 'assets'));
            await fs.ensureDir(path.join(this.userDataPath, 'templates'));
            await fs.ensureDir(path.join(this.userDataPath, 'exports'));
            // Create shared directories if available
            if (this.sharedDrivePath) {
                try {
                    await fs.ensureDir(path.join(this.sharedDrivePath, 'g-asset-forge', 'shared-assets'));
                    await fs.ensureDir(path.join(this.sharedDrivePath, 'g-asset-forge', 'shared-projects'));
                }
                catch (error) {
                    console.warn('Could not create shared directories:', error);
                }
            }
        }
        catch (error) {
            console.error('Failed to initialize directories:', error);
        }
    }
    async readFile(filePath) {
        try {
            const fullPath = this.resolvePath(filePath);
            const data = await fs.readFile(fullPath, 'utf8');
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async writeFile(filePath, data) {
        try {
            const fullPath = this.resolvePath(filePath);
            await fs.ensureDir(path.dirname(fullPath));
            // Try shared drive first, fallback to local
            if (this.isSharedPath(filePath) && this.sharedDrivePath) {
                try {
                    await fs.writeFile(fullPath, data, 'utf8');
                    return { success: true, path: fullPath, location: 'shared' };
                }
                catch (error) {
                    // Fallback to local storage
                    const localPath = this.getLocalFallbackPath(filePath);
                    await fs.writeFile(localPath, data, 'utf8');
                    return {
                        success: true,
                        path: localPath,
                        location: 'local',
                        fallbackUsed: true,
                        originalError: error.message
                    };
                }
            }
            else {
                await fs.writeFile(fullPath, data, 'utf8');
                return { success: true, path: fullPath, location: 'local' };
            }
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async exists(filePath) {
        try {
            const fullPath = this.resolvePath(filePath);
            return await fs.pathExists(fullPath);
        }
        catch (error) {
            return false;
        }
    }
    async createDirectory(dirPath) {
        try {
            const fullPath = this.resolvePath(dirPath);
            await fs.ensureDir(fullPath);
            return { success: true, path: fullPath };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    resolvePath(filePath) {
        // Handle absolute paths
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        // Handle shared paths
        if (this.isSharedPath(filePath) && this.sharedDrivePath) {
            return path.join(this.sharedDrivePath, 'g-asset-forge', filePath.replace('shared/', ''));
        }
        // Handle local paths
        return path.join(this.userDataPath, filePath);
    }
    isSharedPath(filePath) {
        return filePath.startsWith('shared/') || filePath.includes('/shared/');
    }
    getLocalFallbackPath(filePath) {
        const relativePath = filePath.replace('shared/', 'local-fallback/');
        return path.join(this.userDataPath, relativePath);
    }
    getSharedDriveStatus() {
        return {
            available: this.sharedDrivePath !== null,
            path: this.sharedDrivePath
        };
    }
    getUserDataPath() {
        return this.userDataPath;
    }
}
//# sourceMappingURL=FileSystemManager.js.map