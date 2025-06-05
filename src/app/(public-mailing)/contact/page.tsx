import ContactForm from "@/components/contact-form"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import Link from "next/link"
import { Disc3 } from "lucide-react"

export default function PublicContactPage() {
    return (
        <div className="flex min-h-screen flex-col items-center px-4 pt-20 space-y-6">
            <Link
                href="/login"
                className="flex items-center gap-2 font-medium text-sm text-muted-foreground"
            >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Disc3 className="size-4" />
                </div>
                <p>Disk Manager</p>
            </Link>

            <Card className="w-full max-w-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Nous contacter</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Si vous souhaitez obtenir des informations sur notre service,
                        <br />
                        n'hésitez pas à nous écrire via ce formulaire.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ContactForm />
                </CardContent>
            </Card>
        </div>
    )
}
