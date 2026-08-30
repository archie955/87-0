import {
  useNotificationMessage,
  useNotificationOpen,
  useNotificationActions,
  useNotificationSeverity,
} from "@/stores/notificationStore";
import { Toast } from "@/components/ui/toast";

const Notification = () => {
  const open = useNotificationOpen();
  const message = useNotificationMessage();
  const severity = useNotificationSeverity();
  const { manualClose } = useNotificationActions();
  if (!message) {
    return null;
  }

  return (
    <Toast
      open={open}
      onClose={manualClose}
      severity={severity}
      message={message}
    />
  );
};

export default Notification;
