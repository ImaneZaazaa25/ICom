import React from "react";

const Button = ({ children, onClick, type = "button", className = "", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
Button.prototype = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
}
export default Button;
