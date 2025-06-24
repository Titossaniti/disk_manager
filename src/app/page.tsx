import { redirect } from "next/navigation"

export default function RedirectRoot() {
    redirect("/login")
}