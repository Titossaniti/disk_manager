import {Disc3} from "lucide-react"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { getSession } from "@/actions/auth"
import {Button} from "@/components/ui";
import Link from "next/link";

export default async function LoginPage() {

    const session = await getSession()

    if (session) {
        redirect("/home")
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Link href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Disc3 className="size-4" />
                    </div>
                    <p>Disk Manager</p>
                </Link>
                <LoginForm />
            </div>
            <div>
                <Link href="/contact">
                    <Button variant={"link"} className="underline hover:text-muted-foreground">
                        Pour toute demande de contact, cliquez ici !
                    </Button>
                </Link>
            </div>
        </div>
    )
}
