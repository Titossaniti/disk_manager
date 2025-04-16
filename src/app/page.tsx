import { getSession } from "@/actions/auth"
import { redirect } from "next/navigation"

export default async function Home() {
    const session = await getSession()

    if (session) {
        redirect("/dashboard")
    } else {
        redirect("/login")
    }
}