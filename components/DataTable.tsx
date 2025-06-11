
import React from 'react';
import { TableRowData } from '../types';

interface DataTableProps {
  data: TableRowData[];
  onCellClick?: (rowData: TableRowData, columnAccessor: keyof TableRowData) => void;
}

const columns: Array<{ header: string; accessor: keyof TableRowData; clickable?: boolean }> = [
  { header: 'System', accessor: 'system' },
  { header: 'Subsystem', accessor: 'subsystem' },
  { header: 'Discipline', accessor: 'discipline' },
  { header: 'Total Items', accessor: 'totalItems', clickable: true },
  { header: 'Completed', accessor: 'completed', clickable: true },
  { header: 'Pending', accessor: 'pending', clickable: true },
  { header: 'Punch', accessor: 'punch', clickable: true },
  { header: 'Hold Point', accessor: 'holdPoint', clickable: true },
  { header: 'Status', accessor: 'statusPercent', clickable: true },
];

const DataTable: React.FC<DataTableProps> = ({ data, onCellClick }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-2 sm:p-4 overflow-x-auto">
      <h5 className="text-lg font-semibold text-slate-700 mb-4 px-2 pt-2">Items Details</h5>
      {data.length === 0 ? (
         <p className="text-center text-slate-500 py-10 px-2">
            Please select a system or subsystem to view details, or no data matches the current filter.
        </p>
      ) : (
      <table className="w-full min-w-[800px] text-sm text-left text-slate-600">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
          <tr>
            {columns.map(col => (
              <th key={col.accessor} scope="col" className="px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="bg-white border-b hover:bg-slate-50 transition-colors duration-150">
              {columns.map(col => {
                let cellValue: React.ReactNode = row[col.accessor];
                if (col.accessor === 'statusPercent') {
                  const percent = row.statusPercent;
                  let badgeClass = 'bg-yellow-100 text-yellow-700';
                  if (percent > 80) badgeClass = 'bg-green-100 text-green-700';
                  else if (percent > 50) badgeClass = 'bg-sky-100 text-sky-700';
                  cellValue = <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badgeClass}`}>{percent}%</span>;
                } else if (col.accessor === 'subsystem') {
                  cellValue = `${row.subsystem} - ${row.subsystemName}`;
                } else if (col.accessor === 'system') {
                    cellValue = `${row.system} - ${row.systemName}`;
                } else if (typeof cellValue === 'number') {
                  cellValue = cellValue.toLocaleString();
                }

                return (
                  <td 
                    key={col.accessor} 
                    className={`px-4 py-3 ${col.clickable && onCellClick ? 'cursor-pointer hover:text-sky-600 hover:font-medium' : ''}`}
                    onClick={() => col.clickable && onCellClick?.(row, col.accessor)}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
};

export default DataTable;
