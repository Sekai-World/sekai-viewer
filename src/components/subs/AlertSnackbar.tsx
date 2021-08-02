import {
  Button,
  ButtonProps,
  Snackbar,
  SnackbarProps,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";

const AlertSnackbar: React.FC<
  React.PropsWithChildren<{
    message?: string;
    action?: string;
    ButtonProps?: Partial<ButtonProps>;
    SnackbarProps: Partial<SnackbarProps>;
    customParameters: any;
  }>
> = ({ message, action, ButtonProps, SnackbarProps, customParameters }) => {
  return (
    <Snackbar autoHideDuration={3000} {...SnackbarProps}>
      <Alert
        severity={customParameters?.type}
        action={
          action != null && (
            <Button color="inherit" size="small" {...ButtonProps}>
              {action}
            </Button>
          )
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertSnackbar;
