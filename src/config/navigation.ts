import { Permission } from './roles';

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  permission?: Permission;
}

export interface SimpleNavLink {
  name: string;
  href: string;
  badge?: string;
}

// ==============================================================================
// 1. Staff & Admin Dashboard Navigation (Role-Protected)
// ==============================================================================

export const receptionNavItems: NavItem[] = [
  { title: 'Live Board', href: '/reception', iconName: 'Home' },
  { title: 'Check-in', href: '/reception/check-in', iconName: 'PlusCircle' },
  { title: 'Check-out', href: '/reception/check-out', iconName: 'ClipboardList' },
  { title: 'Guests', href: '/reception/guests', iconName: 'Users' },
  { title: 'Bookings', href: '/reception/bookings', iconName: 'Calendar' },
  { title: 'Payments', href: '/reception/payments', iconName: 'CreditCard' },
  { title: 'Rooms', href: '/reception/rooms', iconName: 'Building' },
];

export const managerNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/manager', iconName: 'BarChart' },
  { title: 'Rooms', href: '/manager/rooms', iconName: 'Building' },
  { title: 'Staff', href: '/manager/staff', iconName: 'UserCheck' },
  { title: 'Reports', href: '/manager/reports', iconName: 'FileText' },
  { title: 'Content', href: '/manager/content', iconName: 'Image' },
  { title: 'Inquiries', href: '/manager/inquiries', iconName: 'Mail' },
];

export const ownerNavItems: NavItem[] = [
  { title: 'Analytics', href: '/owner/analytics', iconName: 'LineChart' },
  { title: 'Rooms', href: '/owner', iconName: 'Building' },
  { title: 'Users & Staff', href: '/owner/users', iconName: 'Users' },
  { title: 'Audit Logs', href: '/owner/audit-logs', iconName: 'FileText' },
  { title: 'Settings', href: '/owner/settings', iconName: 'Settings' },
];

// ==============================================================================
// 2. Public Header & Main Navigation
// ==============================================================================

export const headerNavItems: SimpleNavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Rooms & Suites', href: '/rooms' },
  { name: 'Book Now', href: '/booking' },
  { name: 'Lookup', href: '/lookup' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

export const publicNavItems = headerNavItems.map((item) => ({
  title: item.name,
  href: item.href,
}));

// ==============================================================================
// 3. Public Footer Navigation
// ==============================================================================

export const footerNavItems: Record<string, SimpleNavLink[]> = {
  'Quick Links': [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
  ],
  'Guest Services': [
    { name: 'Book Now', href: '/booking' },
    { name: 'Check Booking', href: '/lookup' },
    { name: 'Staff Portal Login', href: '/login' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
  ],
  'Contact Info': [
    { name: '📍 Bole Road, Addis Ababa', href: '#' },
    { name: '📞 +251 911 000 000', href: 'tel:+251911000000' },
    { name: '✉️ info@staycrafthotel.com', href: 'mailto:info@staycrafthotel.com' },
  ],
};
