import * as Y from 'yjs';

let initialDocBuffer: Buffer | null = null;

export const generateInitialDoc = () => {
  if (initialDocBuffer) {
    return initialDocBuffer;
  }
  const g-asset-forgeDoc = {
    objectName: 'Document',
    width: 0,
    height: 0,
    type: 'Document',
    id: '0-0',
    transform: [1, 0, 0, 1, 0, 0],
    strokeWidth: 1,
  };
  const g-asset-forgeCanvas = {
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
  yMap.set(g-asset-forgeDoc.id, g-asset-forgeDoc);
  yMap.set(g-asset-forgeCanvas.id, g-asset-forgeCanvas);

  initialDocBuffer = Buffer.from(Y.encodeStateAsUpdate(yDoc));
  return initialDocBuffer;
};
