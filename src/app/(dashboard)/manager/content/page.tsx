"use client";

import { useState, useEffect } from "react";
import { contentAPI } from "@/lib/api/endpoints";
import {
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api/client";

interface Testimonial {
  id: number;
  guest_name: string;
  guest_title: string;
  rating: number;
  comment: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
}

interface GalleryItem {
  id: number;
  title: string;
  caption: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

type ContentTab = "testimonials" | "faqs" | "gallery";

// FAQ API methods using apiClient
const faqAPI = {
  getFAQs: () => apiClient.get<{ results: FAQ[] }>('/content/faqs/'),
  createFAQ: (data: Partial<FAQ>) => apiClient.post<FAQ>('/content/faqs/', data),
  updateFAQ: (id: number, data: Partial<FAQ>) => apiClient.patch<FAQ>(`/content/faqs/${id}/`, data),
  deleteFAQ: (id: number) => apiClient.delete(`/content/faqs/${id}/`),
};

// Gallery API methods using apiClient
const galleryAPI = {
  getGallery: () => apiClient.get<{ results: GalleryItem[] }>('/content/gallery/'),
  createGallery: (data: FormData) => apiClient.post<GalleryItem>('/content/gallery/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateGallery: (id: number, data: FormData) => apiClient.patch<GalleryItem>(`/content/gallery/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteGallery: (id: number) => apiClient.delete(`/content/gallery/${id}/`),
};

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("testimonials");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for different tabs
  const [testimonialForm, setTestimonialForm] = useState({
    guest_name: "",
    guest_title: "Verified Guest",
    rating: 5,
    comment: "",
    is_featured: true,
    is_active: true,
  });

  const [faqForm, setFaqForm] = useState({
    category: "General",
    question: "",
    answer: "",
    is_active: true,
    display_order: 0,
  });

  const [galleryForm, setGalleryForm] = useState({
    title: "",
    caption: "",
    is_active: true,
    display_order: 0,
  });
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [testimonialsRes, faqsRes, galleryRes] = await Promise.all([
        contentAPI.getTestimonials(),
        faqAPI.getFAQs(),
        galleryAPI.getGallery(),
      ]);

      setTestimonials(testimonialsRes.data?.results || []);
      setFaqs(faqsRes.data?.results || []);
      setGallery(galleryRes.data?.results || []);
    } catch (error: any) {
      console.error("Failed to fetch content:", error);
      toast.error(error.response?.data?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const resetTestimonialForm = () => {
    setTestimonialForm({
      guest_name: "",
      guest_title: "Verified Guest",
      rating: 5,
      comment: "",
      is_featured: true,
      is_active: true,
    });
  };

  const resetFaqForm = () => {
    setFaqForm({
      category: "General",
      question: "",
      answer: "",
      is_active: true,
      display_order: 0,
    });
  };

  const resetGalleryForm = () => {
    setGalleryForm({
      title: "",
      caption: "",
      is_active: true,
      display_order: 0,
    });
    setGalleryFile(null);
    setGalleryPreview(null);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === "testimonials") resetTestimonialForm();
    else if (activeTab === "faqs") resetFaqForm();
    else resetGalleryForm();
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    if (activeTab === "testimonials") {
      setTestimonialForm({
        guest_name: item.guest_name,
        guest_title: item.guest_title || "Verified Guest",
        rating: item.rating,
        comment: item.comment,
        is_featured: item.is_featured,
        is_active: item.is_active,
      });
    } else if (activeTab === "faqs") {
      setFaqForm({
        category: item.category,
        question: item.question,
        answer: item.answer,
        is_active: item.is_active,
        display_order: item.display_order,
      });
    } else {
      setGalleryForm({
        title: item.title,
        caption: item.caption || "",
        is_active: item.is_active,
        display_order: item.display_order || 0,
      });
      setGalleryPreview(item.image_url || null);
    }
    setShowModal(true);
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await contentAPI.updateTestimonial(editingItem.id, testimonialForm);
        toast.success("Testimonial updated successfully!");
      } else {
        await contentAPI.createTestimonial(testimonialForm);
        toast.success("Testimonial created successfully!");
      }
      setShowModal(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await faqAPI.updateFAQ(editingItem.id, faqForm);
        toast.success("FAQ updated successfully!");
      } else {
        await faqAPI.createFAQ(faqForm);
        toast.success("FAQ created successfully!");
      }
      setShowModal(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!galleryFile && !editingItem) {
      toast.error("Please select an image to upload");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", galleryForm.title);
      formData.append("caption", galleryForm.caption || "");
      formData.append("is_active", String(galleryForm.is_active));
      formData.append("display_order", String(galleryForm.display_order || 0));
      
      if (galleryFile) {
        formData.append("image", galleryFile);
      }

      if (editingItem) {
        await galleryAPI.updateGallery(editingItem.id, formData);
        toast.success("Gallery item updated successfully!");
      } else {
        await galleryAPI.createGallery(formData);
        toast.success("Gallery item created successfully!");
      }
      setShowModal(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save gallery item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setGalleryFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteItem = async (id: number, type: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'testimonial') {
        await contentAPI.deleteTestimonial(id);
      } else if (type === 'faq') {
        await faqAPI.deleteFAQ(id);
      } else {
        await galleryAPI.deleteGallery(id);
      }
      toast.success(`${type} deleted successfully`);
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to delete ${type}`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const getModalTitle = () => {
    const action = editingItem ? "Edit" : "Add New";
    const type = activeTab === "testimonials" ? "Testimonial" : activeTab === "faqs" ? "FAQ" : "Gallery Item";
    return `${action} ${type}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-sm text-gray-500">Manage testimonials, FAQs, and gallery</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add {activeTab === "testimonials" ? "Testimonial" : activeTab === "faqs" ? "FAQ" : "Image"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "testimonials"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Testimonials ({testimonials.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "faqs"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <QuestionMarkCircleIcon className="h-4 w-4" />
            FAQs ({faqs.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "gallery"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <PhotoIcon className="h-4 w-4" />
            Gallery ({gallery.length})
          </div>
        </button>
      </div>

      {/* Testimonials Tab */}
      {activeTab === "testimonials" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="dashboard-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{testimonial.guest_name}</h4>
                      <span className="text-xs text-gray-500">{testimonial.guest_title}</span>
                    </div>
                    <div className="flex mt-1">{renderStars(testimonial.rating)}</div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {testimonial.comment}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`badge ${testimonial.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {testimonial.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {testimonial.is_featured && (
                      <span className="badge badge-info">Featured</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(testimonial)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(testimonial.id, 'testimonial')}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {testimonials.length === 0 && (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No testimonials found. Add your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="dashboard-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                      <span className="badge badge-info text-xs">{faq.category}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className={`badge ${faq.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-gray-400">Order: {faq.display_order}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(faq.id, 'faq')}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {faqs.length === 0 && (
            <div className="text-center py-12">
              <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No FAQs found. Add your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === "gallery" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((item) => (
              <div key={item.id} className="dashboard-card overflow-hidden">
                <div className="relative aspect-square bg-gray-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  {item.caption && (
                    <p className="text-sm text-gray-500 mt-1">{item.caption}</p>
                  )}
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id, 'gallery')}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {gallery.length === 0 && (
            <div className="text-center py-12">
              <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No gallery items found. Add your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{getModalTitle()}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {activeTab === "testimonials" && (
              <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.guest_name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, guest_name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Title
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.guest_title}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, guest_title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Business Traveler, UK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating *
                  </label>
                  <select
                    required
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                    className="input-field"
                  >
                    {[1, 2, 3, 4, 5].map((r) => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment *
                  </label>
                  <textarea
                    required
                    value={testimonialForm.comment}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, comment: e.target.value })}
                    className="input-field resize-none"
                    rows={4}
                    placeholder="What did they say about their stay?"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={testimonialForm.is_featured}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, is_featured: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={testimonialForm.is_active}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : (editingItem ? "Update" : "Create")}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "faqs" && (
              <form onSubmit={handleFaqSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={faqForm.category}
                    onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Booking, Payments, Policies"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question *
                  </label>
                  <input
                    type="text"
                    required
                    value={faqForm.question}
                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                    className="input-field"
                    placeholder="What is your cancellation policy?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer *
                  </label>
                  <textarea
                    required
                    value={faqForm.answer}
                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                    className="input-field resize-none"
                    rows={4}
                    placeholder="Detailed answer to the question..."
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={faqForm.is_active}
                      onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={faqForm.display_order}
                      onChange={(e) => setFaqForm({ ...faqForm, display_order: parseInt(e.target.value) || 0 })}
                      className="input-field w-24"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : (editingItem ? "Update" : "Create")}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "gallery" && (
              <form onSubmit={handleGallerySubmit} className="space-y-4">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${galleryPreview ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
                  {galleryPreview ? (
                    <div className="relative">
                      <img
                        src={galleryPreview}
                        alt="Preview"
                        className="max-h-48 rounded-lg mx-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryPreview(null);
                          setGalleryFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="gallery-file-upload"
                  />
                  {!galleryPreview && (
                    <label
                      htmlFor="gallery-file-upload"
                      className="inline-block mt-3 btn-secondary text-sm cursor-pointer"
                    >
                      Choose Image
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Deluxe Suite"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={galleryForm.caption}
                    onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                    className="input-field"
                    placeholder="Brief description of the image"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={galleryForm.is_active}
                    onChange={(e) => setGalleryForm({ ...galleryForm, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {isSubmitting ? "Uploading..." : (editingItem ? "Update" : "Upload")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
