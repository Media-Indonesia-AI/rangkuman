import LoginPage from "./LoginPage";

// Render at request time so `process.env.GOOGLE_CLIENT_ID` (set on
// the container at runtime via docker-compose) is read by the Node
// process, not at build time when it isn't available.
export const dynamic = "force-dynamic";

export default function LoginRoute() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not set");
  }
  return <LoginPage googleClientId={clientId} />;
}