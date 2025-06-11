
import React from 'react';
import { ResponsiveContainer } from 'recharts';
import { IconPieChartFill } from '../constants';

interface ChartContainerProps {
  title: string;
  children: React.ReactElement; // Changed from React.ReactNode
  dataCheck?: boolean | (() => boolean); // If false or returns false, show no data message
  height?: number;
  noDataMessage?: string;
  placeholderIcon?: JSX.Element;
  customPlaceholder?: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  dataCheck = true,
  height = 288, // h-72
  noDataMessage = "No data to display.",
  placeholderIcon = <IconPieChartFill className="w-16 h-16 text-slate-400" />,
  customPlaceholder
}) => {
  const hasData = typeof dataCheck === 'function' ? dataCheck() : dataCheck;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h6 className="text-sm font-medium text-slate-600 mb-3 text-center">{title}</h6>
      <div style={{ height: `${height}px` }} className="relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        ) : (
          customPlaceholder || (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-500">
              {placeholderIcon}
              <p className="mt-2 text-sm">{noDataMessage}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChartContainer;
