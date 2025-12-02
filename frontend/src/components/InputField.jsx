import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { FaEye, FaEyeLowVision } from "react-icons/fa6"; // modern icons

const InputField = ({ label, type, value, onChange, placeholder, required = true }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <Form.Group className="mb-3" style={{ position: "relative" }}>
      {/* LABEL */}
      {label && (
        <Form.Label style={{ color: "#111111", fontWeight: 500 }}>
          {label}
        </Form.Label>
      )}

      {/* INPUT */}
      <Form.Control
        type={isPassword ? (show ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          paddingRight: "45px",
          height: "45px",
          borderRadius: "10px",
          fontSize: "1rem",
        }}
      />

      {/* ICON */}
      {isPassword && (
        <span
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: "13px",
            bottom: "10px",
            cursor: "pointer",
            color: show ? "var(--accent1)" : "#888",
            fontSize: "1.3rem",
            transition: "0.2s ease",
          }}
        >
          {show ? <FaEye /> : <FaEyeLowVision />}
        </span>
      )}
    </Form.Group>
  );
};

export default InputField;
