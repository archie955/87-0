import { Snackbar, Alert } from "@mui/material";
import { Severity } from "@/stores/notificationStore";

interface SnackBarInput {
  open: boolean;
  handleClose: () => void;
  severity: Severity;
  message: string;
}

const SnackBar = ({ open, handleClose, severity, message }: SnackBarInput) => {
  return (
    <Snackbar open={open} onClose={handleClose}>
      <Alert onClose={handleClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackBar;
