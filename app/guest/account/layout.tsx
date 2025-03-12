'use client';

import React from 'react';

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Container for content */}
      <div className="max-w-screen-xl mx-auto">{children}</div>
    </div>
  );
};

export default AccountLayout;
