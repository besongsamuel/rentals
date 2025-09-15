import { Button, Menu, MenuItem } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    handleClose();
  };

  const getCurrentLanguageName = () => {
    switch (i18n.language) {
      case "en":
        return t("language.english");
      case "fr":
        return t("language.french");
      default:
        return t("language.english");
    }
  };

  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        sx={{ textTransform: "none" }}
      >
        {getCurrentLanguageName()}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handleLanguageChange("en")}>
          {t("language.english")}
        </MenuItem>
        <MenuItem onClick={() => handleLanguageChange("fr")}>
          {t("language.french")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
