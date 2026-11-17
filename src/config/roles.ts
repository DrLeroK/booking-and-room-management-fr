export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  RECEPTIONIST = 'RECEPTIONIST',
}

export type Permission =
  | 'rooms:view'
  | 'rooms:manage'
  | 'bookings:view'
  | 'bookings:create'
  | 'bookings:checkin'
  | 'bookings:checkout'
  | 'bookings:extend'
  | 'payments:view'
  | 'payments:process'
  | 'guests:view'
  | 'guests:manage'
  | 'analytics:view'
  | 'reports:export'
  | 'staff:manage'
  | 'content:manage'
  | 'settings:manage';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'rooms:view',
    'rooms:manage',
    'bookings:view',
    'bookings:create',
    'bookings:checkin',
    'bookings:checkout',
    'bookings:extend',
    'payments:view',
    'payments:process',
    'guests:view',
    'guests:manage',
    'analytics:view',
    'reports:export',
    'staff:manage',
    'content:manage',
    'settings:manage',
  ],
  [UserRole.OWNER]: [
    'rooms:view',
    'rooms:manage',
    'bookings:view',
    'bookings:create',
    'bookings:checkin',
    'bookings:checkout',
    'bookings:extend',
    'payments:view',
    'payments:process',
    'guests:view',
    'guests:manage',
    'analytics:view',
    'reports:export',
    'staff:manage',
    'content:manage',
    'settings:manage',
  ],
  [UserRole.MANAGER]: [
    'rooms:view',
    'rooms:manage',
    'bookings:view',
    'bookings:create',
    'bookings:checkin',
    'bookings:checkout',
    'bookings:extend',
    'payments:view',
    'guests:view',
    'guests:manage',
    'analytics:view',
    'reports:export',
    'staff:manage',
    'content:manage',
  ],
  [UserRole.RECEPTIONIST]: [
    'rooms:view',
    'bookings:view',
    'bookings:create',
    'bookings:checkin',
    'bookings:checkout',
    'bookings:extend',
    'payments:view',
    'payments:process',
    'guests:view',
    'guests:manage',
  ],
};

export const ROLE_NAMES: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.OWNER]: 'Hotel Owner',
  [UserRole.MANAGER]: 'General Manager',
  [UserRole.RECEPTIONIST]: 'Front Desk Receptionist',
};
