import {
  useNotificationMessage,
  useNotificationOpen,
  useNotificationActions,
  useNotificationSeverity,
} from "@/stores/notificationStore";
import SnackBar from "@/components/ui/SnackBar";

const Notification = () => {
  const open = useNotificationOpen();
  const message = useNotificationMessage();
  const severity = useNotificationSeverity();
  const { manualClose } = useNotificationActions();
  if (!message) {
    return;
  }

  const handleClose = () => {
    manualClose();
  };

  return (
    <SnackBar
      open={open}
      handleClose={handleClose}
      severity={severity}
      message={message}
    />
  );
};

export default Notification;
