"use client";

import { useState, useEffect } from "react";
import { contentAPI, bankAPI } from "@/lib/api/endpoints";
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  UserGroupIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface HotelProfile {
  id: number;
  name: string;
  tagline: string;
  about_us: string;
  address: string;
  contact_phone: string;
  contact_email: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
}

interface BankDetails {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  instructions: string;
  created_at: string;
  updated_at: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "bank" | "staff">("profile");
  const [profile, setProfile] = useState<HotelProfile | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    swift_code: "",
    instructions: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    tagline: "",
    about_us: "",
    address: "",
    contact_phone: "",
    contact_email: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [profileRes, bankRes] = await Promise.all([
        contentAPI.getHotelProfile(),
        bankAPI.getBankDetails(),
      ]);

      const profileData = profileRes.data;
      setProfile(profileData);
      setProfileForm({
        name: profileData?.name || "",
        tagline: profileData?.tagline || "",
        about_us: profileData?.about_us || "",
        address: profileData?.address || "",
        contact_phone: profileData?.contact_phone || "",
        contact_email: profileData?.contact_email || "",
        facebook_url: profileData?.facebook_url || "",
        instagram_url: profileData?.instagram_url || "",
        twitter_url: profileData?.twitter_url || "",
        linkedin_url: profileData?.linkedin_url || "",
      });
      
      const bankData = bankRes.data;
      setBankDetails(bankData);
      setBankForm({
        bank_name: bankData.bank_name || "",
        account_name: bankData.account_name || "",
        account_number: bankData.account_number || "",
        swift_code: bankData.swift_code || "",
        instructions: bankData.instructions || "",
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await contentAPI.updateHotelProfile(profileForm);
      toast.success("Hotel profile updated successfully!");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await bankAPI.updateBankDetails(bankForm);
      toast.success("Bank details updated successfully!");
      setIsEditingBank(false);
      fetchSettings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update bank details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankInputChange = (field: keyof typeof bankForm, value: string) => {
    setBankForm(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Configure hotel profile, payments, and system preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <BuildingOfficeIcon className="h-4 w-4 inline mr-2" />
          Hotel Profile
        </button>
        <button
          onClick={() => setActiveTab("bank")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "bank"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <CreditCardIcon className="h-4 w-4 inline mr-2" />
          Bank Details
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "staff"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <UserGroupIcon className="h-4 w-4 inline mr-2" />
          Staff Settings
        </button>
      </div>

      {/* Hotel Profile Tab */}
      {activeTab === "profile" && (
        <div className="dashboard-card">
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Name *
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={profileForm.tagline}
                onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                className="input-field"
                placeholder="Luxury, Comfort, & Elegance in Every Stay"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Us
              </label>
              <textarea
                value={profileForm.about_us}
                onChange={(e) => setProfileForm({ ...profileForm, about_us: e.target.value })}
                className="input-field resize-none"
                rows={4}
                placeholder="Tell guests about your hotel..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                required
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.contact_phone}
                  onChange={(e) => setProfileForm({ ...profileForm, contact_phone: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.contact_email}
                  onChange={(e) => setProfileForm({ ...profileForm, contact_email: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Media URLs
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={profileForm.facebook_url}
                  onChange={(e) => setProfileForm({ ...profileForm, facebook_url: e.target.value })}
                  className="input-field"
                  placeholder="Facebook URL"
                />
                <input
                  type="url"
                  value={profileForm.instagram_url}
                  onChange={(e) => setProfileForm({ ...profileForm, instagram_url: e.target.value })}
                  className="input-field"
                  placeholder="Instagram URL"
                />
                <input
                  type="url"
                  value={profileForm.twitter_url}
                  onChange={(e) => setProfileForm({ ...profileForm, twitter_url: e.target.value })}
                  className="input-field"
                  placeholder="Twitter URL"
                />
                <input
                  type="url"
                  value={profileForm.linkedin_url}
                  onChange={(e) => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
                  className="input-field"
                  placeholder="LinkedIn URL"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Profile Settings"}
            </button>
          </form>
        </div>
      )}

      {/* Bank Details Tab */}
      {activeTab === "bank" && (
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex-1">
              <p className="text-sm text-yellow-800">
                ⚠️ These bank details are displayed to guests when they make online bookings.
                Please ensure they are accurate.
              </p>
            </div>
            <button
              onClick={() => setIsEditingBank(!isEditingBank)}
              className="ml-4 btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              {isEditingBank ? (
                <XMarkIcon className="h-4 w-4" />
              ) : (
                <PencilIcon className="h-4 w-4" />
              )}
              {isEditingBank ? "Cancel" : "Edit Bank Details"}
            </button>
          </div>

          <form onSubmit={handleBankUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name *
              </label>
              <input
                type="text"
                required
                value={bankForm.bank_name}
                onChange={(e) => handleBankInputChange('bank_name', e.target.value)}
                className={`input-field ${!isEditingBank ? 'bg-gray-50' : ''}`}
                disabled={!isEditingBank}
                placeholder="e.g., Commercial Bank of Ethiopia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                required
                value={bankForm.account_name}
                onChange={(e) => handleBankInputChange('account_name', e.target.value)}
                className={`input-field ${!isEditingBank ? 'bg-gray-50' : ''}`}
                disabled={!isEditingBank}
                placeholder="e.g., StayCraft Hotel & Bedroom Resort"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                required
                value={bankForm.account_number}
                onChange={(e) => handleBankInputChange('account_number', e.target.value)}
                className={`input-field ${!isEditingBank ? 'bg-gray-50' : ''}`}
                disabled={!isEditingBank}
                placeholder="e.g., 1000123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SWIFT Code
              </label>
              <input
                type="text"
                value={bankForm.swift_code}
                onChange={(e) => handleBankInputChange('swift_code', e.target.value)}
                className={`input-field ${!isEditingBank ? 'bg-gray-50' : ''}`}
                disabled={!isEditingBank}
                placeholder="e.g., CBETETAA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transfer Instructions
              </label>
              <textarea
                value={bankForm.instructions}
                onChange={(e) => handleBankInputChange('instructions', e.target.value)}
                className={`input-field resize-none ${!isEditingBank ? 'bg-gray-50' : ''}`}
                rows={3}
                disabled={!isEditingBank}
                placeholder="Instructions for guests to complete the transfer..."
              />
            </div>

            {isEditingBank && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Bank Details"}
              </button>
            )}

            {!isEditingBank && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 Click the "Edit Bank Details" button to make changes.
                </p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Staff Settings Tab */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          <div className="dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Staff Management</h3>
                <p className="text-sm text-gray-500">Manage staff roles and permissions</p>
              </div>
              <a href="/owner/users" className="btn-primary text-sm flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4" />
                Manage Staff
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="dashboard-card">
              <h4 className="font-medium text-gray-700 mb-3">Role Permissions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Admin</span>
                  <span className="text-green-600">Full System Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Owner</span>
                  <span className="text-green-600">Full Business Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Manager</span>
                  <span className="text-blue-600">Operational Management</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Receptionist</span>
                  <span className="text-gray-600">Front Desk Operations</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <h4 className="font-medium text-gray-700 mb-3">System Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Maintenance Mode</p>
                    <p className="text-xs text-gray-500">Temporarily disable bookings</p>
                  </div>
                  <button className="btn-secondary text-sm">Disable</button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Guest Notifications</p>
                    <p className="text-xs text-gray-500">SMS & Email alerts</p>
                  </div>
                  <span className="badge badge-success">Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Payment Verification</p>
                    <p className="text-xs text-gray-500">Require staff approval</p>
                  </div>
                  <span className="badge badge-success">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
