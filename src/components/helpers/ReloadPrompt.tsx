import { Alert, Button, Snackbar } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";

const ReloadPrompt = () => {
  const { t } = useTranslation();

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log(`SW registered: ${r}`);
    },
    onRegisterError(err) {
      console.error(`SW registeration error: ${err}`);
    },
  });

  return (
    <Snackbar open={needRefresh}>
      <Alert
        severity="info"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => updateServiceWorker(true)}
          >
            {t("common:update")}
          </Button>
        }
      >
        {t("common:update-available")}
      </Alert>
    </Snackbar>
  );
};

export default ReloadPrompt;
