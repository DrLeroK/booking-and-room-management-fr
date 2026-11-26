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
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { getImageUrl } from "@/lib/utils";

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

interface BankAccount {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_name?: string;
  swift_code?: string;
  qr_code?: string;
  qr_code_url?: string;
  is_active: boolean;
  display_order: number;
  instructions?: string;
  created_at?: string;
  updated_at?: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "bank" | "staff">("profile");
  const [profile, setProfile] = useState<HotelProfile | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountForm, setAccountForm] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
    branch_name: "",
    swift_code: "",
    instructions: "",
    display_order: 0,
    is_active: true,
  });
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);

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
      const [profileRes, bankRes, accountsRes] = await Promise.all([
        contentAPI.getHotelProfile(),
        bankAPI.getBankDetails().catch(() => ({ data: null })),
        bankAPI.getBankAccounts().catch(() => ({ data: { results: [] } })),
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

      if (bankRes.data) {
        setBankDetails(bankRes.data);
      }

      const accounts = accountsRes.data?.results || (Array.isArray(accountsRes.data) ? accountsRes.data : []);
      setBankAccounts(accounts);
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
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddAccountModal = () => {
    setEditingAccount(null);
    setAccountForm({
      bank_name: "",
      account_name: profile?.name || "StayCraft Hotel & Bedroom Resort",
      account_number: "",
      branch_name: "",
      swift_code: "",
      instructions: "Transfer total stay amount to the account above and upload payment screenshot.",
      display_order: bankAccounts.length,
      is_active: true,
    });
    setQrFile(null);
    setQrPreview(null);
    setIsBankModalOpen(true);
  };

  const openEditAccountModal = (acc: BankAccount) => {
    setEditingAccount(acc);
    setAccountForm({
      bank_name: acc.bank_name,
      account_name: acc.account_name,
      account_number: acc.account_number,
      branch_name: acc.branch_name || "",
      swift_code: acc.swift_code || "",
      instructions: acc.instructions || "",
      display_order: acc.display_order ?? 0,
      is_active: acc.is_active,
    });
    setQrFile(null);
    setQrPreview(acc.qr_code_url || acc.qr_code ? getImageUrl(acc.qr_code_url || acc.qr_code || "") : null);
    setIsBankModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("bank_name", accountForm.bank_name);
      formData.append("account_name", accountForm.account_name);
      formData.append("account_number", accountForm.account_number);
      if (accountForm.branch_name) formData.append("branch_name", accountForm.branch_name);
      if (accountForm.swift_code) formData.append("swift_code", accountForm.swift_code);
      if (accountForm.instructions) formData.append("instructions", accountForm.instructions);
      formData.append("display_order", String(accountForm.display_order));
      formData.append("is_active", String(accountForm.is_active));
      if (qrFile) {
        formData.append("qr_code", qrFile);
      }

      if (editingAccount) {
        await bankAPI.updateBankAccount(editingAccount.id, formData);
        toast.success("Bank account updated successfully!");
      } else {
        await bankAPI.createBankAccount(formData);
        toast.success("Bank account added successfully!");
      }

      setIsBankModalOpen(false);
      fetchSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to save bank account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAccountActive = async (acc: BankAccount) => {
    try {
      await bankAPI.updateBankAccount(acc.id, { is_active: !acc.is_active });
      toast.success(`Account marked as ${!acc.is_active ? "active" : "inactive"}`);
      fetchSettings();
    } catch {
      toast.error("Failed to update account status");
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bank account?")) return;
    try {
      await bankAPI.deleteBankAccount(id);
      toast.success("Bank account deleted successfully!");
      fetchSettings();
    } catch {
      toast.error("Failed to delete bank account");
    }
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hotel Bank Accounts</h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage accounts where guests send booking deposits (CBE, Telebirr, Awash, etc.).
              </p>
            </div>
            <button
              onClick={openAddAccountModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm transition"
            >
              <PlusIcon className="w-4 h-4" />
              Add Bank Account
            </button>
          </div>

          {bankAccounts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <CreditCardIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 text-base">No Bank Accounts Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Add your primary bank accounts or mobile money (Telebirr) so online guests can transfer payments.
              </p>
              <button
                onClick={openAddAccountModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
              >
                <PlusIcon className="w-4 h-4" />
                Add First Bank Account
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all space-y-4 ${
                    acc.is_active ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-base">{acc.bank_name}</h4>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            acc.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          {acc.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {acc.branch_name && (
                        <p className="text-xs text-slate-500 mt-0.5">Branch: {acc.branch_name}</p>
                      )}
                      <p className="text-xs font-medium text-slate-700 mt-0.5">
                        Holder: <span className="font-semibold text-slate-900">{acc.account_name}</span>
                      </p>
                    </div>

                    {(acc.qr_code_url || acc.qr_code) && (
                      <div className="p-1 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0">
                        <img
                          src={getImageUrl(acc.qr_code_url || acc.qr_code || "")}
                          alt="Bank QR Code"
                          className="w-14 h-14 object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Account Number
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {acc.account_number}
                      </span>
                    </div>
                    {acc.swift_code && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          SWIFT
                        </span>
                        <span className="font-mono text-xs font-medium text-slate-700">
                          {acc.swift_code}
                        </span>
                      </div>
                    )}
                  </div>

                  {acc.instructions && (
                    <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 italic">
                      {acc.instructions}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleToggleAccountActive(acc)}
                      className={`font-semibold transition ${
                        acc.is_active ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      {acc.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditAccountModal(acc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition font-medium"
                      >
                        <PencilIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition font-medium"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit Bank Account Modal */}
          {isBankModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
              <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingAccount ? "Edit Bank Account" : "Add New Bank Account"}
                  </h3>
                  <button
                    onClick={() => setIsBankModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAccount} className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Bank / Provider Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountForm.bank_name}
                      onChange={(e) => setAccountForm({ ...accountForm, bank_name: e.target.value })}
                      className="input-field text-slate-900 bg-white"
                      placeholder="e.g. Commercial Bank of Ethiopia (CBE), Telebirr, Awash Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={accountForm.account_name}
                      onChange={(e) => setAccountForm({ ...accountForm, account_name: e.target.value })}
                      className="input-field text-slate-900 bg-white"
                      placeholder="e.g. StayCraft Hotel & Bedroom Resort"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Account / Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={accountForm.account_number}
                        onChange={(e) => setAccountForm({ ...accountForm, account_number: e.target.value })}
                        className="input-field text-slate-900 bg-white font-mono"
                        placeholder="e.g. 1000123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Branch Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={accountForm.branch_name}
                        onChange={(e) => setAccountForm({ ...accountForm, branch_name: e.target.value })}
                        className="input-field text-slate-900 bg-white"
                        placeholder="e.g. Bole Medhanialem Branch"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        SWIFT / BIC Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={accountForm.swift_code}
                        onChange={(e) => setAccountForm({ ...accountForm, swift_code: e.target.value })}
                        className="input-field text-slate-900 bg-white font-mono"
                        placeholder="e.g. CBETETAA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={accountForm.display_order}
                        onChange={(e) => setAccountForm({ ...accountForm, display_order: Number(e.target.value) })}
                        className="input-field text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Transfer Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={accountForm.instructions}
                      onChange={(e) => setAccountForm({ ...accountForm, instructions: e.target.value })}
                      className="input-field text-slate-900 bg-white resize-none"
                      placeholder="e.g. Transfer the total stay amount and attach receipt screenshot."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Account QR Code Image (Optional)
                    </label>
                    <div className="flex items-center gap-4">
                      {qrPreview && (
                        <div className="p-1 border border-slate-200 rounded-xl bg-slate-50 shrink-0">
                          <img src={qrPreview} alt="QR Preview" className="w-16 h-16 object-contain rounded-lg" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setQrFile(file);
                            setQrPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="account_is_active"
                      checked={accountForm.is_active}
                      onChange={(e) => setAccountForm({ ...accountForm, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <label htmlFor="account_is_active" className="text-xs font-semibold text-slate-800">
                      Active (Display this account to online guests)
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBankModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-sm disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : editingAccount ? "Save Changes" : "Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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
