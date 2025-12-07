import { auth } from "@/auth";
import LandingPage from "@/components/LandingPage";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const userRole = (session?.user as any)?.role || null;

  return <LandingPage isAuthenticated={isAuthenticated} userRole={userRole} />;
}
