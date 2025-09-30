// frontend/src/components/ui/Input.tsx
import React, { useId } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}, ref) => {
  // CHANGE: Replaced Math.random() with useId() to fix hydration mismatch
  // useId() generates stable, unique IDs that are consistent between server and client
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">{leftIcon}</div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2',
            {
              'pl-10': leftIcon,
              'pr-10': rightIcon,
              'border-red-300 focus:border-red-500 focus:ring-red-500': error,
            },
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="h-5 w-5 text-gray-400">{rightIcon}</div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 