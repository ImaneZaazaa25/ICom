import React from "react";
import PropTypes from "prop-types";

const Input = ({ label, type = "text", value, onChange, placeholder = "", className = "", id }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
