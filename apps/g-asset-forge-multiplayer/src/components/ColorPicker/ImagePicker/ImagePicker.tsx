import './ImagePicker.scss';

import { DEFAULT_IMAGE_SRC } from '@g-asset-forge/core';
import { useMount } from 'ahooks';
import { type FC, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

interface IProps {
  value: string;
  onChange: (src: string) => void;
}
export const ImagePicker: FC<IProps> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useMount(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // only image

    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setTimeout(() => {
          onChange(src);
        });
      };
      reader.readAsDataURL(file);
    };

    fileInputRef.current = fileInput;
  });

  return (
    <div className="g-asset-forge-image-picker">
      <div className="g-asset-forge-img-content">
        <img className="g-asset-forge-img-preview" src={value || DEFAULT_IMAGE_SRC} />
        <div className="g-asset-forge-img-choose-btn-wrapper">
          <button
            className="g-asset-forge-img-choose-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <FormattedMessage id="uploadFile" />
          </button>
        </div>
      </div>
    </div>
  );
};
