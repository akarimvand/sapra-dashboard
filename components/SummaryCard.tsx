
import React from 'react';

interface SummaryCardProps {
  title: string;
  count: string | number;
  icon: React.ReactNode;
  description?: string;
  progress?: number; // 0-100
  baseColorClass?: string; // e.g. 'bg-green-500' for progress bar, 'text-green-600' for count
  iconBgClass?: string; // e.g. 'bg-green-100'
  isGradient?: boolean;
  gradientClass?: string; // e.g. 'from-blue-500 to-sky-500'
  onClick?: () => void;
  titleSmall?: string; // Smaller title like Punch/Hold
  countSmallColorClass?: string; // Color for small count
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title, count, icon, description, progress,
  baseColorClass = 'sky', iconBgClass,
  isGradient = false, gradientClass = '',
  onClick, titleSmall, countSmallColorClass
}) => {
  const countToShow = typeof count === 'number' ? count.toLocaleString() : count;
  
  const cardClasses = `
    shadow-lg rounded-xl p-5 flex flex-col justify-between min-h-[160px] transition-all duration-300 ease-out cursor-pointer
    hover:shadow-2xl hover:-translate-y-1.5
    ${isGradient ? `text-white ${gradientClass} bg-gradient-to-br` : 'bg-white text-slate-700'}
  `;

  const titleColor = isGradient ? 'text-white/90' : 'text-slate-500';
  const countColor = isGradient ? 'text-white' : `text-${baseColorClass}-600`;
  const iconWrapperBg = isGradient ? 'bg-white/20' : iconBgClass || `bg-${baseColorClass}-100`;
  const iconColor = isGradient ? 'text-white' : `text-${baseColorClass}-500`;
  
  return (
    <section className={cardClasses} onClick={onClick} role="button" tabIndex={onClick ? 0 : -1} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <h6 className={`font-medium ${titleColor} ${isGradient ? 'text-lg' : 'text-sm'}`}>{title}</h6>
          <span className={`p-2 rounded-lg ${iconWrapperBg} ${iconColor}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-6 h-6" }) : icon}
          </span>
        </div>
        {titleSmall ? (
          <div className="grid grid-cols-2 gap-2 mt-1">
             <div>
                <p className={`text-xs ${isGradient ? 'text-white/80' : 'text-slate-500'} mb-0.5`}>{titleSmall}</p>
                <h4 className={`font-semibold ${countSmallColorClass || (isGradient ? 'text-white' : `text-${baseColorClass}-600`)}`}>{countToShow}</h4>
             </div>
             {description && ( // Second column for description if exists
                 <div>
                    <p className={`text-xs ${isGradient ? 'text-white/80' : 'text-slate-500'} mb-0.5`}>Info</p>
                    <h4 className={`font-semibold ${countSmallColorClass || (isGradient ? 'text-white' : `text-${baseColorClass}-600`)}`}>{description}</h4>
                 </div>
             )}
          </div>
        ) : (
          <h3 className={`text-3xl font-bold mb-1 ${countColor}`}>{countToShow}</h3>
        )}
      </div>
      
      {progress !== undefined && !isGradient && (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div className={`bg-${baseColorClass}-500 h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
          </div>
          {description && <p className="text-xs text-slate-500 mt-1.5 mb-0">{description}</p>}
        </div>
      )}
       {description && isGradient && !titleSmall && (
         <small className="block mt-2 text-white/80 text-xs">{description}</small>
      )}
    </section>
  );
};

export default SummaryCard;
