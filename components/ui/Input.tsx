"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground-muted pl-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`glass-input px-4 py-3 text-base w-full ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
