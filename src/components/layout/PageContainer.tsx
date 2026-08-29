import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'default' | 'full' | 'narrow';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'default',
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'full':
        return 'w-full';
      case 'narrow':
        return 'max-w-4xl mx-auto';
      default:
        return 'max-w-7xl mx-auto';
    }
  };

  return (
    <div className={`p-4 md:p-6 lg:p-8 space-y-6 ${getMaxWidthClass()} ${className}`}>
      {children}
    </div>
  );
};
