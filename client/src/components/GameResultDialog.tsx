import { motion } from "motion/react";
import { Trophy, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Result } from "@/types/resultTypes";

type GameResultDialogProps = {
  result: Result | null;
  onRestart: () => void;
};

const GameResultDialog = ({ result, onRestart }: GameResultDialogProps) => {
  const open = result !== null;

  return (
    <Dialog open={open}>
      {"Test"}
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.15,
            }}
            className="flex size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-500"
          >
            <Trophy className="size-8" />
          </motion.div>

          <DialogTitle className="text-2xl">
            {result?.best ? "New personal best!" : "Lineup complete"}
          </DialogTitle>
          <DialogDescription>Your lineup has been evaluated</DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="py-2 text-center"
        >
          <p className="text-6xl font-bold tabular-nums">
            {result?.score.toFixed(2)}
          </p>
          {result?.best && (
            <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              🏆 Beat your previous best{" "}
            </p>
          )}
        </motion.div>

        <DialogFooter className="sm:justify-center">
          <Button onClick={onRestart} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 size-4" />
            Start new game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GameResultDialog;
