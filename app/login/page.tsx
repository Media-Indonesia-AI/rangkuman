import LoginPage from "./LoginPage";

export default function LoginRoute() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
  }
  return <LoginPage googleClientId={clientId} />;
}