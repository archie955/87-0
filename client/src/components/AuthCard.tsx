import { Card } from "@mui/material";
import { styled } from "@mui/material/styles";

const AuthCard = styled(Card)(({ theme }) => ({
  width: "100%",
  maxWidth: 450,
  padding: theme.spacing(5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
  boxShadow: "0px 8px 24px rgba(0,0,0,0.08)",
  borderRadius: 20,
}));

export default AuthCard;
