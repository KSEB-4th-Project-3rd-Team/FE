import UserManagement from "@/components/admin/user-management"
import { fetchUsers } from "@/lib/api"

// Disable static generation and caching for dynamic content
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserManagementPage() {
  const users = await fetchUsers();

  return <UserManagement initialUsers={users} />
}
