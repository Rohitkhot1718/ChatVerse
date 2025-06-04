import { forwardRef } from "react";

export const Input = forwardRef(({
  type,
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300
        ${className}`}
      {...props}
    />
  );
});
