import { useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useNotificationActions } from "@/stores/notificationStore";
import { useBestScore, useUserActions, useUsername } from "@/stores/userStore";
import type { UpdatedUser } from "@/types/userTypes";

const AccountContent = () => {
  const username = useUsername();
  const bestScore = useBestScore();
  const { update_email, delete: deleteAccount, logout } = useUserActions();
  const { setNotification } = useNotificationActions();
  const navigate = useNavigate();

  const [newUsername, setNewUsername] = useState(username ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = (username ?? "?").slice(0, 2).toUpperCase();

  const handleUpdate = async (
    e: SubmitEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    setSaving(true);

    const payload: UpdatedUser = {
      updated_username: newUsername,
      password: currentPassword,
    };

    try {
      await update_email(payload);
      setNotification("Account updated", "success");
      setNewUsername("");
      setCurrentPassword("");
    } catch {
      setNotification(
        "Couldn't save changes - check your current password, and that you've changed at least one field",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      setNotification("Your account has been deleted", "success");
      void navigate("/");
    } catch {
      setNotification(
        "Couldn't delete your account, please try again",
        "error",
      );
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    void navigate("/");
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground">
          Manage your profile and sign-in details.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{username ?? "Player"}</CardTitle>
            <CardDescription>{username}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-4">
            <Trophy className="size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Best lineup score</p>
              {bestScore !== null ? (
                <p className="text-xl font-semibold">{bestScore.toFixed(2)}</p>
              ) : (
                <p className="text-sm">
                  No score on record right now.{" "}
                  <Link to="/game" className="underline underline-offset-2">
                    Play a game
                  </Link>{" "}
                  to set one.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>Update your username</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleUpdate(e)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="account-new-password">
                  New username
                </FieldLabel>
                <Input
                  id="account-new-password"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
                <FieldDescription>
                  Enter a new password, or your current one to leave it
                  unchanged.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="account-current-password">
                  Current password
                </FieldLabel>
                <Input
                  id="account-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={saving} className="sm:w-fit">
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>
            Sign out of this device. You can sign back in any time.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={handleLogout}>
            Sign out
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Permanently delete your account and best score. This can&apos;t be
            undone.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Dialog>
            <DialogTrigger render={<Button variant="destructive" />}>
              Delete account
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  This permanently deletes your account and your best score.
                  This can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={deleting}
                  onClick={() => void handleDelete()}
                >
                  {deleting ? "Deleting..." : "Delete account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountContent;
