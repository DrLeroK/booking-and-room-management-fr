export const siteConfig = {
  name: 'StayCraft Hotel',
  shortName: 'StayCraft',
  description: 'Enterprise Booking & Room Management System',
  tagline: 'Luxury Accommodation & Intelligent Hospitality Management',
  url: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007',
  apiUrl: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  contact: {
    email: 'info@staycrafthotel.com',
    phone: '+1 (555) 123-4567',
    address: '123 Grand Luxury Avenue, Suite 100',
  },
  links: {
    github: 'https://github.com/staycraft',
  },
};
