'use client';

import * as React from 'react';

export const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center text-zinc-500 font-mono text-xs">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <span>Hydrating LOAH...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
export default ClientOnly;
