"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DynamicMap from "@/components/DynamicMap";
import { compressImage } from "@/lib/imageCompression";
import {
  Lock,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Settings as SettingsIcon,
  MapPin,
  X,
  AlertTriangle,
  Construction,
  LogOut,
  Inbox,
  Check,
  XCircle,
  Archive,
  Bell,
  Loader2,
} from "lucide-react";

interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  difficulty: string;
  approved?: boolean;
  archived?: boolean;
  uploader?: string | null;
  createdAt?: string;
}

interface QueueItem {
  id: number;
  locationId: number;
  scheduledDate: string;
  location: Location;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginErrorLoading] = useState(false);

  // Admin Panel Tabs
  const [activeTab, setActiveTab] = useState<"locations" | "queue" | "settings" | "submissions">("locations");

  // Data States
  const [locations, setLocations] = useState<Location[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [submissions, setSubmissions] = useState<Location[]>([]);

  // CRUD Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formName, setFormName] = useState("");
  const [formDifficulty, setFormDifficulty] = useState("easy");
  const [formLatitude, setFormLatitude] = useState("");
  const [formLongitude, setFormLongitude] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formExternalUrl, setFormExternalUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Queue Form State
  const [queueLocationId, setQueueLocationId] = useState("");
  const [queueDate, setQueueDate] = useState("");
  const [queueError, setQueueError] = useState("");
  const [queueSubmitting, setQueueSubmitting] = useState(false);

  // Append Queue State
  const [appendSubmitting, setAppendSubmitting] = useState(false);
  const [appendMessage, setAppendMessage] = useState("");
  const [appendError, setAppendError] = useState("");

  // Settings State
  const [settingsSaving, setSettingsSubmitting] = useState(false);
  const [ntfyTopicInput, setNtfyTopicInput] = useState("");
  const [testNotifSending, setTestNotifSending] = useState(false);
  const [testNotifStatus, setTestNotifStatus] = useState<{ success: boolean; msg: string } | null>(null);

  // Filter States
  const [locationFilter, setLocationFilter] = useState<"all" | "active" | "archived">("all");

  // Verify authentication on mount
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
          await loadDashboardData();
        }
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      const [locsRes, queueRes, settingsRes, subsRes] = await Promise.all([
        fetch("/api/locations"),
        fetch("/api/admin/queue"),
        fetch("/api/admin/settings"),
        fetch("/api/admin/submissions"),
      ]);

      if (locsRes.ok) setLocations(await locsRes.json());
      if (queueRes.ok) setQueue(await queueRes.json());
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings(sData);
        if (sData.ntfy_topic !== undefined) {
          setNtfyTopicInput(sData.ntfy_topic);
        }
      }
      if (subsRes.ok) setSubmissions(await subsRes.json());
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginErrorLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        setAuthenticated(true);
        await loadDashboardData();
      } else {
        const data = await res.json();
        setLoginError(data.error || "Login failed");
      }
    } catch {
      setLoginError("Failed to connect to authentication server");
    } finally {
      setLoginErrorLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        setAuthenticated(false);
        setUsername("");
        setPassword("");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Location Coordinate Picker click handler
  const handleFormMapClick = (lat: number, lng: number) => {
    setFormLatitude(lat.toFixed(6));
    setFormLongitude(lng.toFixed(6));
  };

  // Open Form for Adding
  const openAddModal = () => {
    setEditingLocation(null);
    setFormName("");
    setFormDifficulty("easy");
    setFormLatitude("");
    setFormLongitude("");
    setFormImageFile(null);
    setFormExternalUrl("");
    setFormError("");
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setFormName(loc.name);
    setFormDifficulty(loc.difficulty);
    setFormLatitude(loc.latitude.toString());
    setFormLongitude(loc.longitude.toString());
    setFormImageFile(null);
    setFormExternalUrl((loc.imageUrl.startsWith("/uploads/") || loc.imageUrl.startsWith("/api/uploads/") || loc.imageUrl.startsWith("/api/locations/")) ? "" : loc.imageUrl);
    setFormError("");
    setIsFormOpen(true);
  };

  // Submit Location Form (Create/Update)
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSubmitting(true);

    if (!formName || !formLatitude || !formLongitude || !formDifficulty) {
      setFormError("Please fill out all required fields.");
      setFormSubmitting(false);
      return;
    }

    if (!formImageFile && !formExternalUrl && !editingLocation) {
      setFormError("Please upload an image or provide an external image URL.");
      setFormSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", formName);
      formData.append("difficulty", formDifficulty);
      formData.append("latitude", formLatitude);
      formData.append("longitude", formLongitude);
      if (formImageFile) {
        // Compress image client-side to bypass payload size limits
        const compressedImage = await compressImage(formImageFile);
        formData.append("image", compressedImage);
      } else if (formExternalUrl) {
        formData.append("externalImageUrl", formExternalUrl);
      }

      const url = editingLocation ? `/api/locations/${editingLocation.id}` : "/api/locations";
      const method = editingLocation ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        setIsFormOpen(false);
        await loadDashboardData();
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to save location");
      }
    } catch {
      setFormError("Server connection error. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Location
  const handleDeleteLocation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this location? It will automatically cancel any daily calendar schedules associated with it.")) return;

    try {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete location");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete location");
    }
  };

  // Approve a pending submission
  const handleApproveSubmission = async (id: number) => {
    if (!confirm("Are you sure you want to approve this submitted landmark? It will immediately become live in the standard landmark pool.")) return;

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        await loadDashboardData();
      } else {
        alert("Failed to approve submission.");
      }
    } catch (err) {
      console.error(err);
      alert("Error approving submission.");
    }
  };

  // Reject a pending submission
  const handleRejectSubmission = async (id: number) => {
    if (!confirm("Are you sure you want to reject and delete this submission? This will completely delete the photo file from disk and cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadDashboardData();
      } else {
        alert("Failed to reject submission.");
      }
    } catch (err) {
      console.error(err);
      alert("Error rejecting submission.");
    }
  };

  // Submit Daily Queue Item
  const handleQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueueError("");
    setQueueSubmitting(true);

    if (!queueLocationId || !queueDate) {
      setQueueError("Please select a location and schedule date.");
      setQueueSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId: parseInt(queueLocationId),
          scheduledDateStr: queueDate,
        }),
      });

      if (res.ok) {
        setQueueLocationId("");
        setQueueDate("");
        await loadDashboardData();
      } else {
        const data = await res.json();
        setQueueError(data.error || "Failed to schedule queue slot");
      }
    } catch {
      setQueueError("Server communication error");
    } finally {
      setQueueSubmitting(false);
    }
  };

  // Delete Queue Slot
  const handleDeleteQueue = async (id: number) => {
    if (!confirm("Remove this scheduled location from the calendar?")) return;

    try {
      const res = await fetch(`/api/admin/queue?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete schedule");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete schedule");
    }
  };

  // Append All Active Unscheduled Locations to Daily Queue
  const handleAppendQueue = async () => {
    setAppendError("");
    setAppendMessage("");
    setAppendSubmitting(true);

    try {
      const res = await fetch("/api/admin/queue/append", {
        method: "POST",
      });

      const data = await res.json();
      if (res.ok) {
        setAppendMessage(data.message);
        await loadDashboardData();
      } else {
        setAppendError(data.error || "Failed to append locations");
      }
    } catch {
      setAppendError("Server communication error");
    } finally {
      setAppendSubmitting(false);
    }
  };

  // Update Settings (Toggles)
  const handleSettingToggle = async (key: string, currentValue: string) => {
    setSettingsSubmitting(true);
    const newValue = currentValue === "true" ? "false" : "true";

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue }),
      });

      if (res.ok) {
        await loadDashboardData();
      } else {
        alert("Failed to update feature setting.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection error updating settings");
    } finally {
      setSettingsSubmitting(false);
    }
  };

  const handleSaveNtfyTopic = async () => {
    setSettingsSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "ntfy_topic", value: ntfyTopicInput.trim() }),
      });

      if (res.ok) {
        setTestNotifStatus({ success: true, msg: "Notification topic saved!" });
        await loadDashboardData();
      } else {
        setTestNotifStatus({ success: false, msg: "Failed to save notification topic." });
      }
    } catch (err) {
      console.error(err);
      setTestNotifStatus({ success: false, msg: "Connection error saving topic." });
    } finally {
      setSettingsSubmitting(false);
    }
  };

  const handleSendTestNotification = async () => {
    setTestNotifSending(true);
    setTestNotifStatus(null);
    try {
      const res = await fetch("/api/admin/test-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: ntfyTopicInput.trim() || undefined }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestNotifStatus({ success: true, msg: "Test notification sent! Check your phone." });
      } else {
        setTestNotifStatus({ success: false, msg: data.error || "Failed to send test notification." });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Connection error.";
      setTestNotifStatus({ success: false, msg: errorMsg });
    } finally {
      setTestNotifSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
        <div className="glass-card max-w-sm w-full p-8 rounded-2xl flex flex-col items-center gap-4 text-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
          <h2 className="text-lg font-bold">Querying Admin State...</h2>
        </div>
      </div>
    );
  }

  // RENDER LOGIN SCREEN IF NOT AUTHENTICATED
  if (!authenticated) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-950/40">
        <div className="max-w-md w-full glass-card rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-10 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-orange-500 p-3.5 rounded-2xl text-white shadow-lg">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black mt-2">Admin Portal</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              Provide credentials to access admin panel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="admin"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900 border border-gray-200 dark:border-white/10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 text-white font-extrabold text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-500/15 flex items-center justify-center gap-1.5"
            >
              {loginLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Authenticate"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // RENDER ADMIN DASHBOARD IF AUTHENTICATED
  return (
    <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-8 flex flex-col gap-6">
      {/* Dashboard Header */}
      <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500 dark:text-blue-400">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black">UFGuessr Management Console</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Role: Secure Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-red-500 font-bold text-xs uppercase tracking-wider glass hover:bg-red-500/10 transition-colors border border-red-500/25"
        >
          <LogOut className="h-4 w-4" /> End Session
        </button>
      </div>

      {/* Tabs Toggles */}
      <div className="flex border-b border-gray-200 dark:border-white/10 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("locations")}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "locations"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <MapPin className="h-4 w-4" /> Locations ({locations.length})
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "queue"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Calendar className="h-4 w-4" /> Daily Calendar Queue
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "settings"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Construction className="h-4 w-4" /> Feature Controls
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "submissions"
              ? "border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          <Inbox className="h-4 w-4" /> User Submissions ({submissions.length})
        </button>
      </div>

      {/* TAB CONTENT: LOCATIONS CRUD */}
      {activeTab === "locations" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-1">
            <div>
              <h2 className="text-lg font-extrabold">Active Campus Locations</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage standard landmarks pool</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Toggles */}
              <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-white/5">
                <button
                  onClick={() => setLocationFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    locationFilter === "all"
                      ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  All ({locations.length})
                </button>
                <button
                  onClick={() => setLocationFilter("active")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    locationFilter === "active"
                      ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Active ({locations.filter(l => !l.archived).length})
                </button>
                <button
                  onClick={() => setLocationFilter("archived")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    locationFilter === "archived"
                      ? "bg-white dark:bg-slate-800 shadow text-blue-600 dark:text-blue-400"
                      : "text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  Archived ({locations.filter(l => l.archived).length})
                </button>
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
              >
                <Plus className="h-4 w-4" /> Add Landmark
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations
              .filter((loc) => {
                if (locationFilter === "active") return !loc.archived;
                if (locationFilter === "archived") return loc.archived;
                return true;
              })
              .map((loc) => (
                <div
                  key={loc.id}
                  className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col shadow-lg group hover:scale-[1.01] transition-transform duration-200"
                >
                  {/* Location Image */}
                  <div className="relative h-44 bg-gray-200 dark:bg-gray-800 border-b border-white/10">
                    <Image
                      src={loc.imageUrl}
                      alt={loc.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded shadow ${
                        loc.difficulty === "easy"
                          ? "bg-emerald-500 text-white"
                          : loc.difficulty === "medium"
                          ? "bg-yellow-500 text-slate-900"
                          : "bg-red-500 text-white"
                      }`}>
                        {loc.difficulty}
                      </span>
                      {loc.archived && (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded shadow bg-blue-600 text-white flex items-center gap-1">
                          <Archive className="h-2.5 w-2.5" /> Archived
                        </span>
                      )}
                    </div>
                  </div>

                {/* Info and action buttons */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-extrabold text-base truncate" title={loc.name}>{loc.name}</h3>
                    <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 pl-0.5">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      Lat: {loc.latitude.toFixed(4)}, Lng: {loc.longitude.toFixed(4)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3">
                    <button
                      onClick={() => openEditModal(loc)}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Modify
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(loc.id)}
                      className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: DAILY CALENDAR QUEUE */}
      {activeTab === "queue" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduling Column */}
          <div className="flex flex-col gap-5">
            {/* Scheduling Form */}
            <div className="glass-card p-5 rounded-2xl h-fit border border-white/10 shadow-lg flex flex-col gap-4">
              <h2 className="font-extrabold text-lg flex items-center gap-1.5">
                <Calendar className="h-5 w-5 text-blue-500" /> Schedule Landmark
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Assign locations to future dates</p>

              <form onSubmit={handleQueueSubmit} className="flex flex-col gap-3 border-t border-white/5 pt-3">
                {queueError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                    {queueError}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Select Landmark</label>
                  <select
                    required
                    value={queueLocationId}
                    onChange={(e) => setQueueLocationId(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-white/10 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="" className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white">-- Choose location --</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white">
                        {loc.name} ({loc.difficulty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    value={queueDate}
                    onChange={(e) => setQueueDate(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-white/10 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={queueSubmitting}
                  className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  {queueSubmitting ? "Scheduling..." : "Schedule Slot"}
                </button>
              </form>
            </div>

            {/* Quick Actions / Auto-Append */}
            <div className="glass-card p-5 rounded-2xl h-fit border border-white/10 shadow-lg flex flex-col gap-3">
              <h2 className="font-extrabold text-lg flex items-center gap-1.5">
                <Plus className="h-5 w-5 text-orange-500" /> Quick Actions
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 -mt-2 leading-relaxed">
                Automatically schedule all approved locations that are not already in the daily calendar to consecutive future slots.
              </p>

              {appendMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-semibold">
                  {appendMessage}
                </div>
              )}
              {appendError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-semibold">
                  {appendError}
                </div>
              )}

              <button
                onClick={handleAppendQueue}
                disabled={appendSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                {appendSubmitting ? "Appending..." : "Auto-Append Active Locations"}
              </button>
            </div>
          </div>

          {/* Scheduled Calendar List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="font-extrabold text-lg">Scheduled Calendar queue</h2>
            <div className="flex flex-col gap-3">
              {queue.map((item) => {
                const dateObj = new Date(item.scheduledDate);
                const readableDate = dateObj.toLocaleDateString("en-US", {
                  timeZone: "UTC", // Avoid shifting date since we saved pure UTC
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={item.id}
                    className="glass-card p-4 rounded-xl flex items-center gap-4 hover:scale-[1.005] transition-transform duration-150 border border-white/5"
                  >
                    {/* Tiny thumbnail */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-800 border border-white/10">
                      <Image
                        src={item.location.imageUrl}
                        alt={item.location.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        {readableDate}
                      </span>
                      <h3 className="font-bold text-sm truncate">{item.location.name}</h3>
                    </div>

                    <button
                      onClick={() => handleDeleteQueue(item.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Delete Schedule Slot"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              {queue.length === 0 && (
                <div className="text-center py-12 glass-card rounded-2xl text-gray-500 dark:text-gray-400 font-medium">
                  The Daily Calendar has no scheduled landmarks. The daily tab will use fallback locations.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FEATURE CONTROLS */}
      {activeTab === "settings" && (
        <div className="max-w-xl flex flex-col gap-4">
          <h2 className="font-extrabold text-lg">Global Setting Toggles</h2>
          
          {/* Under Construction Toggle */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500/10 p-2.5 rounded-xl text-yellow-500 mt-0.5">
                <Construction className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-bold text-base">Under Construction (Daily Mode)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                  Enable this banner to lock access to the Daily Challenge tab.
                  Perfect while building backlog imagery or organizing queues.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => handleSettingToggle("daily_under_construction", settings.daily_under_construction || "false")}
              disabled={settingsSaving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                settings.daily_under_construction === "true" ? "bg-yellow-500" : "bg-gray-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.daily_under_construction === "true" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Limit Archive Mode to Past Daily Locations Toggle */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500 mt-0.5">
                <Archive className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-bold text-base">Limit Archive Mode to Past Daily Locations</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                  When enabled, Archive mode will only cycle through past daily challenge locations (archived locations). When disabled, it cycles through all approved locations.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => handleSettingToggle("exclude_queued_from_archive", settings.exclude_queued_from_archive !== "false" ? "true" : "false")}
              disabled={settingsSaving}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                settings.exclude_queued_from_archive !== "false" ? "bg-blue-500" : "bg-gray-300 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.exclude_queued_from_archive !== "false" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Instant Phone Push Notifications (ntfy.sh) */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500 mt-0.5">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-base">Instant Phone Notifications (ntfy.sh)</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Receive real-time push alerts on your phone whenever a user submits a landmark location!
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                ntfy Topic Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. ufguessr-submissions"
                  value={ntfyTopicInput}
                  onChange={(e) => setNtfyTopicInput(e.target.value)}
                  className="flex-1 bg-white/50 dark:bg-slate-800/50 border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  onClick={handleSaveNtfyTopic}
                  disabled={settingsSaving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> Save
                </button>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">📱 How to connect your phone:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <li>Install the free <strong>ntfy</strong> app on your iOS or Android phone.</li>
                  <li>Open the app, tap <strong>+ Subscribe to topic</strong>, and type: <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-300 font-mono">{ntfyTopicInput || "ufguessr-submissions"}</code></li>
                  <li>Click <strong>Send Test Notification</strong> below to verify!</li>
                </ol>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-black/5 dark:border-white/5 mt-1">
                <button
                  onClick={handleSendTestNotification}
                  disabled={testNotifSending || !ntfyTopicInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {testNotifSending ? "Sending..." : "Send Test Notification"}
                </button>

                {testNotifStatus && (
                  <span className={`text-xs font-semibold ${testNotifStatus.success ? "text-emerald-500" : "text-rose-500"}`}>
                    {testNotifStatus.msg}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: USER SUBMISSIONS REVIEW */}
      {activeTab === "submissions" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col pl-1">
            <h2 className="text-lg font-extrabold">Pending User Submissions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Review, approve, or reject community landmark photo suggestions</p>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-2xl border border-white/5 text-gray-500 dark:text-gray-400 font-medium">
              <Inbox className="h-10 w-10 text-gray-400 mx-auto mb-3 opacity-60" />
              There are no pending community photo submissions to review right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {submissions.map((sub) => {
                const uploadDate = sub.createdAt
                  ? new Date(sub.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Unknown Date";

                return (
                  <div
                    key={sub.id}
                    className="glass-card rounded-2xl overflow-hidden border border-white/5 flex flex-col shadow-lg group hover:scale-[1.01] transition-transform duration-200"
                  >
                    {/* Submission Image */}
                    <div className="relative h-44 bg-gray-200 dark:bg-gray-800 border-b border-white/10">
                      <Image
                        src={sub.imageUrl}
                        alt={sub.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded shadow ${
                          sub.difficulty === "easy"
                            ? "bg-emerald-500 text-white"
                            : sub.difficulty === "medium"
                            ? "bg-yellow-500 text-slate-900"
                            : "bg-red-500 text-white"
                        }`}>
                          {sub.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Content Detail */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-extrabold text-base tracking-tight leading-snug text-slate-800 dark:text-white">
                          {sub.name}
                        </h3>
                        
                        <div className="flex flex-col gap-1 text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <span className="font-bold text-gray-400">By:</span> {sub.uploader || "Anonymous"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-400">On:</span> {uploadDate}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-400">Loc:</span> {sub.latitude.toFixed(6)}, {sub.longitude.toFixed(6)}
                          </span>
                        </div>
                      </div>

                      {/* Moderation Controls */}
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3 mt-1">
                        <button
                          onClick={() => handleRejectSubmission(sub.id)}
                          className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
                        >
                          <XCircle className="h-4 w-4" /> Reject & Delete
                        </button>
                        <button
                          onClick={() => handleApproveSubmission(sub.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white text-xs font-bold transition-all border border-emerald-500/20"
                        >
                          <Check className="h-4 w-4" /> Approve Landmark
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CRUD MODAL FORM (ADD/EDIT LOCATION) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-4xl w-full rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xl p-5 sm:p-8 flex flex-col gap-4 max-h-[90vh] overflow-y-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {editingLocation ? "Modify Campus Landmark" : "Add New Campus Landmark"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLocationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Form inputs */}
              <div className="flex flex-col gap-3">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Landmark Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                    placeholder="e.g. Century Tower"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Difficulty</label>
                  <select
                    required
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-900 dark:text-white shadow-sm cursor-pointer"
                  >
                    <option value="easy" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Easy</option>
                    <option value="medium" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Medium</option>
                    <option value="hard" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Hard</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLatitude}
                      onChange={(e) => setFormLatitude(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                      placeholder="e.g. 29.6488"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLongitude}
                      onChange={(e) => setFormLongitude(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                      placeholder="e.g. -82.3433"
                    />
                  </div>
                </div>

                {/* Coordinate Info Banner */}
                <div className="text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-1.5 p-2.5 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-500/20 rounded-xl leading-relaxed shadow-sm">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span>
                    To choose coordinates, click directly on the UF campus map in the right-hand panel. It will autofill fields automatically!
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-slate-200 dark:border-white/10 pt-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Landmark Image</label>
                  
                  {/* File Upload Option */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Option A: Upload Image File (Max 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormImageFile(e.target.files?.[0] || null)}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-500/20 file:cursor-pointer cursor-pointer border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-slate-950/40 p-2.5 rounded-xl text-slate-900 dark:text-white shadow-sm"
                    />
                  </div>

                  {/* External URL Option */}
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Option B: Use External Image URL</span>
                    <input
                      type="url"
                      value={formExternalUrl}
                      onChange={(e) => setFormExternalUrl(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-4 border-t border-slate-200 dark:border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-blue-500/10"
                  >
                    {formSubmitting ? "Saving..." : "Save Landmark"}
                  </button>
                </div>
              </div>

              {/* Right Column: Coordinate picker map */}
              <div className="flex flex-col gap-2 min-h-[300px]">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pl-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-bounce" /> Click map to select coordinates
                </label>
                <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
                  <DynamicMap
                    onMapClick={handleFormMapClick}
                    userGuess={formLatitude && formLongitude ? [parseFloat(formLatitude), parseFloat(formLongitude)] : null}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
