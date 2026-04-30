import React from 'react';

/**
 * Button — RoomieLink's primary interactive element.
 *
 * Variants:
 *  primary  → coral gradient  (main CTAs)
 *  violet   → violet gradient (secondary CTAs)
 *  outline  → bordered        (ghost actions)
 *  ghost    → text only       (subtle actions)
 *  danger   → red tones       (destructive)
 *
 * Sizes: sm | md | lg
 */
const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  fullWidth = false,
  onClick,
  disabled  = false,
  type      = 'button',
  className = '',
  icon,           // optional leading icon element
  loading = false, // shows spinner when true
}) => {

  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-heading font-bold rounded-2xl',
    'transition-all duration-200 ease-out',
    'focus:outline-none focus-visible:ring-3 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'active:scale-95',
  ].join(' ');

  const variants = {
    primary: [
      'bg-gradient-to-r from-coral-500 to-coral-600',
      'text-white shadow-coral',
      'hover:from-coral-600 hover:to-coral-700 hover:-translate-y-0.5 hover:shadow-lg',
      'focus-visible:ring-coral-400',
    ].join(' '),

    violet: [
      'bg-gradient-to-r from-violet-500 to-violet-600',
      'text-white shadow-violet',
      'hover:from-violet-600 hover:to-violet-700 hover:-translate-y-0.5 hover:shadow-lg',
      'focus-visible:ring-violet-400',
    ].join(' '),

    outline: [
      'border-2 border-coral-500 text-coral-500 bg-transparent',
      'hover:bg-coral-50 hover:-translate-y-0.5',
      'focus-visible:ring-coral-400',
    ].join(' '),

    'outline-violet': [
      'border-2 border-violet-500 text-violet-500 bg-transparent',
      'hover:bg-violet-50 hover:-translate-y-0.5',
      'focus-visible:ring-violet-400',
    ].join(' '),

    ghost: [
      'text-violet-600 bg-transparent',
      'hover:bg-violet-50 hover:text-violet-700',
      'focus-visible:ring-violet-400',
    ].join(' '),

    danger: [
      'bg-red-500 text-white',
      'hover:bg-red-600 hover:-translate-y-0.5',
      'focus-visible:ring-red-400',
    ].join(' '),

    // White button for use on coloured backgrounds
    white: [
      'bg-white text-coral-600 font-bold',
      'hover:bg-coral-50 hover:-translate-y-0.5 shadow-md',
      'focus-visible:ring-white',
    ].join(' '),
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        base,
        variants[variant] ?? variants.primary,
        sizes[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {/* Spinner for loading state */}
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}

      {/* Optional leading icon */}
      {!loading && icon && <span className="shrink-0">{icon}</span>}

      {children}
    </button>
  );
};

export default Button;
