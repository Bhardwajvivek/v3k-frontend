import React from "react";

export function ToggleGroup({ children, value, type, onValueChange, className }) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isActive: child.props.value === value,
          onClick: () => onValueChange(child.props.value),
        })
      )}
    </div>
  );
}

export function ToggleGroupItem({ children, value, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm ${
        isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
      }`}
    >
      {children}
    </button>
  );
}
