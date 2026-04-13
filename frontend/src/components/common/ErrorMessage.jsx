import React from "react";
import PropTypes from "prop-types";

const ErrorMessage = ({ message, id }) => {
  if (!message) return null;
  return <div id={id} className="error-message">{message}</div>;
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  id: PropTypes.string,
};

export default ErrorMessage;
