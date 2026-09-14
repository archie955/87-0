import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CatchAll = () => {
  return (
    <Dialog open={true}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <DialogTitle className="text-2xl">404 - Page not found</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default CatchAll;
