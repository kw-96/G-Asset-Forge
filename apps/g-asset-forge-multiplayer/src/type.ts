import { type IPoint } from '@g-asset-forge/geo';

export interface IUserItem {
  id: string;
  name: string;
  color: string;
  pos: IPoint | null;
  awarenessId: number;
}
