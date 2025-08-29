import * as Y from 'yjs';
let initialDocBuffer: Buffer | null = null;
export const generateInitialDoc = () => {
  if (initialDocBuffer) {
    return initialDocBuffer;
  }
  const gAssetForgeDoc = {
    objectName: 'Document',
    width: 0,
    height: 0,
    type: 'Document',
    id: '0-0',
    transform: [1, 0, 0, 1, 0, 0],
    strokeWidth: 1,
  };
  const gAssetForgeCanvas = {
    objectName: 'Page 1',
    width: 0,
    height: 0,
    type: 'Canvas',
    id: '0-1',
    transform: [1, 0, 0, 1, 0, 0],
    strokeWidth: 1,
  };

  const yDoc = new Y.Doc();
  const yMap = yDoc.getMap('nodes');
  yMap.set(gAssetForgeDoc.id, gAssetForgeDoc);
  yMap.set(gAssetForgeCanvas.id, gAssetForgeCanvas);

  initialDocBuffer = Buffer.from(Y.encodeStateAsUpdate(yDoc));
  return initialDocBuffer;
};
