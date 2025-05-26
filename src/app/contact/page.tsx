import ContactForm from "@/components/contact-form";


export default function ContactPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">Contact</h1>
            <p>Si vous souhaitez avoir des information sur notre service, écrivez nous via ce formulaire !</p>
            <ContactForm />
        </div>
    );
}
