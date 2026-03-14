import React from "react";

const Input = ({ label, type = "text", value, onChange, placeholder = "", className = "" }) => {
  return (
    <div className={`input-group ${className}`}>
      {label && <label>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;
