
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts'; // Removed DoughnutChart, Doughnut
import Sidebar from './components/Sidebar';
import SummaryCard from './components/SummaryCard';
import ChartContainer from './components/ChartContainer';
import DataTable from './components/DataTable';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import {
  ProcessedData, SelectedView, AggregatedStats, TableRowData, ChartTab,
  DetailedItem, PunchItem, HoldPointItem, ModalDetailsContext, ModalDataType,
  DisciplineStats, SystemInfo, SubSystem
} from './types';
import {
  loadMainData, loadDetailedItemsData, loadPunchItemsData, loadHoldPointItemsData,
  aggregateStatsForView, generateTableDataForView
} from './services/dataService';
import {
  ACCENT_COLOR, CHART_COLORS, FORM_CARD_DESCRIPTIONS,
  IconCheckCircle, IconClock, IconArrowRepeat, IconExclamationTriangle,
  IconFileEarmarkText, IconFileEarmarkCheck, IconFileEarmarkMedical, IconFileEarmarkSpreadsheet,
  IconBoxSeam, IconFileEarmarkExcel, IconMenu, IconPieChartFill
} from './constants';

// Helper function to export to Excel
const exportToExcel = (data: any[], fileName: string, sheetName: string) => {
  if (!window.XLSX) {
    alert("Excel library not loaded.");
    return;
  }
  try {
    const worksheet = window.XLSX.utils.json_to_sheet(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    window.XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("An error occurred while exporting to Excel.");
  }
};


const App: React.FC = () => {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [detailedItems, setDetailedItems] = useState<DetailedItem[]>([]);
  const [punchItems, setPunchItems] = useState<PunchItem[]>([]);
  const [holdPointItems, setHoldPointItems] = useState<HoldPointItem[]>([]);

  const [selectedView, setSelectedView] = useState<SelectedView>({ type: 'all', id: null, name: 'All Systems' });
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null);
  const [tableData, setTableData] = useState<TableRowData[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default on mobile
  const [activeChartTab, setActiveChartTab] = useState<ChartTab>('Overview');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Item Details');
  const [modalItems, setModalItems] = useState<Array<DetailedItem | PunchItem | HoldPointItem>>([]);
  const [currentModalDataType, setCurrentModalDataType] = useState<ModalDataType>('items');

  useEffect(() => {
    const initLoad = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const mainData = await loadMainData();
        setProcessedData(mainData);
        // Pre-load detailed data in background
        loadDetailedItemsData().then(setDetailedItems).catch(e => console.warn("Failed to load detailed items:", e));
        loadPunchItemsData().then(setPunchItems).catch(e => console.warn("Failed to load punch items:", e));
        loadHoldPointItemsData().then(setHoldPointItems).catch(e => console.warn("Failed to load hold point items:", e));

      } catch (err: any) {
        setError(err.message || 'Failed to load initial data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    initLoad();
  }, []);

  useEffect(() => {
    if (processedData) {
      const stats = aggregateStatsForView(selectedView, processedData.systemMap, processedData.subSystemMap);
      setAggregatedStats(stats);
      const dataForTable = generateTableDataForView(selectedView, processedData, stats.totalItems === 0 && selectedView.type !== 'all');
      setTableData(dataForTable);
    }
  }, [processedData, selectedView]);

  const handleViewChange = useCallback((view: SelectedView) => {
    setSelectedView(view);
  }, []);

  const handleSidebarToggle = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const dashboardTitleText = useMemo(() => {
    if (!processedData) return 'Dashboard';
    if (selectedView.type === 'system' && selectedView.id) {
      const systemName = processedData.systemMap[selectedView.id]?.name || selectedView.name;
      return `System: ${selectedView.id} - ${systemName}`;
    } else if (selectedView.type === 'subsystem' && selectedView.id && selectedView.parentId) {
      const systemName = processedData.systemMap[selectedView.parentId]?.name || selectedView.parentId;
      const subsystemName = processedData.subSystemMap[selectedView.id]?.name || selectedView.name;
      return (
        <>
            <span className="block sm:inline">System: {selectedView.parentId} - {systemName}</span>
            <span className="hidden sm:inline mx-1">/</span>
            <span className="block sm:inline">Subsystem: {selectedView.id} - ${subsystemName}</span>
        </>
      );
    }
    return 'Dashboard';
  }, [selectedView, processedData]);

  const handleExportMainTable = () => {
    if (!processedData) return;
    const dataToExportRaw = generateTableDataForView(selectedView, processedData, false, true);
    if (dataToExportRaw.length === 0) {
      alert("No data available to export for the current selection.");
      return;
    }
    const dataToExport = dataToExportRaw.map(row => ({
      System: row.system, SystemName: row.systemName,
      SubSystem: row.subsystem, SubSystemName: row.subsystemName,
      Discipline: row.discipline, TotalItems: row.totalItems,
      Completed: row.completed, Pending: row.pending,
      Punch: row.punch, HoldPoint: row.holdPoint,
      ProgressPercent: `${row.statusPercent}%`
    }));
    const currentDate = new Date().toISOString().split('T')[0];
    let viewName = "AllSystems";
    if (selectedView.type === 'system' && selectedView.id) viewName = `System_${selectedView.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    else if (selectedView.type === 'subsystem' && selectedView.id) viewName = `SubSystem_${selectedView.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const fileName = `SAPRA_Report_${viewName}_${currentDate}.xlsx`;
    exportToExcel(dataToExport, fileName, 'SAPRA Report');
  };

  const handleExportModalDetails = () => {
    if (modalItems.length === 0) {
      alert("No data in the modal to export.");
      return;
    }
    let dataToExport: any[] = [];
    let sheetName = 'Details';

    if (currentModalDataType === 'items') {
      dataToExport = modalItems.map((item, index) => ({
        '#': index + 1, Subsystem: (item as DetailedItem).subsystem, Discipline: (item as DetailedItem).discipline,
        TagNo: (item as DetailedItem).tagNo, TypeCode: (item as DetailedItem).typeCode,
        Description: (item as DetailedItem).description, Status: (item as DetailedItem).status,
      }));
      sheetName = 'Item_Details';
    } else if (currentModalDataType === 'punch') {
      dataToExport = modalItems.map((item, index) => ({
        '#': index + 1, Subsystem: (item as PunchItem).subsystem, Discipline: (item as PunchItem).discipline,
        TagNo: (item as PunchItem).tagNo, TypeCode: (item as PunchItem).typeCode || 'N/A',
        PunchCategory: (item as PunchItem).punchCategory, PunchDescription: (item as PunchItem).punchDescription,
      }));
      sheetName = 'Punch_Details';
    } else if (currentModalDataType === 'hold') {
      dataToExport = modalItems.map((item, index) => ({
        '#': index + 1, Subsystem: (item as HoldPointItem).subsystem, Discipline: (item as HoldPointItem).discipline,
        TagNo: (item as HoldPointItem).tagNo, TypeCode: (item as HoldPointItem).typeCode || 'N/A',
        HPPriority: (item as HoldPointItem).hpPriority || 'N/A', HPDescription: (item as HoldPointItem).hpDescription || 'N/A',
        HPLocation: (item as HoldPointItem).hpLocation || 'N/A',
      }));
      sheetName = 'Hold_Point_Details';
    }
    const currentDate = new Date().toISOString().split('T')[0];
    const fileName = `SAPRA_${sheetName}_${currentDate}.xlsx`;
    exportToExcel(dataToExport, fileName, sheetName);
  };
  
  const openDetailsModal = useCallback((context: ModalDetailsContext, dataType: ModalDataType) => {
    if (!processedData) return;

    let itemsForModal: Array<DetailedItem | PunchItem | HoldPointItem> = [];
    let newModalTitle = 'Details'; 

    // Overloaded function signatures for type safety
    function filterAndPrepareModalData(
      initialItems: DetailedItem[],
      itemSubsystemField: keyof DetailedItem,
      isTableContext: boolean,
      currentContext: ModalDetailsContext,
      currentSelectedView: SelectedView,
      currentProcessedData: ProcessedData,
      itemDisciplineField: keyof DetailedItem | undefined,
      itemStatusField: keyof DetailedItem // Must be present for DetailedItem
    ): { filteredData: DetailedItem[], title: string };

    function filterAndPrepareModalData<T extends PunchItem | HoldPointItem>(
      initialItems: T[],
      itemSubsystemField: keyof T,
      isTableContext: boolean,
      currentContext: ModalDetailsContext,
      currentSelectedView: SelectedView,
      currentProcessedData: ProcessedData,
      itemDisciplineField?: keyof T
      // No itemStatusField for PunchItem or HoldPointItem in this overload's explicit params
    ): { filteredData: T[], title: string };

    // Implementation
    function filterAndPrepareModalData<T extends DetailedItem | PunchItem | HoldPointItem>(
      initialItems: T[],
      itemSubsystemField: keyof T,
      isTableContext: boolean,
      currentContext: ModalDetailsContext,
      currentSelectedView: SelectedView,
      currentProcessedData: ProcessedData,
      itemDisciplineField?: keyof T,
      itemStatusField?: keyof DetailedItem // Optional, only used if T is DetailedItem and provided by caller for DetailedItem overload
    ): { filteredData: T[], title: string } {
      let result: T[] = initialItems;
      let titleSegment = 'Details'; 

      if (isTableContext && currentContext.rowData && itemDisciplineField) {
        const clickedSubsystem = currentContext.rowData.subsystem.toLowerCase();
        const clickedDiscipline = currentContext.rowData.discipline.toLowerCase();
        result = result.filter(item => {
            const disciplineAccessor = itemDisciplineField as keyof T; 
            return (item[itemSubsystemField] as string)?.toLowerCase() === clickedSubsystem &&
                   (item[disciplineAccessor] as string)?.toLowerCase() === clickedDiscipline;
        });
        titleSegment = `${currentContext.status} items in ${currentContext.rowData.subsystem} / ${currentContext.rowData.discipline}`;
      } else if (!isTableContext) { 
        if (currentSelectedView.type === 'system' && currentSelectedView.id) {
            const subSystemIds = currentProcessedData.systemMap[currentSelectedView.id]?.subs.map(sub => sub.id.toLowerCase()) || [];
            result = result.filter(item => {
                const itemSub = (item[itemSubsystemField] as string)?.toLowerCase();
                return itemSub && subSystemIds.includes(itemSub);
            });
            titleSegment = `${currentContext.status} items in System: ${currentSelectedView.name}`;
        } else if (currentSelectedView.type === 'subsystem' && currentSelectedView.id) {
            result = result.filter(item => (item[itemSubsystemField] as string)?.toLowerCase() === currentSelectedView.id!.toLowerCase());
            titleSegment = `${currentContext.status} items in Subsystem: ${currentSelectedView.name}`;
        } else { 
            titleSegment = `${currentContext.status} items (All Systems)`;
        }
      }

      if (itemStatusField && currentContext.status !== 'TOTAL') {
          let detailedResult = result as DetailedItem[]; 
          if (currentContext.status === 'OTHER') { 
              detailedResult = detailedResult.filter(item =>
                  !item[itemStatusField] || (item[itemStatusField]!.toLowerCase() !== 'done' && item[itemStatusField]!.toLowerCase() !== 'pending')
              );
          } else { 
              detailedResult = detailedResult.filter(item => item[itemStatusField]?.toLowerCase() === currentContext.status.toLowerCase());
          }
          result = detailedResult as T[]; 
      }
      return { filteredData: result, title: titleSegment };
    }

    if (dataType === 'items') {
      let prepResult;
      if (context.type === 'summary') {
        prepResult = filterAndPrepareModalData(
            detailedItems, 'subsystem', false, context, selectedView, processedData, undefined, 'status'
        );
      } else { // context.type === 'table'
        prepResult = filterAndPrepareModalData(
            detailedItems, 'subsystem', true, context, selectedView, processedData, 'discipline', 'status'
        );
      }
      itemsForModal = prepResult.filteredData;
      newModalTitle = prepResult.title;
    } else if (dataType === 'punch') {
      let prepResult;
      if (context.type === 'summary') {
        prepResult = filterAndPrepareModalData(
            punchItems, 'subsystem', false, context, selectedView, processedData, undefined
        );
      } else { // context.type === 'table'
        prepResult = filterAndPrepareModalData(
            punchItems, 'subsystem', true, context, selectedView, processedData, 'discipline'
        );
      }
      itemsForModal = prepResult.filteredData;
      newModalTitle = prepResult.title;
    } else if (dataType === 'hold') {
      let prepResult;
      if (context.type === 'summary') {
        prepResult = filterAndPrepareModalData(
            holdPointItems, 'subsystem', false, context, selectedView, processedData, undefined
        );
      } else { // context.type === 'table'
        prepResult = filterAndPrepareModalData(
            holdPointItems, 'subsystem', true, context, selectedView, processedData, 'discipline'
        );
      }
      itemsForModal = prepResult.filteredData;
      newModalTitle = prepResult.title;
    }
    
    setModalItems(itemsForModal);
    setModalTitle(newModalTitle);
    setCurrentModalDataType(dataType);
    setIsDetailsModalOpen(true);
  }, [processedData, selectedView, detailedItems, punchItems, holdPointItems]);

  const handleSummaryCardClick = (status: ModalDetailsContext['status'], dataType: ModalDataType) => {
    openDetailsModal({ type: 'summary', status }, dataType);
  };
  
  const handleTableCellClick = (rowData: TableRowData, columnAccessor: keyof TableRowData) => {
    let status: ModalDetailsContext['status'] | null = null;
    let dataType: ModalDataType = 'items';

    switch(columnAccessor) {
        case 'totalItems': status = 'TOTAL'; dataType = 'items'; break;
        case 'completed': status = 'DONE'; dataType = 'items'; break;
        case 'pending': status = 'PENDING'; dataType = 'items'; break;
        case 'punch': status = 'PUNCH'; dataType = 'punch'; break;
        case 'holdPoint': status = 'HOLD'; dataType = 'hold'; break;
        case 'statusPercent': status = 'OTHER'; dataType = 'items'; break; // 'OTHER' implies remaining for items
    }

    if (status) {
        openDetailsModal({ type: 'table', rowData, status }, dataType);
    }
  };


  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-gray-100 z-50"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded-md m-4">{error}</div>;
  }

  if (!processedData || !aggregatedStats) {
    return <div className="p-4 text-center text-slate-600">No data loaded or processed yet.</div>;
  }
  
  const overviewChartData = [
    { name: 'Completed', value: aggregatedStats.done, fill: CHART_COLORS.done },
    { name: 'Pending', value: aggregatedStats.pending, fill: CHART_COLORS.pending },
    { name: 'Remaining', value: aggregatedStats.remaining, fill: CHART_COLORS.remaining },
  ].filter(d => d.value > 0);

  const issuesChartData = [
    { name: 'Punch', value: aggregatedStats.punch, fill: CHART_COLORS.punch },
    { name: 'Hold Point', value: aggregatedStats.hold, fill: CHART_COLORS.hold },
  ].filter(d => d.value > 0);

  const formCards = [
    { title: 'FORM A', count: 2, icon: <IconFileEarmarkText />, gradientClass: `from-sky-500 to-blue-600` },
    { title: 'FORM B', count: 0, icon: <IconFileEarmarkCheck />, gradientClass: `from-emerald-500 to-green-600` },
    { title: 'FORM C', count: 0, icon: <IconFileEarmarkMedical />, gradientClass: `from-amber-500 to-orange-600` },
    { title: 'FORM D', count: 0, icon: <IconFileEarmarkSpreadsheet />, gradientClass: `from-purple-500 to-indigo-600` },
  ];

  const renderDisciplineCharts = () => {
    if (selectedView.type !== 'subsystem' || !selectedView.id || !processedData.subSystemMap[selectedView.id]) {
      return <div className="col-span-full text-center py-10 text-slate-500"><IconPieChartFill className="w-16 h-16 text-slate-400 mx-auto mb-2" /><p>Select a subsystem to view discipline details.</p></div>;
    }
    const subSystem = processedData.subSystemMap[selectedView.id];
    const disciplines = Object.entries(subSystem.disciplines);
    if (disciplines.length === 0) {
      return <div className="col-span-full text-center py-10 text-slate-500"><IconPieChartFill className="w-16 h-16 text-slate-400 mx-auto mb-2" /><p>No discipline data for this subsystem.</p></div>;
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {disciplines.map(([name, data]) => {
          const chartData = [
            { name: 'Completed', value: data.done, fill: CHART_COLORS.done },
            { name: 'Pending', value: data.pending, fill: CHART_COLORS.pending },
            { name: 'Remaining', value: data.remaining, fill: CHART_COLORS.remaining },
          ].filter(d => d.value > 0);
          return (
            <ChartContainer key={name} title={`${name} (${data.total.toLocaleString()} items)`} dataCheck={data.total > 0} height={200}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(value: number, name: string, entry: any) => [`${value.toLocaleString()} (${(entry.payload.percent * 100).toFixed(1)}%)`, name]}/>
                 <Legend wrapperStyle={{fontSize: "10px", bottom: -5}} iconSize={8} />
              </PieChart>
            </ChartContainer>
          );
        })}
      </div>
    );
  };
  
  const renderSystemSubsystemCharts = () => {
        let itemsToDisplay: Array<{ id: string; name: string; data: AggregatedStats }> = [];
        if (selectedView.type === 'all') {
            itemsToDisplay = Object.values(processedData.systemMap).map(system => ({
                id: system.id,
                name: `${system.id} - ${system.name}`,
                data: aggregateStatsForView({ type: 'system', id: system.id, name: system.name }, processedData.systemMap, processedData.subSystemMap)
            }));
        } else if (selectedView.type === 'system' && selectedView.id) {
            const system = processedData.systemMap[selectedView.id];
            if (system) {
                itemsToDisplay = system.subs.map(subRef => {
                    const subSystem = processedData.subSystemMap[subRef.id];
                    return {
                        id: subRef.id,
                        name: `${subRef.id} - ${subSystem?.name || 'N/A'}`,
                        data: aggregateStatsForView({type: 'subsystem', id: subRef.id, name: subRef.name, parentId: system.id}, processedData.systemMap, processedData.subSystemMap)
                    };
                });
            }
        } else if (selectedView.type === 'subsystem' && selectedView.id) {
            const subSystem = processedData.subSystemMap[selectedView.id];
            if (subSystem) {
                itemsToDisplay = [{
                    id: subSystem.id, name: `${subSystem.id} - ${subSystem.name}`,
                    data: aggregateStatsForView(selectedView, processedData.systemMap, processedData.subSystemMap)
                }];
            }
        }
        itemsToDisplay = itemsToDisplay.filter(item => item.data.totalItems > 0);

        if (itemsToDisplay.length === 0) {
            return <div className="col-span-full text-center py-10 text-slate-500"><IconPieChartFill className="w-16 h-16 text-slate-400 mx-auto mb-2" /><p>No systems or subsystems with data to display for this view.</p></div>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {itemsToDisplay.map(item => {
                    const chartData = [
                        { name: 'Completed', value: item.data.done, fill: CHART_COLORS.done },
                        { name: 'Pending', value: item.data.pending, fill: CHART_COLORS.pending },
                        { name: 'Remaining', value: item.data.remaining, fill: CHART_COLORS.remaining },
                    ].filter(d => d.value > 0);
                    return (
                        <ChartContainer key={item.id} title={`${item.name} (${item.data.totalItems.toLocaleString()} items)`} dataCheck={item.data.totalItems > 0} height={200}>
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Pie>
                                <Tooltip formatter={(value: number, name: string, entry: any) => [`${value.toLocaleString()} (${(entry.payload.percent * 100).toFixed(1)}%)`, name]}/>
                                 <Legend wrapperStyle={{fontSize: "10px", bottom: -5}} iconSize={8} />
                            </PieChart>
                        </ChartContainer>
                    );
                })}
            </div>
        );
    };


  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        isOpen={isSidebarOpen}
        processedData={processedData}
        selectedView={selectedView}
        onViewChange={handleViewChange}
        onToggle={handleSidebarToggle}
      />
      {isSidebarOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={handleSidebarToggle}></div>}

      <div className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        <header className="sticky top-0 bg-slate-800 text-white shadow-md z-20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button onClick={handleSidebarToggle} className="text-white p-2 rounded-md hover:bg-slate-700 lg:hidden mr-2">
                  <IconMenu className="w-6 h-6" />
                </button>
                <h2 className="text-base sm:text-xl font-semibold truncate" title={typeof dashboardTitleText === 'string' ? dashboardTitleText : undefined}>
                  {dashboardTitleText}
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                    onClick={handleExportMainTable}
                    className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-medium py-1.5 px-2 sm:px-3 rounded-md shadow-sm transition-colors duration-150"
                >
                  <IconFileEarmarkExcel className="w-4 h-4 mr-1 sm:mr-1.5" /> Export Excel
                </button>
                <div 
                  className="flex items-center bg-sky-500 text-white text-xs sm:text-sm font-medium py-1.5 px-2 sm:px-3 rounded-md shadow-sm cursor-pointer hover:bg-sky-600 transition-colors duration-150"
                  onClick={() => openDetailsModal({ type: 'summary', status: 'TOTAL' }, 'items')}
                >
                  <IconBoxSeam className="w-4 h-4 mr-1 sm:mr-1.5" /> 
                  <span>{aggregatedStats.totalItems.toLocaleString()} items</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Row 1: FORM A-D Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {formCards.map(card => (
              <SummaryCard
                key={card.title}
                title={card.title}
                count={card.count}
                icon={card.icon}
                description={FORM_CARD_DESCRIPTIONS[card.title as keyof typeof FORM_CARD_DESCRIPTIONS]}
                isGradient
                gradientClass={card.gradientClass}
              />
            ))}
          </div>

          {/* Row 2: Original Summary Cards + Issues Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <SummaryCard title="Completed" count={aggregatedStats.done} icon={<IconCheckCircle />} progress={(aggregatedStats.totalItems > 0 ? (aggregatedStats.done / aggregatedStats.totalItems) * 100 : 0)} description={`${((aggregatedStats.totalItems > 0 ? (aggregatedStats.done / aggregatedStats.totalItems) * 100 : 0)).toFixed(0)}% of total`} baseColorClass="green" onClick={() => handleSummaryCardClick('DONE', 'items')} />
            <SummaryCard title="Pending" count={aggregatedStats.pending} icon={<IconClock />} progress={(aggregatedStats.totalItems > 0 ? (aggregatedStats.pending / aggregatedStats.totalItems) * 100 : 0)} description={`${((aggregatedStats.totalItems > 0 ? (aggregatedStats.pending / aggregatedStats.totalItems) * 100 : 0)).toFixed(0)}% of total`} baseColorClass="yellow" onClick={() => handleSummaryCardClick('PENDING', 'items')} />
            <SummaryCard title="Remaining" count={aggregatedStats.remaining} icon={<IconArrowRepeat />} progress={(aggregatedStats.totalItems > 0 ? (aggregatedStats.remaining / aggregatedStats.totalItems) * 100 : 0)} description={`${((aggregatedStats.totalItems > 0 ? (aggregatedStats.remaining / aggregatedStats.totalItems) * 100 : 0)).toFixed(0)}% of total`} baseColorClass={ACCENT_COLOR} onClick={() => handleSummaryCardClick('OTHER', 'items')} />
            
            {/* Issues Card */}
            <div className="bg-white shadow-lg rounded-xl p-5 flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start mb-2">
                    <h6 className="font-medium text-slate-500 text-sm">Issues</h6>
                    <span className="p-2 rounded-lg bg-red-100 text-red-500">
                        <IconExclamationTriangle className="w-6 h-6" />
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-1">
                    <div className="cursor-pointer hover:opacity-80" onClick={() => handleSummaryCardClick('PUNCH', 'punch')}>
                        <p className="text-xs text-slate-500 mb-0.5">Punch</p>
                        <h4 className="text-xl font-bold text-red-600">{aggregatedStats.punch.toLocaleString()}</h4>
                    </div>
                    <div className="cursor-pointer hover:opacity-80" onClick={() => handleSummaryCardClick('HOLD', 'hold')}>
                        <p className="text-xs text-slate-500 mb-0.5">Hold Point</p>
                        <h4 className="text-xl font-bold text-purple-600">{aggregatedStats.hold.toLocaleString()}</h4>
                    </div>
                </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="bg-white shadow-lg rounded-xl p-2 sm:p-4">
            <div className="border-b border-slate-200 mb-4">
              <nav className="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
                {(['Overview', 'By Discipline', 'By System'] as ChartTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveChartTab(tab)}
                    className={`whitespace-nowrap py-3 px-1 sm:px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-150
                                ${activeChartTab === tab ? `border-${ACCENT_COLOR}-500 text-${ACCENT_COLOR}-600` : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            
            {activeChartTab === 'Overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <ChartContainer title="General Status" dataCheck={overviewChartData.length > 0 && aggregatedStats.totalItems > 0}>
                  <PieChart>
                    <Pie data={overviewChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {overviewChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string, entry: any) => [`${value.toLocaleString()} (${(entry.payload.percent * 100).toFixed(1)}%)`, name]}/>
                    <Legend />
                  </PieChart>
                </ChartContainer>
                <ChartContainer title="Issues Distribution" dataCheck={issuesChartData.length > 0 && (aggregatedStats.punch + aggregatedStats.hold > 0)}>
                  <PieChart>
                    <Pie data={issuesChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {issuesChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string, entry: any) => [`${value.toLocaleString()} (${(entry.payload.percent * 100).toFixed(1)}%)`, name]}/>
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </div>
            )}
            {activeChartTab === 'By Discipline' && renderDisciplineCharts()}
            {activeChartTab === 'By System' && renderSystemSubsystemCharts()}
          </div>
          
          {/* Data Table */}
          <DataTable data={tableData} onCellClick={handleTableCellClick} />
        </main>
      </div>
      
      {/* Item Details Modal */}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)} 
        title={modalTitle}
        size="4xl"
        footerContent={
            <>
                <button 
                    type="button" 
                    className="flex items-center text-white bg-emerald-500 hover:bg-emerald-600 focus:ring-4 focus:outline-none focus:ring-emerald-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
                    onClick={handleExportModalDetails}
                >
                   <IconFileEarmarkExcel className="w-4 h-4 mr-2" /> Export Visible
                </button>
                <button 
                    type="button" 
                    className="ms-auto text-slate-600 bg-white hover:bg-slate-100 focus:ring-4 focus:outline-none focus:ring-slate-300 rounded-lg border border-slate-200 text-sm font-medium px-4 py-2 hover:text-slate-900 focus:z-10"
                    onClick={() => setIsDetailsModalOpen(false)}
                >
                    Close
                </button>
            </>
        }
      >
        {modalItems.length === 0 ? (
            <p className="text-center text-slate-500 py-4">No matching items found.</p>
        ) : (
        <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                    <tr>
                        <th scope="col" className="px-3 py-2">#</th>
                        <th scope="col" className="px-3 py-2">Subsystem</th>
                        <th scope="col" className="px-3 py-2">Discipline</th>
                        <th scope="col" className="px-3 py-2">Tag No</th>
                        <th scope="col" className="px-3 py-2">Type</th>
                        {currentModalDataType === 'items' && <th scope="col" className="px-3 py-2">Description</th>}
                        {currentModalDataType === 'items' && <th scope="col" className="px-3 py-2">Status</th>}
                        {currentModalDataType === 'punch' && <th scope="col" className="px-3 py-2">Category</th>}
                        {currentModalDataType === 'punch' && <th scope="col" className="px-3 py-2">Description</th>}
                        {currentModalDataType === 'hold' && <th scope="col" className="px-3 py-2">HP Priority</th>}
                        {currentModalDataType === 'hold' && <th scope="col" className="px-3 py-2">HP Description</th>}
                        {currentModalDataType === 'hold' && <th scope="col" className="px-3 py-2">HP Location</th>}
                    </tr>
                </thead>
                <tbody>
                    {modalItems.map((item, index) => (
                        <tr key={index} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-3 py-2 font-medium text-slate-900">{index + 1}</td>
                            <td className="px-3 py-2">{(item as DetailedItem | PunchItem | HoldPointItem).subsystem}</td>
                            <td className="px-3 py-2">{(item as DetailedItem | PunchItem | HoldPointItem).discipline}</td>
                            <td className="px-3 py-2">{(item as DetailedItem | PunchItem | HoldPointItem).tagNo}</td>
                            <td className="px-3 py-2">{(item as DetailedItem | PunchItem | HoldPointItem).typeCode}</td>
                            {currentModalDataType === 'items' && <td className="px-3 py-2">{(item as DetailedItem).description}</td>}
                            {currentModalDataType === 'items' && <td className="px-3 py-2">{(item as DetailedItem).status}</td>}
                            {currentModalDataType === 'punch' && <td className="px-3 py-2">{(item as PunchItem).punchCategory}</td>}
                            {currentModalDataType === 'punch' && <td className="px-3 py-2">{(item as PunchItem).punchDescription}</td>}
                            {currentModalDataType === 'hold' && <td className="px-3 py-2">{(item as HoldPointItem).hpPriority}</td>}
                            {currentModalDataType === 'hold' && <td className="px-3 py-2">{(item as HoldPointItem).hpDescription}</td>}
                            {currentModalDataType === 'hold' && <td className="px-3 py-2">{(item as HoldPointItem).hpLocation}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        )}
      </Modal>
    </div>
  );
};

export default App;
