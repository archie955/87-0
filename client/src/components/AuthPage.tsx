import { Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

const AuthPage = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(3),
  background:
    "radial-gradient(circle at top, rgba(0,51,141,0.08), transparent 60%)",
}));

export default AuthPage;
