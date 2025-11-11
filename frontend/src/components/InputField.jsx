import React from 'react';
import { Form } from 'react-bootstrap';

const InputField = ({ label, type, value, onChange, placeholder, required = true }) => {
  return (
    <Form.Group className="mb-3">
      <Form.Label style={{ color: "var(--text)" }}>{label}</Form.Label>
      <Form.Control
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </Form.Group>
  );
};

export default InputField;
