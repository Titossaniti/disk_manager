import { Suspense } from "react"
import ConfirmEmail from "@/components/confirm-email";

export default function Page() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Chargement…</div>}>
            <ConfirmEmail />
        </Suspense>
    )
}
