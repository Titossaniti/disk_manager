import UpdateUserForm from "@/components/Update-user-form";

export default function ProfilePage() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Modifier mes informations</h2>
            <UpdateUserForm />
        </div>
    )
}
