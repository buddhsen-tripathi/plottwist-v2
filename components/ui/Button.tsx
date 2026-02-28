"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "gold" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer select-none";

    const variants: Record<string, string> = {
      default: "glass-button",
      gold: "glass-button-gold",
      ghost: "bg-transparent border border-transparent hover:bg-white/5 rounded-xl",
      destructive: "glass-button border-red-500/30 text-red-400 hover:bg-red-500/10",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-5 py-2.5 text-base rounded-xl",
      lg: "px-8 py-3.5 text-lg rounded-xl",
    };

    const disabledClass = disabled ? "opacity-40 pointer-events-none" : "";

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${disabledClass} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
