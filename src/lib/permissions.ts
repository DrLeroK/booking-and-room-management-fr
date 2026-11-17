import { UserRole, Permission, ROLE_PERMISSIONS } from '@/config/roles';

export function can(user: { role?: string } | null | undefined, permission: Permission): boolean {
  if (!user || !user.role) return false;
  const role = user.role.toUpperCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

export function hasRole(user: { role?: string } | null | undefined, roles: string[]): boolean {
  if (!user || !user.role) return false;
  const userRole = user.role.toUpperCase();
  return roles.map((r) => r.toUpperCase()).includes(userRole);
}
