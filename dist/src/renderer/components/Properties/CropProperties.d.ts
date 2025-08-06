import React from 'react';
import { CropSettings } from '../../tools/CropTool';
interface CropPropertiesProps {
    settings: CropSettings;
    cropArea: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    onSettingsChange: (settings: Partial<CropSettings>) => void;
    onCropAreaChange: (area: Partial<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>) => void;
    onApplyCrop: () => void;
    onCancelCrop: () => void;
}
declare const CropProperties: React.FC<CropPropertiesProps>;
export default CropProperties;
//# sourceMappingURL=CropProperties.d.ts.map