import React from 'react';

/**
 * Textarea — multi-line input matching RoomieLink's Input style.
 */
const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required  = false,
  disabled  = false,
  rows      = 4,
  className = '',
  hint,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-bold text-violet-700 mb-1.5"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {label}
          {required && <span className="text-coral-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={[
          'w-full rounded-xl border-2 bg-white px-4 py-3 text-gray-800',
          'transition-all duration-200 resize-y',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-0',
          'disabled:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-60',
          error
            ? 'border-red-400 focus:border-red-500 bg-red-50'
            : 'border-violet-200 focus:border-coral-400 hover:border-violet-300',
          className,
        ].join(' ')}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-xs text-violet-400">{hint}</p>
      )}
    </div>
  );
};

export default Textarea;
