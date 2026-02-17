import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { User, UserPlus, Trash2, Edit, Key, Shield } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full access to all features and settings',
  editor: 'Edit all content and view analytics',
  smm: 'Manage announcements only',
  viewer: 'Read-only access'
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-red-500',
  editor: 'bg-blue-500',
  smm: 'bg-green-500',
  viewer: 'bg-gray-500'
};

export const UserManagement = () => {
  const { currentUser, getAllUsers, addUser, deleteUser, updateUserRole, changePassword } = useAuth();
  const users = getAllUsers();

  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');
  const [addUserError, setAddUserError] = useState('');

  const [showEditRole, setShowEditRole] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole>('viewer');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPasswordChange, setNewPasswordChange] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleAddUser = () => {
    setAddUserError('');

    if (!newUsername || !newEmail || !newPassword) {
      setAddUserError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setAddUserError('Password must be at least 8 characters');
      return;
    }

    const success = addUser({
      username: newUsername,
      email: newEmail,
      password: newPassword,
      role: newRole
    });

    if (success) {
      setShowAddUser(false);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('viewer');
      alert('User added successfully!');
    } else {
      setAddUserError('Username or email already exists');
    }
  };

  const handleEditRole = (userId: string, currentRole: UserRole) => {
    setEditingUserId(userId);
    setEditingRole(currentRole);
    setShowEditRole(true);
  };

  const handleSaveRole = () => {
    if (editingUserId) {
      const success = updateUserRole(editingUserId, editingRole);
      if (success) {
        setShowEditRole(false);
        alert('User role updated successfully!');
      } else {
        alert('Cannot change the last super admin role');
      }
    }
  };

  const handleChangePassword = (userId: string) => {
    setPasswordUserId(userId);
    setShowChangePassword(true);
    setOldPassword('');
    setNewPasswordChange('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleSavePassword = () => {
    setPasswordError('');

    if (!oldPassword || !newPasswordChange || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPasswordChange.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    if (newPasswordChange !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordUserId) {
      const success = changePassword(passwordUserId, oldPassword, newPasswordChange);
      if (success) {
        setShowChangePassword(false);
        alert('Password changed successfully!');
      } else {
        setPasswordError('Current password is incorrect');
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    setDeletingUserId(userId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deletingUserId) {
      const success = deleteUser(deletingUserId);
      if (success) {
        setShowDeleteConfirm(false);
        alert('User deleted successfully!');
      } else {
        alert('Cannot delete yourself or the last super admin');
        setShowDeleteConfirm(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage admin users and permissions</p>
        </div>
        <Button onClick={() => setShowAddUser(true)} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className={user.id === currentUser?.id ? 'border-primary' : ''}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${ROLE_COLORS[user.role]} flex items-center justify-center text-white text-lg font-bold`}>
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      {user.id === currentUser?.id && <Badge variant="outline">You</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ROLE_DESCRIPTIONS[user.role]}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="capitalize">{user.role.replace('_', ' ')}</Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRole(user.id, user.role)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Role
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChangePassword(user.id)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Password
                  </Button>
                  
                  {user.id !== currentUser?.id && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new admin user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="username"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@ppa.am"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="smm">SMM Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {ROLE_DESCRIPTIONS[newRole]}
              </p>
            </div>
            {addUserError && <p className="text-sm text-destructive">{addUserError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditRole} onOpenChange={setShowEditRole}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Update user permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editingRole} onValueChange={(v) => setEditingRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="smm">SMM Manager</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {ROLE_DESCRIPTIONS[editingRole]}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRole(false)}>Cancel</Button>
            <Button onClick={handleSaveRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update user password</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="old-password">Current Password</Label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPasswordChange}
                onChange={(e) => setNewPasswordChange(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePassword(false)}>Cancel</Button>
            <Button onClick={handleSavePassword}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

