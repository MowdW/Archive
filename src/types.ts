export interface FilterCondition {
  id: string;
  type: 'path' | 'property';
  operator: 'contains' | 'not_contains';
  key?: string;
  value: string;
}

export interface FileItem {
  id: string;
  name: string;
  subName?: string;
  type: 'file' | 'folder' | 'sticky' | 'link' | 'frame';
  color?: string;
  content?: string;
  children?: FileItem[];
  imageUrl?: string;
  path?: string;
  url?: string;
  width?: number;
  height?: number;
  filterConditions?: FilterCondition[];
  x?: number;
  y?: number;
  rotation?: number;
  metadata?: any;
  fontFamily?: string;
}
