import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string; // e.g., 'users', 'projects', 'timesheets'
    action: string; // e.g., 'create', 'read', 'update', 'delete'
}

export interface Role {
    id: string;
    name: string;
    description: string;
    priority: number; // Higher number = higher priority
    priorityLabel: string; // Custom label for the priority level
    permissions: string[]; // Array of permission IDs
    assignedEmployees?: string[]; // Array of employee IDs
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserRole {
    userId: string;
    roleId: string;
    assignedAt: string;
    assignedBy: string;
}

interface RBACStore {
    roles: Role[];
    permissions: Permission[];
    userRoles: UserRole[];
    priorityLevels: { value: number; label: string }[];

    // Role management
    addRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateRole: (id: string, updates: Partial<Role>) => void;
    deleteRole: (id: string) => void;
    getRoleById: (id: string) => Role | undefined;

    // Permission management
    addPermission: (permission: Omit<Permission, 'id'>) => void;
    updatePermission: (id: string, updates: Partial<Permission>) => void;
    deletePermission: (id: string) => void;

    // User role assignment
    assignRoleToUser: (userId: string, roleId: string, assignedBy: string) => void;
    removeRoleFromUser: (userId: string, roleId: string) => void;
    getUserRoles: (userId: string) => Role[];

    // Priority level management
    addPriorityLevel: (value: number, label: string) => void;
    updatePriorityLevel: (value: number, newLabel: string) => void;
    deletePriorityLevel: (value: number) => void;

    // Utility functions
    hasPermission: (userId: string, resource: string, action: string) => boolean;
    getHighestPriorityRole: (userId: string) => Role | undefined;
}

// Default permissions for common HRMS operations
const defaultPermissions: Permission[] = [
    // User management
    { id: 'users-create', name: 'Create Users', description: 'Create new user accounts', resource: 'users', action: 'create' },
    { id: 'users-read', name: 'View Users', description: 'View user profiles and information', resource: 'users', action: 'read' },
    { id: 'users-update', name: 'Update Users', description: 'Edit user profiles and information', resource: 'users', action: 'update' },
    { id: 'users-delete', name: 'Delete Users', description: 'Delete user accounts', resource: 'users', action: 'delete' },

    // Project management
    { id: 'projects-create', name: 'Create Projects', description: 'Create new projects', resource: 'projects', action: 'create' },
    { id: 'projects-read', name: 'View Projects', description: 'View project details', resource: 'projects', action: 'read' },
    { id: 'projects-update', name: 'Update Projects', description: 'Edit project information', resource: 'projects', action: 'update' },
    { id: 'projects-delete', name: 'Delete Projects', description: 'Delete projects', resource: 'projects', action: 'delete' },

    // Timesheet management
    { id: 'timesheets-create', name: 'Create Timesheets', description: 'Create timesheet entries', resource: 'timesheets', action: 'create' },
    { id: 'timesheets-read', name: 'View Timesheets', description: 'View timesheet data', resource: 'timesheets', action: 'read' },
    { id: 'timesheets-update', name: 'Update Timesheets', description: 'Edit timesheet entries', resource: 'timesheets', action: 'update' },
    { id: 'timesheets-verify', name: 'Verify Timesheets', description: 'Approve/reject timesheet entries', resource: 'timesheets', action: 'verify' },

    // Leave management
    { id: 'leave-create', name: 'Create Leave Requests', description: 'Submit leave requests', resource: 'leave', action: 'create' },
    { id: 'leave-read', name: 'View Leave Requests', description: 'View leave request details', resource: 'leave', action: 'read' },
    { id: 'leave-approve', name: 'Approve Leave', description: 'Approve/reject leave requests', resource: 'leave', action: 'approve' },

    // Reports
    { id: 'reports-read', name: 'View Reports', description: 'Access reporting features', resource: 'reports', action: 'read' },
    { id: 'reports-export', name: 'Export Reports', description: 'Export report data', resource: 'reports', action: 'export' },

    // RBAC management
    { id: 'rbac-manage', name: 'Manage RBAC', description: 'Manage roles and permissions', resource: 'rbac', action: 'manage' },
];

// Default priority levels
const defaultPriorityLevels = [
    { value: 1, label: 'Basic User' },
    { value: 2, label: 'Team Member' },
    { value: 3, label: 'Team Lead' },
    { value: 4, label: 'Manager' },
    { value: 5, label: 'Senior Manager' },
    { value: 6, label: 'Director' },
    { value: 7, label: 'Executive' },
    { value: 8, label: 'Administrator' },
    { value: 9, label: 'Super Admin' },
    { value: 10, label: 'System Admin' },
];

export const useRBACStore = create<RBACStore>()(
    persist(
        (set, get) => ({
            roles: [],
            permissions: defaultPermissions,
            userRoles: [],
            priorityLevels: defaultPriorityLevels,

            addRole: (roleData) => {
                const newRole: Role = {
                    ...roleData,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                set((state) => ({
                    roles: [...state.roles, newRole]
                }));
            },

            updateRole: (id, updates) => {
                set((state) => ({
                    roles: state.roles.map(role =>
                        role.id === id
                            ? { ...role, ...updates, updatedAt: new Date().toISOString() }
                            : role
                    )
                }));
            },

            deleteRole: (id) => {
                set((state) => ({
                    roles: state.roles.filter(role => role.id !== id),
                    userRoles: state.userRoles.filter(ur => ur.roleId !== id)
                }));
            },

            getRoleById: (id) => {
                return get().roles.find(role => role.id === id);
            },

            addPermission: (permissionData) => {
                const newPermission: Permission = {
                    ...permissionData,
                    id: Date.now().toString(),
                };
                set((state) => ({
                    permissions: [...state.permissions, newPermission]
                }));
            },

            updatePermission: (id, updates) => {
                set((state) => ({
                    permissions: state.permissions.map(permission =>
                        permission.id === id ? { ...permission, ...updates } : permission
                    )
                }));
            },

            deletePermission: (id) => {
                set((state) => ({
                    permissions: state.permissions.filter(permission => permission.id !== id),
                    roles: state.roles.map(role => ({
                        ...role,
                        permissions: role.permissions.filter(permId => permId !== id)
                    }))
                }));
            },

            assignRoleToUser: (userId, roleId, assignedBy) => {
                const existingAssignment = get().userRoles.find(
                    ur => ur.userId === userId && ur.roleId === roleId
                );

                if (!existingAssignment) {
                    const newUserRole: UserRole = {
                        userId,
                        roleId,
                        assignedAt: new Date().toISOString(),
                        assignedBy,
                    };
                    set((state) => ({
                        userRoles: [...state.userRoles, newUserRole]
                    }));
                }
            },

            removeRoleFromUser: (userId, roleId) => {
                set((state) => ({
                    userRoles: state.userRoles.filter(
                        ur => !(ur.userId === userId && ur.roleId === roleId)
                    )
                }));
            },

            getUserRoles: (userId) => {
                const userRoleIds = get().userRoles
                    .filter(ur => ur.userId === userId)
                    .map(ur => ur.roleId);

                return get().roles.filter(role =>
                    userRoleIds.includes(role.id) && role.isActive
                );
            },

            addPriorityLevel: (value, label) => {
                set((state) => ({
                    priorityLevels: [...state.priorityLevels, { value, label }]
                        .sort((a, b) => a.value - b.value)
                }));
            },

            updatePriorityLevel: (value, newLabel) => {
                set((state) => ({
                    priorityLevels: state.priorityLevels.map(level =>
                        level.value === value ? { ...level, label: newLabel } : level
                    )
                }));
            },

            deletePriorityLevel: (value) => {
                set((state) => ({
                    priorityLevels: state.priorityLevels.filter(level => level.value !== value)
                }));
            },

            hasPermission: (userId, resource, action) => {
                const userRoles = get().getUserRoles(userId);
                const permissions = get().permissions;

                for (const role of userRoles) {
                    for (const permissionId of role.permissions) {
                        const permission = permissions.find(p => p.id === permissionId);
                        if (permission && permission.resource === resource && permission.action === action) {
                            return true;
                        }
                    }
                }
                return false;
            },

            getHighestPriorityRole: (userId) => {
                const userRoles = get().getUserRoles(userId);
                return userRoles.reduce((highest, current) =>
                    !highest || current.priority > highest.priority ? current : highest
                    , undefined as Role | undefined);
            },
        }),
        {
            name: 'rbac-storage',
        }
    )
);