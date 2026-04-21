import React from "react";
import PropTypes from "prop-types";

const Button = ({ children, onClick, type = "button", className = "", disabled = false, id }) => {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      className={`btn ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
};

export default Button;
