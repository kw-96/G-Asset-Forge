import { type GAssetForgeEditor } from '../editor';

export const exportService = {
  exportOriginFile: (editor: GAssetForgeEditor, filename = 'design') => {
    const data = editor.sceneGraph.toJSON();
    const blob = new Blob([data], {
      type: 'application/json',
    });
    download(blob, filename + '.gaf');
  },
};

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', filename);
  a.click();
};
