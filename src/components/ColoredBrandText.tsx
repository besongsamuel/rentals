import { Box, Typography, TypographyProps } from "@mui/material";
import React from "react";

interface ColoredBrandTextProps extends Omit<TypographyProps, "children"> {
  children?: React.ReactNode;
}

const ColoredBrandText: React.FC<ColoredBrandTextProps> = ({
  children,
  ...props
}) => {
  return (
    <Typography {...props}>
      <Box component="span" sx={{ color: "error.main" }}>
        mo
      </Box>{" "}
      <Box component="span" sx={{ color: "warning.main" }}>
        kumbi
      </Box>
      {children}
    </Typography>
  );
};

export default ColoredBrandText;





