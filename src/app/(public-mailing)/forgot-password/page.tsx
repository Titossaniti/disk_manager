import { Suspense } from "react"
import ForgotPasswordForm from "@/components/forgot-password-form";

export default function Page() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Chargement…</div>}>
            <ForgotPasswordForm />
        </Suspense>
    )
}
