import { auth } from "@/auth"
import { MainContent } from "./MainContent";
import { ReactNode } from "react";

export async function LayoutWrapper({ children }: { children: ReactNode }) {
  const session = await auth();
  const hasUser = !!session?.user;

  return (
    <MainContent hasUser={hasUser}>
      {children}
    </MainContent>
  );
}
