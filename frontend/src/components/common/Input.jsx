import React from 'react';

/**
 * Input — styled text field for RoomieLink forms.
 * Supports an optional leading icon and error state.
 */
const Input = ({
  label,
  type      = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required  = false,
  disabled  = false,
  className = '',
  icon,       // optional React element shown as a leading icon
  hint,       // optional helper text below the input
  ...props
}) => {
  return (
    <div className="mb-4">
      {/* Label */}
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

      {/* Input wrapper (allows icon overlay) */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={[
            'w-full rounded-xl border-2 bg-white py-2.5 text-gray-800',
            'transition-all duration-200',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-0',
            'disabled:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-60',
            icon ? 'pl-10 pr-4' : 'px-4',
            error
              ? 'border-red-400 focus:border-red-500 bg-red-50'
              : 'border-violet-200 focus:border-coral-400 hover:border-violet-300',
            className,
          ].join(' ')}
          {...props}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-violet-400">{hint}</p>
      )}
    </div>
  );
};

export default Input;
