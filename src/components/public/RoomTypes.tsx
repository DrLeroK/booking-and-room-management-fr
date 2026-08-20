"use client";

import Link from "next/link";

const rooms = [
  {
    id: 1,
    name: "Standard Single",
    price: "$80",
    description: "Comfortable single room with city view",
    image: "/api/placeholder/400/300",
    features: ["1 Twin Bed", "City View", "Free Wi-Fi"],
  },
  {
    id: 2,
    name: "Standard Double",
    price: "$120",
    description: "Spacious double room with modern amenities",
    image: "/api/placeholder/400/300",
    features: ["1 Queen Bed", "Garden View", "Free Wi-Fi"],
  },
  {
    id: 3,
    name: "Deluxe Suite",
    price: "$250",
    description: "Luxury suite with premium services",
    image: "/api/placeholder/400/300",
    features: ["King Bed", "Ocean View", "Jacuzzi"],
  },
  {
    id: 4,
    name: "Family Room",
    price: "$180",
    description: "Perfect for families with children",
    image: "/api/placeholder/400/300",
    features: ["2 Queen Beds", "City View", "Kitchenette"],
  },
];

export function RoomTypes() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-bold text-center mb-4">Our Rooms</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Choose from our selection of beautifully appointed rooms and suites.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold">{room.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                <ul className="mt-3 space-y-1">
                  {room.features.map((feature) => (
                    <li key={feature} className="text-sm text-gray-500 flex items-center">
                      <span className="text-blue-500 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">{room.price}</span>
                  <span className="text-sm text-gray-500">/ night</span>
                </div>
                <Link
                  href={`/booking?room=${room.id}`}
                  className="btn-primary w-full text-center mt-4 inline-block"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
