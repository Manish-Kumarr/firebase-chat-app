import React from 'react';

const Icon = ({ size, icon, onClick, className }) => {
  const c =
    size === 'small'
      ? 'w-8 h-8'
      : size === 'medium'
      ? 'w-9 h-9'
      : size === 'large'
      ? 'w-10 h-10'
      : size === 'x-large'
      ? 'w-14 h-14'
      : 'w-24 h-24';

  return (
    <div
      className={`${c} rounded-full flex items-center justify-center hover:bg-c1 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {icon && icon}
    </div>
  );
};

export default Icon;
