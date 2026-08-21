import LoginPage from "./LoginPage";

export default function LoginRoute() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }
  return <LoginPage googleClientId={clientId} />;
}