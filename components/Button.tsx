import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  as?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  as: Component = 'button',
  ...props 
}) => {
  const baseStyle = "px-6 py-3 font-bold rounded-xl transition-all active:translate-y-1 duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-black text-white border-2 border-black hover:bg-gray-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200 neo-shadow",
    secondary: "bg-white text-black border-2 border-black hover:bg-gray-50 dark:bg-black dark:text-white dark:border-white dark:hover:bg-gray-900 neo-shadow",
    outline: "bg-transparent text-black border-2 border-black hover:bg-gray-100 dark:text-white dark:border-white dark:hover:bg-gray-900"
  };

  return (
    <Component 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props as any}
    >
      {children}
    </Component>
  );
};