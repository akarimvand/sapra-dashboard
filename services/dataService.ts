
import { 
    RawDataItem, ProcessedData, SystemInfo, SubSystem, DisciplineStats, 
    AggregatedStats, SelectedView, TableRowData, DetailedItem, PunchItem, HoldPointItem 
} from '../types';
import { CSV_URL, ITEMS_CSV_URL, PUNCH_CSV_URL, HOLD_POINT_CSV_URL } from '../constants';

const parseCSV = async <T>(url: string, transformFn: (row: any) => T): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    window.Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        if (results.errors && results.errors.length > 0) {
          console.error(`Error parsing ${url}:`, results.errors);
          reject(new Error(`Failed to parse ${url}: ${results.errors[0].message}`));
          return;
        }
        try {
          const transformedData = results.data.map(transformFn);
          resolve(transformedData);
        } catch(e: any) {
            console.error(`Error transforming data from ${url}:`, e);
            reject(new Error(`Error transforming data from ${url}: ${e.message}`));
        }
      },
      error: (error: any) => {
        console.error(`Network or PapaParse error for ${url}:`, error);
        reject(new Error(`Failed to load or parse CSV from ${url}: ${error.message}`));
      },
    });
  });
};


export const loadMainData = async (): Promise<ProcessedData> => {
  const data = await parseCSV<RawDataItem>(CSV_URL, (row) => row as RawDataItem);
  
  const systemMap: { [key: string]: SystemInfo } = {};
  const subSystemMap: { [key: string]: SubSystem } = {};

  data.forEach(row => {
    if (!row.SD_System || !row.SD_Sub_System || !row.discipline) return;

    const systemId = row.SD_System.trim();
    const systemName = (row.SD_System_Name || 'Unknown System').trim();
    const subId = row.SD_Sub_System.trim();
    const subName = (row.SD_Subsystem_Name || 'Unknown Subsystem').trim();
    const discipline = row.discipline.trim();

    if (!systemMap[systemId]) {
      systemMap[systemId] = { id: systemId, name: systemName, subs: [] };
    }
    if (!systemMap[systemId].subs.find(s => s.id === subId)) {
      systemMap[systemId].subs.push({ id: subId, name: subName });
    }

    if (!subSystemMap[subId]) {
      subSystemMap[subId] = { id: subId, name: subName, systemId: systemId, title: `${subId} - ${subName}`, disciplines: {} };
    }
    
    const total = parseInt(row["TOTAL ITEM"]) || 0;
    const done = parseInt(row["TOTAL DONE"]) || 0;
    const pending = parseInt(row["TOTAL PENDING"]) || 0;
    
    subSystemMap[subId].disciplines[discipline] = {
      total: total,
      done: done,
      pending: pending,
      punch: parseInt(row["TOTAL NOT CLEAR PUNCH"]) || 0,
      hold: parseInt(row["TOTAL HOLD POINT"]) || 0,
      remaining: Math.max(0, total - done - pending)
    };
  });

  return { systemMap, subSystemMap, allRawData: data };
};

export const loadDetailedItemsData = async (): Promise<DetailedItem[]> => {
  return parseCSV<DetailedItem>(ITEMS_CSV_URL, item => ({
    subsystem: item.SD_Sub_System?.trim() || '',
    discipline: item.Discipline_Name?.trim() || '',
    tagNo: item.ITEM_Tag_NO?.trim() || '',
    typeCode: item.ITEM_Type_Code?.trim() || '',
    description: item.ITEM_Description?.trim() || '',
    status: item.ITEM_Status?.trim() || ''
  }));
};

export const loadPunchItemsData = async (): Promise<PunchItem[]> => {
  return parseCSV<PunchItem>(PUNCH_CSV_URL, item => ({
    subsystem: item.SD_SUB_SYSTEM?.trim() || '',
    discipline: item.Discipline_Name?.trim() || '',
    tagNo: item.ITEM_Tag_NO?.trim() || '',
    typeCode: item.ITEM_Type_Code?.trim() || '',
    punchCategory: item.PL_Punch_Category?.trim() || '',
    punchDescription: item.PL_Punch_Description?.trim() || ''
  }));
};

export const loadHoldPointItemsData = async (): Promise<HoldPointItem[]> => {
  return parseCSV<HoldPointItem>(HOLD_POINT_CSV_URL, item => ({
    subsystem: item.SD_SUB_SYSTEM?.trim() || '',
    discipline: item.Discipline_Name?.trim() || '',
    tagNo: item.ITEM_Tag_NO?.trim() || '',
    typeCode: item.ITEM_Type_Code?.trim() || '',
    hpPriority: item.HP_Priority?.trim() || '',
    hpDescription: item.HP_Description?.trim() || '',
    hpLocation: item.HP_Location?.trim() || ''
  }));
};


const emptyStats = (): AggregatedStats => ({ totalItems: 0, done: 0, pending: 0, punch: 0, hold: 0, remaining: 0 });

const aggregateSubSystemStats = (subSystemId: string, subSystemMap: { [key: string]: SubSystem }): AggregatedStats => {
  const subSystem = subSystemMap[subSystemId];
  if (!subSystem) return emptyStats();
  return Object.values(subSystem.disciplines).reduce((acc, discipline) => {
    acc.totalItems += discipline.total;
    acc.done += discipline.done;
    acc.pending += discipline.pending;
    acc.punch += discipline.punch;
    acc.hold += discipline.hold;
    return acc;
  }, emptyStats());
};

const aggregateSystemStats = (systemId: string, systemMap: { [key: string]: SystemInfo }, subSystemMap: { [key: string]: SubSystem }): AggregatedStats => {
  const system = systemMap[systemId];
  if (!system) return emptyStats();
  return system.subs.reduce((acc, subRef) => {
    const subSystemStats = aggregateSubSystemStats(subRef.id, subSystemMap);
    Object.keys(subSystemStats).forEach(key => acc[key as keyof AggregatedStats] += subSystemStats[key as keyof AggregatedStats]);
    return acc;
  }, emptyStats());
};

const aggregateAllStats = (systemMap: { [key: string]: SystemInfo }, subSystemMap: { [key: string]: SubSystem }): AggregatedStats => {
  return Object.keys(systemMap).reduce((acc, systemId) => {
    const systemStats = aggregateSystemStats(systemId, systemMap, subSystemMap);
    Object.keys(systemStats).forEach(key => acc[key as keyof AggregatedStats] += systemStats[key as keyof AggregatedStats]);
    return acc;
  }, emptyStats());
};

export const aggregateStatsForView = (view: SelectedView, systemMap: { [key: string]: SystemInfo }, subSystemMap: { [key: string]: SubSystem }): AggregatedStats => {
  let stats: AggregatedStats;
  if (view.type === 'all' || !view.id) {
    stats = aggregateAllStats(systemMap, subSystemMap);
  } else if (view.type === 'system') {
    stats = aggregateSystemStats(view.id, systemMap, subSystemMap);
  } else { // subsystem
    stats = aggregateSubSystemStats(view.id, subSystemMap);
  }
  stats.remaining = Math.max(0, stats.totalItems - stats.done - stats.pending);
  return stats;
};

export const generateTableDataForView = (
  view: SelectedView, 
  processedData: ProcessedData, 
  isEmptyView: boolean, // if current view has no items at its level of aggregation
  forExport: boolean = false
): TableRowData[] => {
  const { systemMap, subSystemMap, allRawData } = processedData;
  if (!forExport && isEmptyView && view.type !== 'all') return [];

  let relevantRawData: RawDataItem[] = [];
  if (view.type === 'all') {
    relevantRawData = allRawData;
  } else if (view.type === 'system' && view.id) {
    const system = systemMap[view.id];
    if (system) {
      const subIdsInSystem = new Set(system.subs.map(s => s.id));
      relevantRawData = allRawData.filter(row => subIdsInSystem.has(row.SD_Sub_System?.trim()));
    }
  } else if (view.type === 'subsystem' && view.id) {
    relevantRawData = allRawData.filter(row => row.SD_Sub_System?.trim() === view.id);
  }
  
  if (!forExport && relevantRawData.length === 0 && view.type !== 'all') return [];

  return relevantRawData.map(row => {
    const totalItems = parseInt(row["TOTAL ITEM"]) || 0;
    const completed = parseInt(row["TOTAL DONE"]) || 0;
    return {
      system: row.SD_System?.trim() || 'N/A', 
      systemName: (row.SD_System_Name || 'N/A').trim(),
      subsystem: row.SD_Sub_System?.trim() || 'N/A', 
      subsystemName: (row.SD_Subsystem_Name || 'N/A').trim(),
      discipline: row.discipline?.trim() || 'N/A', 
      totalItems, 
      completed,
      pending: parseInt(row["TOTAL PENDING"]) || 0,
      punch: parseInt(row["TOTAL NOT CLEAR PUNCH"]) || 0,
      holdPoint: parseInt(row["TOTAL HOLD POINT"]) || 0,
      statusPercent: totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0,
    };
  });
};
