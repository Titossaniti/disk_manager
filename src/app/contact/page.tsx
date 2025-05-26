import ContactForm from "@/components/contact-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function PublicContactPage() {
    return (
        <div className="flex justify-center p-6">
            <Card className="w-full w-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Nous contacter</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Si vous souhaitez obtenir des informations sur notre service,
                        <br/>
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
