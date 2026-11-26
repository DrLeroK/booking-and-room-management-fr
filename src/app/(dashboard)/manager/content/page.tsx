"use client";

import { useState, useEffect } from "react";
import { contentAPI } from "@/lib/api/endpoints";
import { getImageUrl } from "@/lib/utils";
import {
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  GlobeAltIcon,
  LinkIcon,
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

interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  display_order: number;
}

interface GalleryItem {
  id: number;
  title: string;
  caption: string;
  image?: string;
  image_url?: string;
  category?: number;
  category_name?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface Partner {
  id: number;
  name: string;
  logo?: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  category: string;
  is_active: boolean;
  display_order: number;
}

type ContentTab = "testimonials" | "faqs" | "gallery" | "partners";

// FAQ API methods using apiClient
const faqAPI = {
  getFAQs: () => apiClient.get<{ results: FAQ[] }>('/content/faqs/'),
  createFAQ: (data: Partial<FAQ>) => apiClient.post<FAQ>('/content/faqs/', data),
  updateFAQ: (id: number, data: Partial<FAQ>) => apiClient.patch<FAQ>(`/content/faqs/${id}/`, data),
  deleteFAQ: (id: number) => apiClient.delete(`/content/faqs/${id}/`),
};

// Gallery API methods using apiClient
const galleryAPI = {
  getGallery: (category?: string) =>
    apiClient.get<{ results: GalleryItem[] }>(
      category && category !== 'All' ? `/content/gallery/?category=${encodeURIComponent(category)}` : '/content/gallery/'
    ),
  createGallery: (data: FormData) => apiClient.post<GalleryItem>('/content/gallery/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateGallery: (id: number, data: FormData) => apiClient.patch<GalleryItem>(`/content/gallery/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteGallery: (id: number) => apiClient.delete(`/content/gallery/${id}/`),
};

// Category API methods
const categoryAPI = {
  getCategories: () => apiClient.get<{ results: GalleryCategory[] }>('/content/gallery-categories/'),
  createCategory: (name: string) => apiClient.post<GalleryCategory>('/content/gallery-categories/', {
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  }),
};

// Partner API methods
const partnerAPI = {
  getPartners: () => apiClient.get<{ results: Partner[] }>('/content/partners/'),
  createPartner: (data: FormData) => apiClient.post<Partner>('/content/partners/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePartner: (id: number, data: FormData) => apiClient.patch<Partner>(`/content/partners/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletePartner: (id: number) => apiClient.delete(`/content/partners/${id}/`),
};

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<ContentTab>("testimonials");
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

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
    category: "" as string | number,
    is_active: true,
    display_order: 0,
  });
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<string | null>(null);

  const [partnerForm, setPartnerForm] = useState({
    name: "",
    website_url: "",
    description: "",
    category: "Corporate Partner",
    is_active: true,
    display_order: 0,
  });
  const [partnerFile, setPartnerFile] = useState<File | null>(null);
  const [partnerPreview, setPartnerPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [testimonialsRes, faqsRes, galleryRes, catRes, partnersRes] = await Promise.all([
        contentAPI.getTestimonials(),
        faqAPI.getFAQs(),
        galleryAPI.getGallery(),
        categoryAPI.getCategories().catch(() => ({ data: { results: [] } })),
        partnerAPI.getPartners().catch(() => ({ data: { results: [] } })),
      ]);

      setTestimonials(testimonialsRes.data?.results || []);
      setFaqs(faqsRes.data?.results || []);
      setGallery(galleryRes.data?.results || []);
      setCategories(catRes.data?.results || []);
      setPartners(partnersRes.data?.results || []);
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
      category: "",
      is_active: true,
      display_order: 0,
    });
    setGalleryFile(null);
    setGalleryPreview(null);
    setShowNewCategoryInput(false);
    setNewCategoryName("");
  };

  const resetPartnerForm = () => {
    setPartnerForm({
      name: "",
      website_url: "",
      description: "",
      category: "Corporate Partner",
      is_active: true,
      display_order: 0,
    });
    setPartnerFile(null);
    setPartnerPreview(null);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    if (activeTab === "testimonials") resetTestimonialForm();
    else if (activeTab === "faqs") resetFaqForm();
    else if (activeTab === "gallery") resetGalleryForm();
    else resetPartnerForm();
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
    } else if (activeTab === "gallery") {
      setGalleryForm({
        title: item.title,
        caption: item.caption || "",
        category: item.category || "",
        is_active: item.is_active,
        display_order: item.display_order || 0,
      });
      setGalleryPreview(getImageUrl(item.image_url || item.image) || null);
      setShowNewCategoryInput(false);
    } else {
      setPartnerForm({
        name: item.name,
        website_url: item.website_url || "",
        description: item.description || "",
        category: item.category || "Corporate Partner",
        is_active: item.is_active,
        display_order: item.display_order || 0,
      });
      setPartnerPreview(getImageUrl(item.logo_url || item.logo) || null);
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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    try {
      const res = await categoryAPI.createCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, res.data]);
      setGalleryForm((prev) => ({ ...prev, category: res.data.id }));
      setNewCategoryName("");
      setShowNewCategoryInput(false);
      toast.success(`Category "${res.data.name}" created!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category");
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
      if (galleryForm.category) {
        formData.append("category", String(galleryForm.category));
      }
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

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", partnerForm.name);
      formData.append("website_url", partnerForm.website_url || "");
      formData.append("description", partnerForm.description || "");
      formData.append("category", partnerForm.category || "Corporate Partner");
      formData.append("is_active", String(partnerForm.is_active));
      formData.append("display_order", String(partnerForm.display_order || 0));

      if (partnerFile) {
        formData.append("logo", partnerFile);
      }

      if (editingItem) {
        await partnerAPI.updatePartner(editingItem.id, formData);
        toast.success("Partner updated successfully!");
      } else {
        await partnerAPI.createPartner(formData);
        toast.success("Partner created successfully!");
      }
      setShowModal(false);
      fetchContent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save partner");
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

  const handlePartnerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setPartnerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerPreview(reader.result as string);
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
      } else if (type === 'gallery') {
        await galleryAPI.deleteGallery(id);
      } else {
        await partnerAPI.deletePartner(id);
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
    const type =
      activeTab === "testimonials"
        ? "Testimonial"
        : activeTab === "faqs"
        ? "FAQ"
        : activeTab === "gallery"
        ? "Gallery Image"
        : "Trusted Partner";
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
          <p className="text-sm text-gray-500">Manage testimonials, FAQs, gallery, and trusted partners</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/manager/rooms/types"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <BuildingOffice2Icon className="h-4 w-4" />
            Manage Room Display
          </a>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add {activeTab === "testimonials" ? "Testimonial" : activeTab === "faqs" ? "FAQ" : activeTab === "gallery" ? "Image" : "Partner"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("testimonials")}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "testimonials"
              ? "border-blue-600 text-blue-600 font-semibold"
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
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "faqs"
              ? "border-blue-600 text-blue-600 font-semibold"
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
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "gallery"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <PhotoIcon className="h-4 w-4" />
            Gallery ({gallery.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("partners")}
          className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "partners"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="h-4 w-4" />
            Trusted Partners ({partners.length})
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
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-xl border border-gray-200">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Filter Category:</span>
            <button
              onClick={() => setGalleryCategoryFilter("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                galleryCategoryFilter === "All"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({gallery.length})
            </button>
            {categories.map((cat) => {
              const count = gallery.filter((g) => g.category === cat.id || g.category_name === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setGalleryCategoryFilter(cat.name)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    galleryCategoryFilter === cat.name
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery
              .filter((item) => galleryCategoryFilter === "All" || item.category_name === galleryCategoryFilter)
              .map((item) => (
                <div key={item.id} className="dashboard-card overflow-hidden">
                  <div className="relative aspect-square bg-gray-100">
                    {(item.image_url || item.image) ? (
                      <img
                        src={getImageUrl(item.image_url || item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      <span className={`badge ${item.is_active ? 'badge-success' : 'badge-danger'} shadow-sm`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {item.category_name && (
                        <span className="badge badge-info text-[10px] bg-blue-700 text-white shadow-sm font-semibold">
                          {item.category_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    {item.caption && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.caption}</p>
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

      {/* Partners Tab */}
      {activeTab === "partners" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {partners.map((partner) => (
              <div key={partner.id} className="dashboard-card overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-28 bg-slate-50 border-b border-gray-100 p-4 flex items-center justify-center relative">
                    {(partner.logo_url || partner.logo) ? (
                      <img
                        src={getImageUrl(partner.logo_url || partner.logo)}
                        alt={partner.name}
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <GlobeAltIcon className="h-12 w-12 text-gray-400" />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`badge ${partner.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {partner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-900">{partner.name}</h4>
                    </div>
                    <span className="badge badge-info text-xs mt-1 inline-block">
                      {partner.category || "Corporate Partner"}
                    </span>
                    {partner.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{partner.description}</p>
                    )}
                    {partner.website_url && (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-2 flex items-center gap-1"
                      >
                        <LinkIcon className="h-3 w-3" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-4 pt-0 border-t border-gray-100 flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">Order: {partner.display_order}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(partner)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(partner.id, 'partner')}
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
          {partners.length === 0 && (
            <div className="text-center py-12">
              <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No trusted partners found. Add your first partner!</p>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">{getModalTitle()}</h3>
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
                        className="max-h-48 rounded-lg mx-auto object-contain"
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
                      <p className="text-sm text-gray-700 font-medium">Click to upload photo</p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
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
                      Choose Photo
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Deluxe Presidential Suite"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {showNewCategoryInput ? "Choose existing" : "+ New category"}
                    </button>
                  </div>
                  {showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Deluxe Suites"
                        className="input-field flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="btn-secondary text-xs px-3"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <select
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Category (Optional)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption / Description
                  </label>
                  <input
                    type="text"
                    value={galleryForm.caption}
                    onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                    className="input-field"
                    placeholder="Brief description of the room or facility"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={galleryForm.is_active}
                      onChange={(e) => setGalleryForm({ ...galleryForm, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Display Order:</label>
                    <input
                      type="number"
                      value={galleryForm.display_order}
                      onChange={(e) => setGalleryForm({ ...galleryForm, display_order: parseInt(e.target.value) || 0 })}
                      className="input-field w-20 py-1 text-sm"
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
                    {isSubmitting ? "Uploading..." : (editingItem ? "Update Photo" : "Upload Photo")}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "partners" && (
              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${partnerPreview ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}>
                  {partnerPreview ? (
                    <div className="relative">
                      <img
                        src={partnerPreview}
                        alt="Partner Logo Preview"
                        className="max-h-32 rounded-lg mx-auto object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPartnerPreview(null);
                          setPartnerFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium">Click to upload partner logo</p>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG, WEBP up to 5MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePartnerFileChange}
                    className="hidden"
                    id="partner-file-upload"
                  />
                  {!partnerPreview && (
                    <label
                      htmlFor="partner-file-upload"
                      className="inline-block mt-3 btn-secondary text-sm cursor-pointer"
                    >
                      Choose Logo
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Ethiopian Airlines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Category
                  </label>
                  <input
                    type="text"
                    value={partnerForm.category}
                    onChange={(e) => setPartnerForm({ ...partnerForm, category: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Airline Partner, Banking Partner, Corporate Sponsor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={partnerForm.website_url}
                    onChange={(e) => setPartnerForm({ ...partnerForm, website_url: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={partnerForm.description}
                    onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })}
                    className="input-field resize-none"
                    rows={2}
                    placeholder="Brief description or sponsorship collaboration details..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={partnerForm.is_active}
                      onChange={(e) => setPartnerForm({ ...partnerForm, is_active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Display Order:</label>
                    <input
                      type="number"
                      value={partnerForm.display_order}
                      onChange={(e) => setPartnerForm({ ...partnerForm, display_order: parseInt(e.target.value) || 0 })}
                      className="input-field w-20 py-1 text-sm"
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
                    {isSubmitting ? "Saving..." : (editingItem ? "Update Partner" : "Create Partner")}
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
