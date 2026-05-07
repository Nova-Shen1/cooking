import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-90 shadow-custom',
    secondary: 'bg-warmWhite text-gray-700 hover:bg-gray-100 shadow-custom',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-gray-500 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-custom',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      className={cn(
        'rounded-32 font-medium transition-all btn-active disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
