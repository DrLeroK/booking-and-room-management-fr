"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { XMarkIcon, PhotoIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { contentAPI } from "@/lib/api/endpoints";
import { getImageUrl } from "@/lib/utils";

interface BackendGalleryItem {
  id: number;
  title: string;
  category?: any;
  category_name?: string;
  image?: string;
  image_url?: string;
  caption?: string;
}

export default function GalleryPage() {
  const [items, setItems] = useState<BackendGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<BackendGalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await contentAPI.getGallery();
        const data = response.data?.results || response.data || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load full photo gallery from backend:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  const getCategoryName = (item: BackendGalleryItem): string => {
    if (typeof item.category === "object" && item.category?.name) {
      return item.category.name;
    }
    return item.category_name || item.category || "Hotel";
  };

  const categories = ["All", ...Array.from(new Set(items.map(getCategoryName)))];

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => getCategoryName(item) === selectedCategory);

  const handleImageClick = (item: BackendGalleryItem, index: number) => {
    setSelectedImage(item);
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredItems[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedImage(filteredItems[newIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setSelectedImage(null);
  };

  return (
    <>
      <Header />
      <main className="container-custom py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-semibold text-sm tracking-wide uppercase">Hotel Showcase</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-1 mb-4">Official Photo Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore the beauty and elegance of StayCraft Hotel through real photos uploaded from our content management system.
          </p>
        </motion.div>

        {/* Category Filters */}
        {!loading && categories.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredItems.map((item, index) => {
              const catName = getCategoryName(item);
              const imgSrc = getImageUrl(item.image_url || item.image);

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="group relative overflow-hidden rounded-xl shadow-md cursor-pointer bg-gray-100 aspect-square"
                  onClick={() => handleImageClick(item, index)}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center p-6 text-white text-center">
                      <div>
                        <span className="text-4xl block mb-2">🏨</span>
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="text-white">
                      <h3 className="font-semibold text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-300">{catName}</p>
                      {item.caption && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.caption}</p>}
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    {catName}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No images found in this category</p>
          </div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="relative max-w-4xl w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <XMarkIcon className="h-8 w-8" />
                </button>

                {/* Image Content */}
                <div className="max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
                  {(selectedImage.image_url || selectedImage.image) ? (
                    <img
                      src={getImageUrl(selectedImage.image_url || selectedImage.image)}
                      alt={selectedImage.title}
                      className="max-h-[70vh] w-auto object-contain mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="p-16 text-white">
                      <span className="text-6xl block mb-4">🏨</span>
                      <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-white">
                  <h2 className="text-2xl font-bold">{selectedImage.title}</h2>
                  <p className="text-sm text-blue-400 font-medium mt-1">
                    Category: {getCategoryName(selectedImage)}
                  </p>
                  {selectedImage.caption && (
                    <p className="text-sm text-gray-300 mt-2 max-w-xl mx-auto">{selectedImage.caption}</p>
                  )}
                </div>

                {/* Navigation */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/60 hover:bg-black/80 rounded-full p-3"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/60 hover:bg-black/80 rounded-full p-3"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>

                {/* Image Counter */}
                <div className="mt-4 text-white/70 text-xs font-mono">
                  {currentIndex + 1} / {filteredItems.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}