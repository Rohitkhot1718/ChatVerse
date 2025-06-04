export const Input = ({
  type,
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  ...props
}) => {
  return (
    <input
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
};
