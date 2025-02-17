
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export function UsersList() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...')
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          *,
          auth_user:auth.users (
            email
          )
        `)
        .order('username')

      if (error) {
        console.error('Error fetching profiles:', error)
        throw error
      }

      console.log('Fetched profiles:', profiles)
      setUsers(profiles)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading users...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Admin Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Experience Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.username || 'Anonymous User'}</TableCell>
              <TableCell>{user.auth_user?.email}</TableCell>
              <TableCell>
                {user.is_admin ? (
                  <Badge className="bg-green-500">Admin</Badge>
                ) : (
                  <Badge variant="secondary">User</Badge>
                )}
              </TableCell>
              <TableCell>{user.location || 'Not specified'}</TableCell>
              <TableCell>{user.experience_level || 'Not specified'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
