import React, { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

export type UserRole = 'super_admin' | 'editor' | 'smm' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastActive?: string;
}

interface UserWithPassword extends User {
  passwordHash: string;
}

interface NewUserInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  hasUsers: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAdmin: (username: string, email: string, password: string) => boolean;
  hasPermission: (action: string) => boolean;
  verifyCurrentPassword: (password: string) => boolean;
  addUser: (user: NewUserInput) => boolean;
  deleteUser: (userId: string) => boolean;
  updateUserRole: (userId: string, role: UserRole) => boolean;
  changePassword: (userId: string, oldPassword: string, newPassword: string) => boolean;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['all'],
  editor: ['edit_content', 'edit_courses', 'edit_faq', 'edit_announcements', 'view_analytics'],
  smm: ['edit_announcements', 'add_announcements', 'delete_announcements', 'upload_images'],
  viewer: ['view_content']
};

const HASH_PREFIX = 'pbkdf2';
const HASH_ITERATIONS = 120000;
const SESSION_MAX_HOURS = 24;
const USERS_STORAGE_KEY = 'ppa_admin_users';
const USER_STORAGE_KEY = 'ppa_admin_user';

interface PasswordVerificationResult {
  isValid: boolean;
  needsUpgrade: boolean;
}

const createPasswordHash = (password: string): string => {
  const salt = CryptoJS.lib.WordArray.random(16).toString();
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: HASH_ITERATIONS
  }).toString();
  return `${HASH_PREFIX}$${HASH_ITERATIONS}$${salt}$${hash}`;
};

const parseModernHash = (storedHash: string): { iterations: number; salt: string; hash: string } | null => {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== HASH_PREFIX) {
    return null;
  }

  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return null;
  }

  return {
    iterations,
    salt: parts[2],
    hash: parts[3]
  };
};

const verifyPassword = (password: string, storedHash: string): PasswordVerificationResult => {
  const modernHash = parseModernHash(storedHash);
  if (modernHash) {
    const computedHash = CryptoJS.PBKDF2(password, modernHash.salt, {
      keySize: 256 / 32,
      iterations: modernHash.iterations
    }).toString();

    return {
      isValid: computedHash === modernHash.hash,
      needsUpgrade: modernHash.iterations < HASH_ITERATIONS
    };
  }

  const legacySha = CryptoJS.SHA256(password).toString();
  if (storedHash === legacySha || storedHash === password) {
    return { isValid: true, needsUpgrade: true };
  }

  return { isValid: false, needsUpgrade: false };
};

const readStoredUsers = (): UserWithPassword[] => {
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!storedUsers) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedUsers) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is UserWithPassword => {
        if (typeof item !== 'object' || item === null) {
          return false;
        }
        const candidate = item as Record<string, unknown>;
        return (
          typeof candidate.id === 'string' &&
          typeof candidate.username === 'string' &&
          typeof candidate.email === 'string' &&
          typeof candidate.passwordHash === 'string' &&
          typeof candidate.createdAt === 'string' &&
          typeof candidate.role === 'string'
        );
      })
      .map((user) => ({
        ...user,
        role: (['super_admin', 'editor', 'smm', 'viewer'].includes(user.role) ? user.role : 'viewer') as UserRole
      }));
  } catch {
    return [];
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<UserWithPassword[]>(readStoredUsers());
  const hasUsers = users.length > 0;

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        const lastActive = user.lastActive ? new Date(user.lastActive) : new Date(0);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

        if (hoursDiff < SESSION_MAX_HOURS) {
          const refreshedUser = { ...user, lastActive: now.toISOString() };
          setCurrentUser(refreshedUser);
          setIsAuthenticated(true);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(refreshedUser));
        } else {
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const normalizedUsername = username.trim();
    const userIndex = users.findIndex((candidate) => candidate.username === normalizedUsername);

    if (userIndex !== -1) {
      const user = users[userIndex];
      const verification = verifyPassword(password, user.passwordHash);
      if (!verification.isValid) {
        return false;
      }

      if (verification.needsUpgrade) {
        const upgradedUsers = [...users];
        upgradedUsers[userIndex] = {
          ...upgradedUsers[userIndex],
          passwordHash: createPasswordHash(password)
        };
        setUsers(upgradedUsers);
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      const authenticatedUser = {
        ...userWithoutPassword,
        lastActive: new Date().toISOString()
      };

      setCurrentUser(authenticatedUser);
      setIsAuthenticated(true);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
      logActivity(user.id, user.username, 'login');

      return true;
    }

    return false;
  };

  const logout = () => {
    if (currentUser) {
      logActivity(currentUser.id, currentUser.username, 'logout');
    }
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const initializeAdmin = (username: string, email: string, password: string): boolean => {
    if (users.length > 0) {
      return false;
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedUsername || !normalizedEmail || password.length < 8) {
      return false;
    }

    const initialAdmin: UserWithPassword = {
      id: Date.now().toString(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: createPasswordHash(password),
      role: 'super_admin',
      createdAt: new Date().toISOString()
    };

    setUsers([initialAdmin]);
    return true;
  };

  const hasPermission = (action: string): boolean => {
    if (!currentUser) return false;
    
    const userPermissions = PERMISSIONS[currentUser.role];
    return userPermissions.includes('all') || userPermissions.includes(action);
  };

  const verifyCurrentPassword = (password: string): boolean => {
    if (!currentUser || !password) {
      return false;
    }

    const userIndex = users.findIndex((candidate) => candidate.id === currentUser.id);
    if (userIndex === -1) {
      return false;
    }

    const verification = verifyPassword(password, users[userIndex].passwordHash);
    if (!verification.isValid) {
      return false;
    }

    if (verification.needsUpgrade) {
      const upgradedUsers = [...users];
      upgradedUsers[userIndex] = {
        ...upgradedUsers[userIndex],
        passwordHash: createPasswordHash(password)
      };
      setUsers(upgradedUsers);
    }

    return true;
  };

  const addUser = (userData: NewUserInput): boolean => {
    const normalizedUsername = userData.username.trim();
    const normalizedEmail = userData.email.trim().toLowerCase();

    if (!normalizedUsername || !normalizedEmail || userData.password.length < 8) {
      return false;
    }

    if (users.find(u => u.username === normalizedUsername || u.email === normalizedEmail)) {
      return false;
    }

    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      username: normalizedUsername,
      email: normalizedEmail,
      role: userData.role,
      passwordHash: createPasswordHash(userData.password),
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    
    if (currentUser) {
      logActivity(currentUser.id, currentUser.username, 'create', `user: ${normalizedUsername}`);
    }
    
    return true;
  };

  const deleteUser = (userId: string): boolean => {
    if (currentUser?.id === userId) {
      return false;
    }

    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.role === 'super_admin') {
      const superAdminCount = users.filter(u => u.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        return false;
      }
    }

    setUsers(users.filter(u => u.id !== userId));
    
    if (currentUser) {
      logActivity(currentUser.id, currentUser.username, 'delete', `user: ${userToDelete?.username}`);
    }
    
    return true;
  };

  const updateUserRole = (userId: string, role: UserRole): boolean => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const user = users[userIndex];
    if (user.role === 'super_admin' && role !== 'super_admin') {
      const superAdminCount = users.filter(u => u.role === 'super_admin').length;
      if (superAdminCount <= 1) {
        return false;
      }
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], role };
    setUsers(updatedUsers);
    
    if (currentUser) {
      logActivity(currentUser.id, currentUser.username, 'edit', `user role: ${user.username} → ${role}`);
    }
    
    return true;
  };

  const changePassword = (userId: string, oldPassword: string, newPassword: string): boolean => {
    if (newPassword.length < 8) {
      return false;
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const user = users[userIndex];
    const oldPasswordCheck = verifyPassword(oldPassword, user.passwordHash);
    if (!oldPasswordCheck.isValid) {
      return false;
    }

    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], passwordHash: createPasswordHash(newPassword) };
    setUsers(updatedUsers);
    
    if (currentUser) {
      logActivity(currentUser.id, currentUser.username, 'edit', 'changed password');
    }
    
    return true;
  };

  const getAllUsers = (): User[] => {
    return users.map(({ passwordHash, ...user }) => user);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      hasUsers,
      login, 
      logout, 
      initializeAdmin,
      hasPermission,
      verifyCurrentPassword,
      addUser,
      deleteUser,
      updateUserRole,
      changePassword,
      getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const logActivity = (userId: string, username: string, action: string, target?: string) => {
  const activityLog = JSON.parse(localStorage.getItem('ppa_admin_activity') || '[]') as Array<Record<string, unknown>>;
  activityLog.push({
    userId,
    username,
    action,
    target,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('ppa_admin_activity', JSON.stringify(activityLog.slice(-100)));
};

export const getActivityLog = () => {
  return JSON.parse(localStorage.getItem('ppa_admin_activity') || '[]') as Array<Record<string, unknown>>;
};

export const clearActivityLog = () => {
  localStorage.removeItem('ppa_admin_activity');
};
