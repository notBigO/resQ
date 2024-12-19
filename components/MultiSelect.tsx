"use client";

import React from "react";
import Select from "react-select";
import { Controller } from "react-hook-form";

export function MultiSelect({ control, name, options }: any) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          {...field}
          isMulti
          options={options}
          onChange={(selected) =>
            field.onChange(selected.map((option: any) => option.value))
          }
          value={options.filter((option: any) =>
            field.value?.includes(option.value)
          )}
          className="basic-multi-select"
          classNamePrefix="select"
        />
      )}
    />
  );
}
