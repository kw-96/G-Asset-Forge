import React, { useContext } from 'react';

export interface ZoomPanState {
  zoom: number;
  pan: { x: number; y: number };
}

export const ZoomPanContext = React.createContext<ZoomPanState>({ zoom: 1, pan: { x: 0, y: 0 } });

export const useZoomPan = (): ZoomPanState => useContext(ZoomPanContext);


