import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("accessToken")?.value;
	redirect(accessToken ? "/dashboard" : "/login");
}