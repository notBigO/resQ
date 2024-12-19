import React, { useState, useRef, useEffect } from "react";
import { Controller } from "react-hook-form";

const MultiSelectBase = ({ options, value = [], onChange, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const getSelectedLabels = () => {
    return options
      .filter((option) => value.includes(option.value))
      .map((option) => option.label)
      .join(", ");
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="min-h-[38px] px-3 py-2 border rounded-md bg-white cursor-pointer flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length > 0 ? (
          <span className="text-sm">{getSelectedLabels()}</span>
        ) : (
          <span className="text-gray-400 text-sm">Select options...</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          <input
            type="text"
            className="w-full px-3 py-2 border-b text-sm"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="max-h-60 overflow-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(option.value);
                }}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => {}}
                  className="mr-2"
                />
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MultiSelect = ({ control, name, options }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <MultiSelectBase
          options={options}
          value={field.value || []}
          onChange={field.onChange}
          name={name}
        />
      )}
    />
  );
};

export default MultiSelect;
