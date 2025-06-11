
export interface RawDataItem {
  SD_System: string;
  SD_System_Name?: string;
  SD_Sub_System: string;
  SD_Subsystem_Name?: string;
  discipline: string;
  "TOTAL ITEM": string; // number as string
  "TOTAL DONE": string; // number as string
  "TOTAL PENDING": string; // number as string
  "TOTAL NOT CLEAR PUNCH": string; // number as string
  "TOTAL HOLD POINT": string; // number as string
  [key: string]: string | undefined; // Allow other properties
}

export interface DetailedItem {
  subsystem: string;
  discipline: string;
  tagNo: string;
  typeCode: string;
  description: string;
  status: string;
}

export interface PunchItem {
  subsystem: string;
  discipline: string;
  tagNo: string;
  typeCode: string;
  punchCategory: string;
  punchDescription: string;
}

export interface HoldPointItem {
  subsystem: string;
  discipline: string;
  tagNo: string;
  typeCode: string;
  hpPriority: string;
  hpDescription: string;
  hpLocation: string;
}

export interface DisciplineStats {
  total: number;
  done: number;
  pending: number;
  punch: number;
  hold: number;
  remaining: number;
}

export interface SubSystem {
  id: string;
  name: string;
  systemId: string;
  title: string;
  disciplines: { [key: string]: DisciplineStats };
}

export interface SystemInfo {
  id: string;
  name: string;
  subs: Array<{ id: string; name: string }>;
}

export interface ProcessedData {
  systemMap: { [key: string]: SystemInfo };
  subSystemMap: { [key: string]: SubSystem };
  allRawData: RawDataItem[];
}

export interface AggregatedStats {
  totalItems: number;
  done: number;
  pending: number;
  punch: number;
  hold: number;
  remaining: number;
}

export interface SelectedView {
  type: 'all' | 'system' | 'subsystem';
  id: string | null; // null for 'all'
  name: string;
  parentId?: string | null; // For subsystem, parentId is systemId
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'all' | 'system' | 'subsystem';
  icon?: React.ReactNode;
  children?: TreeNode[];
  isOpen?: boolean;
  parentId?: string | null;
  displayName?: string; // e.g. System ID for system, Subsystem ID for subsystem
  subtitle?: string; // e.g. System Name / Subsystem Name
}

export interface TableRowData {
  system: string;
  systemName?: string;
  subsystem: string;
  subsystemName?: string;
  discipline: string;
  totalItems: number;
  completed: number;
  pending: number;
  punch: number;
  holdPoint: number;
  statusPercent: number;
}

export type ChartTab = 'Overview' | 'By Discipline' | 'By System';

export interface ModalDetailsContext {
  type: 'summary' | 'table';
  status: 'TOTAL' | 'DONE' | 'PENDING' | 'PUNCH' | 'HOLD' | 'OTHER'; // OTHER for remaining
  rowData?: TableRowData; // For table context
}

export type ModalDataType = 'items' | 'punch' | 'hold';

// Global PapaParse and XLSX types for window objects
declare global {
  interface Window {
    Papa: any;
    XLSX: any;
  }
}
