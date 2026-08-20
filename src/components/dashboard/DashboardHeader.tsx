"use client";

import { useState, useEffect } from "react";
import { Bars3Icon, BellIcon, UserCircleIcon, BanknotesIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useUIStore } from "@/lib/store/uiStore";
import { bankAPI } from "@/lib/api/endpoints";
import { toast } from "react-hot-toast";

interface BankDetails {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_code: string;
  instructions: string;
}

interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { toggleSidebar } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (showBankModal) {
      fetchBankDetails();
    }
  }, [showBankModal]);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await bankAPI.getPublicBankDetails();
      setBankDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch bank details:", error);
      toast.error("Failed to load bank details");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800 ml-2 lg:ml-0">
              {user?.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} Dashboard` : "Dashboard"}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Bank Details Button */}
            <button
              onClick={() => setShowBankModal(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors relative group"
              title="View Bank Details"
            >
              <BanknotesIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
            </button>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 ml-2">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.full_name || user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications dropdown */}
        {showNotifications && (
          <div className="absolute right-4 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3 border-b border-gray-200">
              <p className="font-semibold text-sm">Notifications</p>
            </div>
            <div className="p-4 text-center text-gray-500 text-sm">
              No new notifications
            </div>
          </div>
        )}
      </header>

      {/* Bank Details Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Bank Transfer Details</h3>
                  <p className="text-sm text-gray-500">Share these details with guests for payments</p>
                </div>
              </div>
              <button
                onClick={() => setShowBankModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : bankDetails ? (
              <div className="p-6 space-y-4">
                {/* Bank Name */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</p>
                      <p className="text-lg font-bold text-gray-900">{bankDetails.bank_name}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.bank_name, "Bank Name")}
                      className="text-xs bg-white/80 hover:bg-white px-3 py-1 rounded-lg text-blue-600 font-medium transition-colors"
                    >
                      {copiedField === "Bank Name" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Account Name */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</p>
                      <p className="text-base font-semibold text-gray-900">{bankDetails.account_name}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.account_name, "Account Name")}
                      className="text-xs bg-white hover:bg-gray-100 px-3 py-1 rounded-lg text-gray-600 font-medium transition-colors"
                    >
                      {copiedField === "Account Name" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Account Number */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Number</p>
                      <p className="text-xl font-mono font-bold text-green-700 tracking-wider">
                        {bankDetails.account_number}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bankDetails.account_number, "Account Number")}
                      className="text-xs bg-white/80 hover:bg-white px-3 py-1 rounded-lg text-green-600 font-medium transition-colors"
                    >
                      {copiedField === "Account Number" ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* SWIFT Code */}
                {bankDetails.swift_code && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">SWIFT Code</p>
                        <p className="text-base font-mono font-semibold text-gray-900">{bankDetails.swift_code}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankDetails.swift_code, "SWIFT Code")}
                        className="text-xs bg-white hover:bg-gray-100 px-3 py-1 rounded-lg text-gray-600 font-medium transition-colors"
                      >
                        {copiedField === "SWIFT Code" ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {bankDetails.instructions && (
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 text-lg">📋</span>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Instructions</p>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">{bankDetails.instructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const text = `Bank: ${bankDetails.bank_name}\nAccount: ${bankDetails.account_name}\nNumber: ${bankDetails.account_number}${bankDetails.swift_code ? `\nSWIFT: ${bankDetails.swift_code}` : ''}${bankDetails.instructions ? `\n\nInstructions: ${bankDetails.instructions}` : ''}`;
                        navigator.clipboard.writeText(text);
                        toast.success("All bank details copied!");
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Copy All Details
                    </button>
                    <button
                      onClick={() => setShowBankModal(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <BanknotesIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No bank details available</p>
                <p className="text-sm">Please contact your administrator</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
