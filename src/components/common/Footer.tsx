import Link from "next/link";

const footerLinks = {
  "Quick Links": [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ],
  "Guest Services": [
    { name: "Book Now", href: "/booking" },
    { name: "Check Booking", href: "/lookup" },
    { name: "Staff Portal Login", href: "/login" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
  "Contact Info": [
    { name: "📍 Bole Road, Addis Ababa", href: "#" },
    { name: "📞 +251 911 000 000", href: "tel:+251911000000" },
    { name: "✉️ info@staycrafthotel.com", href: "mailto:info@staycrafthotel.com" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-lg font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} StayCraft Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
