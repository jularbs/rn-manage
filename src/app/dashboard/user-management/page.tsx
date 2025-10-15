import PendingUserList from "@/components/Forms/UserManagementForms/PendingUserManagement/PendingUserList";
import UserListComponent from "@/components/Forms/UserManagementForms/UserListComponent";

export default function UserManagementPage() {
    return <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <PendingUserList />
        <UserListComponent />
    </div>;
}