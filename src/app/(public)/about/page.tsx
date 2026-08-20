"use client";

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { motion } from "framer-motion";
import {
  UsersIcon,
  StarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const stats = [
  { label: "Happy Guests", value: "2,500+", icon: UsersIcon, color: "blue" },
  { label: "Average Rating", value: "4.8/5", icon: StarIcon, color: "yellow" },
  { label: "Luxury Rooms", value: "50+", icon: BuildingOfficeIcon, color: "purple" },
  { label: "24/7 Support", value: "Always", icon: ClockIcon, color: "green" },
];

const features = [
  {
    title: "Luxury Accommodations",
    description: "Each room is designed with premium furnishings and modern amenities.",
    icon: "✨",
  },
  {
    title: "World-Class Service",
    description: "Our dedicated staff ensures every guest feels welcome and valued.",
    icon: "🤝",
  },
  {
    title: "Prime Location",
    description: "Centrally located with easy access to business and entertainment.",
    icon: "📍",
  },
  {
    title: "Award-Winning Dining",
    description: "Experience exquisite cuisine prepared by renowned chefs.",
    icon: "🍽️",
  },
];

const team = [
  { name: "Sarah Johnson", role: "General Manager", avatar: "SJ" },
  { name: "Michael Chen", role: "Head Chef", avatar: "MC" },
  { name: "Anna Kowalski", role: "Guest Relations", avatar: "AK" },
  { name: "David Okonkwo", role: "Head Concierge", avatar: "DO" },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }} />
          </div>
          <div className="container-custom relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                About StayCraft Hotel
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Where Luxury Meets <span className="text-yellow-400">Comfort</span>
              </h1>
              <p className="text-lg text-gray-200">
                Discover the story behind our commitment to excellence and unparalleled hospitality.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Founded in 2020, StayCraft Hotel has been providing world-class
                  accommodations and exceptional service to guests from around the world.
                  Our commitment to luxury, comfort, and elegance sets us apart.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Located in the heart of the city, we offer easy access to business
                  districts, tourist attractions, and cultural experiences. Our dedicated
                  team ensures every stay is memorable.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">5-Star Rated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">Award Winning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">Eco-Friendly</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-video bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center p-8">
                    <div className="text-center text-white">
                      <BuildingOfficeIcon className="h-20 w-20 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">StayCraft Hotel</p>
                      <p className="text-sm opacity-75">Est. 2020</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-4 text-white">
                      <div>
                        <p className="text-xs opacity-75">Location</p>
                        <p className="text-sm font-medium">Bole Road, Addis Ababa</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`inline-flex p-3 rounded-full bg-${stat.color}-50 mb-3`}>
                      <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <div className={`text-3xl font-bold text-${stat.color}-600`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover what makes StayCraft Hotel the preferred choice for discerning travelers.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our dedicated team of professionals is committed to making your stay exceptional.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                    {member.avatar}
                  </div>
                  <h4 className="font-semibold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
