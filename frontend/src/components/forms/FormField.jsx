/**
 * FormField Component
 *
 * Wrapper for form fields with label
 */

import React from 'react';
import PropTypes from 'prop-types';

const FormField = ({
  label,
  required = false,
  error,
  children,
  htmlFor
}) => {
  return (
    <label className="flex flex-col w-full">
      {label && (
        <p className="pb-2 text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </p>
      )}
      {children}
    </label>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node.isRequired,
  htmlFor: PropTypes.string
};

export default FormField;

