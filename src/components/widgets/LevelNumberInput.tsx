import React from "react";
import { TextField, IconButton, Box } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface LevelNumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const LevelNumberInput: React.FC<LevelNumberInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  return (
    <Box display="flex" alignItems="center">
      <IconButton size="small" onClick={handleDecrement}>
        <Remove />
      </IconButton>
      <TextField
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        inputProps={{ min, max, step }}
        size="small"
        variant="standard"
      />
      <IconButton size="small" onClick={handleIncrement}>
        <Add />
      </IconButton>
    </Box>
  );
};

export default LevelNumberInput;
