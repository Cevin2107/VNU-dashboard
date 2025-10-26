import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HomeContent from "./homeContent";

export default async function Page() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    redirect("/welcome");
  }
  return <HomeContent />;
}