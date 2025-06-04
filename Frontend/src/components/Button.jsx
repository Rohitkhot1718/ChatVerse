export const Button = ({ children, onClick, className = "", ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`border rounded-2xl py-2 px-6 font-bold cursor-pointer transition hover:shadow ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
