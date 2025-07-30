import UserManagement from "@/components/admin/user-management"
import { fetchUsers } from "@/lib/api"

export default async function UserManagementPage() {
  const users = await fetchUsers();

  return <UserManagement initialUsers={users} />
}
