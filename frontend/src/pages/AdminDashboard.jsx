import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchAdminDesigns,
  createAdminDesign,
  updateAdminDesign,
  deleteAdminDesign,
  regenerateDesignAI,
  rebuildAllEmbeddings,
  fetchContactMessages,
  updateMessageStatus,
  deleteContactMessage,
  API_BASE_URL,
} from "../services/api";
import {
  LayoutDashboard,
  Layers,
  Mail,
  LogOut,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  MessageCircle,
  AlertTriangle,
  Upload,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [designs, setDesigns] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Delete confirm modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [designIdToDelete, setDesignIdToDelete] = useState(null);

  // Form states
  const [formFields, setFormFields] = useState({
    name: "",
    code: "",
    category: "2D Wall Panels",
    description: "",
    price: "",
    tags: "",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  // Load dashboard data on mount / tab switch
  const loadData = async () => {
    setLoading(true);
    try {
      const designData = await fetchAdminDesigns();
      setDesigns(designData);

      const messageData = await fetchContactMessages();
      setMessages(messageData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to fetch data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered designs list
  const filteredDesigns = designs.filter((design) => {
    const matchesSearch =
      design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || design.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Category counts for dashboard statistics cards
  const stats = {
    totalDesigns: designs.length,
    activeDesigns: designs.filter((d) => d.active).length,
    hiddenDesigns: designs.filter((d) => !d.active).length,
    aiReady: designs.filter((d) => d.aiStatus === "Ready").length,
    aiProcessing: designs.filter((d) => d.aiStatus === "Processing").length,
    aiFailed: designs.filter((d) => d.aiStatus === "Failed").length,
    wallPanels: designs.filter((d) => d.category === "2D Wall Panels").length,
    templeDesigns: designs.filter((d) => d.category === "Temple Designs")
      .length,
    customCnc: designs.filter((d) => d.category === "Custom CNC").length,
    woodenCrafts: designs.filter((d) => d.category === "Wooden Crafts").length,
    unreadMessages: messages.filter((m) => m.status === "unread").length,
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/admin/login");
  };

  // 1. ADD DESIGN FLOW
  const handleOpenAddModal = () => {
    setFormFields({
      name: "",
      code: "",
      category: "2D Wall Panels",
      description: "",
      price: "",
      tags: "",
    });
    setUploadFile(null);
    setUploadPreview("");
    setUploadProgress(0);
    setIsAddModalOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDesign = async (e) => {
    e.preventDefault();
    if (!formFields.name || !formFields.code || !formFields.category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!uploadFile && activeTab === "add") {
      toast.error("Please upload an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("name", formFields.name);
    formData.append("code", formFields.code);
    formData.append("category", formFields.category);
    formData.append("description", formFields.description);
    formData.append("price", formFields.price);
    formData.append("tags", formFields.tags);
    if (uploadFile) {
      formData.append("image", uploadFile);
    }

    setIsSaving(true);
    setUploadProgress(10); // start indicator

    try {
      if (isEditModalOpen && selectedDesign) {
        // Edit Design
        await updateAdminDesign(
          selectedDesign._id,
          formData,
          (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percent);
          },
        );
        toast.success(
          "Design updated. AI embedding recalculating in background.",
        );
      } else {
        // Create Design
        await createAdminDesign(formData, (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percent);
        });
        toast.success(
          "Design created. AI embedding calculating in background.",
        );
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      loadData(); // reload dashboard
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save design specifications.",
      );
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  // 2. EDIT DESIGN FLOW
  const handleOpenEditModal = (design) => {
    setSelectedDesign(design);
    setFormFields({
      name: design.name,
      code: design.code,
      category: design.category,
      description: design.description || "",
      price: design.price || "",
      tags: design.tags ? design.tags.join(", ") : "",
    });
    setUploadFile(null);
    setUploadPreview(
      design.imageUrl.startsWith("/uploads/")
        ? `http://localhost:5000${design.imageUrl}`
        : design.imageUrl,
    );
    setUploadProgress(0);
    setIsEditModalOpen(true);
  };

  // 3. TOGGLE VISIBILITY (HIDE / SHOW)
  const handleToggleActive = async (design) => {
    try {
      const newStatus = !design.active;
      const formData = new FormData();
      formData.append("active", newStatus);

      await updateAdminDesign(design._id, formData);
      toast.success(`Design set to ${newStatus ? "Visible" : "Hidden"}.`);
      loadData();
    } catch (err) {
      toast.error("Failed to change visibility setting.");
    }
  };

  // 4. REGENERATE SINGLE AI EMBEDDING
  const handleRegenerateAI = async (designId) => {
    const toastId = toast.loading("Regenerating AI similarity vector...");
    try {
      await regenerateDesignAI(designId);
      toast.success("Regeneration worker launched in background.", {
        id: toastId,
      });
      loadData();
    } catch (err) {
      toast.error("Regeneration command failed.", { id: toastId });
    }
  };

  // 5. BULK REINDEX EMBEDDINGS
  const handleBulkReindex = async () => {
    const confirm = window.confirm(
      "Are you sure you want to regenerate AI embeddings for all 48+ designs? This might load your system CPU for a minute.",
    );
    if (!confirm) return;

    const toastId = toast.loading(
      "Re-indexing database embeddings. Please wait...",
    );
    try {
      const response = await rebuildAllEmbeddings();
      toast.success(
        `Re-indexing completed. Success: ${response.success}, Failed: ${response.failed}`,
        { id: toastId, duration: 6000 },
      );
      loadData();
    } catch (err) {
      toast.error("Bulk re-indexing failed.", { id: toastId });
    }
  };

  // 6. DELETE DESIGN FLOW
  const handleOpenDeleteConfirm = (id) => {
    setDesignIdToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteDesign = async () => {
    if (!designIdToDelete) return;

    try {
      await deleteAdminDesign(designIdToDelete);
      toast.success("Design deleted successfully.");
      setIsDeleteOpen(false);
      setDesignIdToDelete(null);
      loadData();
    } catch (err) {
      toast.error("Failed to delete selected design.");
    }
  };

  // 7. INBOX MESSAGES ACTIONS
  const handleToggleMessageRead = async (message) => {
    const nextStatus = message.status === "unread" ? "read" : "unread";
    try {
      await updateMessageStatus(message._id, nextStatus);
      toast.success(`Message marked as ${nextStatus}`);
      loadData();
    } catch (err) {
      toast.error("Failed to update message status.");
    }
  };

  const handleToggleMessageReplied = async (message) => {
    const nextStatus = message.status === "replied" ? "read" : "replied";
    try {
      await updateMessageStatus(message._id, nextStatus);
      toast.success(`Message flagged as ${nextStatus}`);
      loadData();
    } catch (err) {
      toast.error("Failed to update flag.");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this client message permanently?")) return;

    try {
      await deleteContactMessage(id);
      toast.success("Message removed.");
      loadData();
    } catch (err) {
      toast.error("Failed to delete message.");
    }
  };

  const categories = [
    "2D Wall Panels",
    "Temple Designs",
    "Custom CNC",
    "Wooden Crafts",
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-400 shrink-0 flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 select-none">
            <svg
              className="w-7 h-7 text-brand-secondary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
              <circle
                cx="12"
                cy="12"
                r="1.5"
                className="fill-brand-secondary stroke-none"
              />
            </svg>
            <span className="font-extrabold text-lg tracking-tight text-white">
              3D<span className="text-brand-secondary ml-1">CNC</span>
            </span>
          </div>

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
            Navigation Menu
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-brand-primary text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("designs")}
              className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
                activeTab === "designs"
                  ? "bg-brand-primary text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Layers size={18} />
              <span>Designs Catalog ({designs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`flex items-center justify-between w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition ${
                activeTab === "messages"
                  ? "bg-brand-primary text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>Client Messages</span>
              </div>
              {stats.unreadMessages > 0 && (
                <span className="bg-red-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0">
                  {stats.unreadMessages}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Admin context footer */}
        <div className="mt-12 border-t border-slate-800 pt-6">
          <div className="text-xs text-slate-500 mb-2 truncate">
            Logged: <strong>{admin?.username}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-white text-sm font-semibold transition w-full py-2"
          >
            <LogOut size={16} />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 overflow-x-hidden">
        {/* Header toolbar */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-dark">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "designs" && "Designs Content Management"}
              {activeTab === "messages" && "Client Messages Inbox"}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {activeTab === "dashboard" &&
                "Visual analysis and summary totals."}
              {activeTab === "designs" &&
                "Upload, edit, delete CNC carving designs."}
              {activeTab === "messages" &&
                "Read and flag inquiries from customers."}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {activeTab === "designs" && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow hover:shadow-brand-primary/20 transition"
              >
                <Plus size={16} />
                <span>Add CNC Design</span>
              </button>
            )}

            <button
              onClick={handleBulkReindex}
              className="flex items-center gap-2 bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              title="Bulk Re-index Similarity Vectors"
            >
              <RefreshCw size={14} className="animate-pulse-slow" />
              <span>Bulk Re-index AI</span>
            </button>
          </div>
        </header>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
            <span className="text-sm font-semibold text-slate-400">
              Loading catalog modules...
            </span>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Total Designs
                      </span>
                      <span className="text-3xl font-extrabold text-brand-dark">
                        {stats.totalDesigns}
                      </span>
                    </div>
                    <div className="p-3 bg-brand-light text-brand-primary rounded-2xl">
                      <Layers size={22} />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Active Visible
                      </span>
                      <span className="text-3xl font-extrabold text-emerald-600">
                        {stats.activeDesigns}
                      </span>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                      <CheckCircle size={22} />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        AI Ready
                      </span>
                      <span className="text-3xl font-extrabold text-brand-secondary">
                        {stats.aiReady}
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50 text-brand-secondary rounded-2xl">
                      <Sparkles size={22} />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        New Messages
                      </span>
                      <span className="text-3xl font-extrabold text-red-500">
                        {stats.unreadMessages}
                      </span>
                    </div>
                    <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                      <Mail size={22} />
                    </div>
                  </div>
                </div>

                {/* Sub category tally */}
                <div>
                  <h3 className="text-xs font-extrabold text-slate-500 tracking-widest uppercase mb-4 pb-2 border-b border-slate-200">
                    Category Breakdowns
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <div className="text-2xl font-black text-brand-dark mb-1">
                        {stats.wallPanels}
                      </div>
                      <div className="text-xs font-bold text-slate-400">
                        2D Wall Panels
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <div className="text-2xl font-black text-brand-dark mb-1">
                        {stats.templeDesigns}
                      </div>
                      <div className="text-xs font-bold text-slate-400">
                        Temple Designs
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <div className="text-2xl font-black text-brand-dark mb-1">
                        {stats.customCnc}
                      </div>
                      <div className="text-xs font-bold text-slate-400">
                        Custom CNC
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
                      <div className="text-2xl font-black text-brand-dark mb-1">
                        {stats.woodenCrafts}
                      </div>
                      <div className="text-xs font-bold text-slate-400">
                        Wooden Crafts
                      </div>
                    </div>
                  </div>
                </div>

                {/* Embedding index stats */}
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex gap-4">
                    <AlertTriangle
                      size={24}
                      className="text-amber-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        AI Embeddings Engine Status
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3">
                        The AI Design Search matches visual profiles by
                        referencing stored vector embeddings. If any design
                        shows a "Failed" AI status in the tables below, it will
                        not appear in the image search results.
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-bold font-mono text-slate-600">
                        <span className="text-brand-secondary">
                          Ready: {stats.aiReady}
                        </span>
                        <span className="text-orange-500">
                          Processing: {stats.aiProcessing}
                        </span>
                        <span className="text-red-500">
                          Failed: {stats.aiFailed}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DESIGNS MANAGEMENT VIEW */}
            {activeTab === "designs" && (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden">
                {/* Search & filters toolbar */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3.5 top-2.5 text-slate-400 w-4.5 h-4.5" />
                    <input
                      type="text"
                      placeholder="Search name or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={14} className="text-slate-400" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary flex-grow sm:flex-grow-0"
                    >
                      <option value="All">All Categories</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <th className="py-4 px-6">Image</th>
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Code</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">AI Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
                      {filteredDesigns.map((design) => {
                        const imgSource = design.imageUrl.startsWith(
                          "/uploads/",
                        )
                          ? `http://localhost:5000${design.imageUrl}`
                          : design.imageUrl;
                        return (
                          <tr
                            key={design._id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            {/* Image */}
                            <td className="py-3 px-6">
                              <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-1 overflow-hidden">
                                <img
                                  src={imgSource}
                                  alt="Design thumbnail"
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            </td>
                            {/* Name */}
                            <td className="py-3 px-6 font-bold text-brand-dark max-w-[150px] truncate">
                              {design.name}
                            </td>
                            {/* Code */}
                            <td className="py-3 px-6 font-mono font-bold text-brand-primary">
                              {design.code}
                            </td>
                            {/* Category */}
                            <td className="py-3 px-6">{design.category}</td>
                            {/* Status */}
                            <td className="py-3 px-6">
                              <button
                                onClick={() => handleToggleActive(design)}
                                className={`flex items-center gap-1 font-bold py-1 px-2.5 rounded-full text-[10px] transition ${
                                  design.active
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {design.active ? (
                                  <Eye size={12} />
                                ) : (
                                  <EyeOff size={12} />
                                )}
                                <span>
                                  {design.active ? "Visible" : "Hidden"}
                                </span>
                              </button>
                            </td>
                            {/* AI Status */}
                            <td className="py-3 px-6">
                              <span
                                className={`inline-flex items-center gap-1 font-bold py-1 px-2.5 rounded-full text-[10px] ${
                                  design.aiStatus === "Ready"
                                    ? "bg-blue-50 text-brand-secondary"
                                    : design.aiStatus === "Processing"
                                      ? "bg-amber-50 text-amber-600"
                                      : "bg-red-50 text-red-500"
                                }`}
                              >
                                {design.aiStatus === "Ready" && (
                                  <CheckCircle size={10} />
                                )}
                                {design.aiStatus === "Processing" && (
                                  <Clock size={10} className="animate-spin" />
                                )}
                                {design.aiStatus === "Failed" && (
                                  <XCircle size={10} />
                                )}
                                <span>{design.aiStatus}</span>
                              </span>
                            </td>
                            {/* Actions */}
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditModal(design)}
                                  className="p-2 text-slate-500 hover:text-brand-primary hover:bg-slate-100 rounded-lg transition"
                                  title="Edit details"
                                >
                                  <Edit2 size={14} />
                                </button>

                                <button
                                  onClick={() => handleRegenerateAI(design._id)}
                                  className="p-2 text-slate-500 hover:text-brand-secondary hover:bg-slate-100 rounded-lg transition"
                                  title="Regenerate AI embedding"
                                >
                                  <RefreshCw size={14} />
                                </button>

                                <button
                                  onClick={() =>
                                    handleOpenDeleteConfirm(design._id)
                                  }
                                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                  title="Delete design"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredDesigns.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-slate-400 font-bold"
                          >
                            No designs matching the filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. CONTACT MESSAGES VIEW */}
            {activeTab === "messages" && (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
                      message.status === "unread"
                        ? "border-l-4 border-l-brand-primary border-slate-200"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-brand-dark">
                            {message.name}
                          </h4>
                          {message.status === "unread" && (
                            <span className="bg-red-500 text-white font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded">
                              NEW
                            </span>
                          )}
                          {message.status === "replied" && (
                            <span className="bg-green-500 text-white font-extrabold text-[8px] tracking-widest uppercase px-2 py-0.5 rounded">
                              REPLIED
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-400 text-xs mt-1.5 font-bold font-mono">
                          <span>Phone: {message.phone}</span>
                          {message.email && <span>Email: {message.email}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                        <Calendar size={12} />
                        <span>
                          {new Date(message.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-slate-600 text-xs leading-relaxed mb-6 font-medium bg-slate-50 p-4 rounded-2xl whitespace-pre-wrap">
                      {message.message}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Left: Quick Actions */}
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleToggleMessageRead(message)}
                          className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition ${
                            message.status === "unread"
                              ? "bg-brand-primary text-white hover:bg-brand-secondary"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Mark {message.status === "unread" ? "Read" : "Unread"}
                        </button>

                        <button
                          onClick={() => handleToggleMessageReplied(message)}
                          className={`text-xs font-bold py-1.5 px-3.5 rounded-xl transition ${
                            message.status === "replied"
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          {message.status === "replied"
                            ? "Replied"
                            : "Mark Replied"}
                        </button>
                      </div>

                      {/* Right: Delete */}
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition"
                        title="Delete inquiry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-bold shadow-sm">
                    Inbox empty. No customer messages.
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ========================================== */}
        {/* ADD / EDIT DESIGN MODAL */}
        {/* ========================================== */}
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition"
              >
                <XCircle size={18} />
              </button>

              <div className="p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-brand-dark mb-6">
                  {isEditModalOpen
                    ? "Edit Design Specifications"
                    : "Add New CNC Design"}
                </h3>

                <form onSubmit={handleSaveDesign} className="space-y-5">
                  {/* File Upload zone with preview */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                      Design Image *
                    </label>
                    <div className="flex items-center gap-4">
                      {uploadPreview ? (
                        <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img
                            src={uploadPreview}
                            alt="Image Preview"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
                          <Upload size={22} />
                        </div>
                      )}

                      <div className="flex-grow">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          id="modal-image-input"
                          className="hidden"
                          disabled={isSaving}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            document.getElementById("modal-image-input").click()
                          }
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl border border-slate-200 transition"
                        >
                          Choose Image File
                        </button>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          PNG, JPG, JPEG, or WEBP (Max 5MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upload progress indicator */}
                  {uploadProgress > 0 && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-primary h-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Name and Code */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                        Design Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lotus Frame"
                        value={formFields.name}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-primary focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                        Design Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TD013"
                        value={formFields.code}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            code: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-primary focus:bg-white transition uppercase font-mono"
                      />
                    </div>
                  </div>

                  {/* Category Dropdown and Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                        Category *
                      </label>
                      <select
                        value={formFields.category}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-primary focus:bg-white transition"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                        Price (INR, optional)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1800"
                        value={formFields.price}
                        onChange={(e) =>
                          setFormFields((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-primary focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Write dimensions, routing directions, default materials..."
                      value={formFields.description}
                      onChange={(e) =>
                        setFormFields((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-primary focus:bg-white transition resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="mandir, pooja, flower, 3d-relief"
                      value={formFields.tags}
                      onChange={(e) =>
                        setFormFields((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Modal Footer actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-100 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow hover:shadow-brand-primary/10 transition"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-t-transparent border-white" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Publish Design</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* ========================================== */}
        {isDeleteOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative">
              <div className="p-3 bg-red-50 text-red-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-base font-bold text-brand-dark mb-1">
                Confirm Design Deletion
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Are you sure you want to delete this CNC design? This action
                removes the visual file and vector embedding index permanently
                and cannot be undone.
              </p>

              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDesign}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg text-xs shadow hover:shadow-red-500/10 transition"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
