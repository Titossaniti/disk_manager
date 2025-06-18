import { Suspense } from "react"
import ResetPasswordForm from "@/components/reset-password-form";

export default function Page() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Chargement…</div>}>
            <ResetPasswordForm />
        </Suspense>
    )
}
