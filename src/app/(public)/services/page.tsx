import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";

const services = [
  {
    icon: "🏊",
    title: "Swimming Pool",
    description: "Temperature-controlled indoor pool with panoramic city views.",
    features: ["Heated pool", "Lounge chairs", "Poolside service"],
  },
  {
    icon: "💪",
    title: "Fitness Center",
    description: "State-of-the-art gym equipment and professional trainers.",
    features: ["Cardio machines", "Free weights", "Personal trainers"],
  },
  {
    icon: "🍽️",
    title: "Fine Dining",
    description: "Exquisite culinary experiences with international cuisine.",
    features: ["International buffet", "À la carte menu", "Wine cellar"],
  },
  {
    icon: "🧖",
    title: "Spa & Wellness",
    description: "Rejuvenating treatments and relaxation therapies.",
    features: ["Massage therapy", "Facials", "Sauna & steam room"],
  },
  {
    icon: "🎪",
    title: "Event Spaces",
    description: "Versatile venues for conferences, weddings, and celebrations.",
    features: ["Conference rooms", "Ballroom", "Outdoor terrace"],
  },
  {
    icon: "🚗",
    title: "Valet Parking",
    description: "Complimentary valet parking for all hotel guests.",
    features: ["24/7 service", "Secure parking", "Car wash service"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="container-custom py-12">
        <h1 className="text-4xl font-bold text-center mb-4">Our Services</h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Experience unparalleled luxury and comfort with our premium services
          designed to make your stay unforgettable.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="card p-6 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <ul className="space-y-1">
                {service.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-500 flex items-center">
                    <span className="text-blue-500 mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
