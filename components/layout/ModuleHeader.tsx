'use client';

import * as React from 'react';

interface ModuleHeaderProps {
  title: string;
  showDate?: boolean;
  actions?: React.ReactNode;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  showDate = true,
  actions,
}) => {
  const [dateStr, setDateStr] = React.useState('');

  React.useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    setDateStr(new Date().toLocaleDateString('en-US', options));
  }, []);

  return (
    <div className="w-full flex justify-between items-start pt-[15px] pb-[12px] px-2 md:px-4 border-b border-slate-200/60 shrink-0 gap-4 mb-6">
      <div className="flex flex-col items-start select-none">
        <h1 className="text-slate-950 text-3xl md:text-[32px] font-black tracking-tight font-sans leading-none">
          {title}
        </h1>
        {showDate && dateStr && (
          <span className="text-slate-900/80 text-[12px] font-semibold mt-1.5 font-sans tracking-tight">
            {dateStr}
          </span>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 md:gap-3 pt-1 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default ModuleHeader;
