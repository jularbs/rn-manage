import { ChangePasswordForm } from "@/components/Forms/AuthForms/ChangePasswordForm";
import UserProfileForm from "@/components/Forms/ProfileManagementForms/UserProfileForm";
export default function UserManagementPage() {
    return <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div>
            <h1 className="text-2xl font-extrabold">User Management</h1>
            <p className="text-gray-600">Manage your profile information and settings.</p>
        </div>
        <div className="grid grid-cols-5 gap-4 ">
            <div className="col-span-5 lg:col-span-3">
                <UserProfileForm />
            </div>
            <div className="col-span-5 lg:col-span-2">
                <ChangePasswordForm />
            </div>

        </div>
    </div>;
}