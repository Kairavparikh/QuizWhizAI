"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Folder, Plus, Edit2, Trash2, X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface FolderType {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

interface FolderManagerProps {
  onFolderSelect?: (folderId: number | null) => void;
  selectedFolderId?: number | null;
  showManagement?: boolean;
  requireSelection?: boolean; // If true, don't show "All Quizzes" option
}

export default function FolderManager({
  onFolderSelect,
  selectedFolderId,
  showManagement = true,
  requireSelection = false,
}: FolderManagerProps) {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    setSaving(true);
    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: folderName,
          description: folderDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFolders([data.folder, ...folders]);
        setShowCreateModal(false);
        setFolderName("");
        setFolderDescription("");
        if (onFolderSelect) {
          onFolderSelect(data.folder.id);
        }
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateFolder = async () => {
    if (!editingFolder || !folderName.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/folders/${editingFolder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: folderName,
          description: folderDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(folders.map((f) => (f.id === data.folder.id ? data.folder : f)));
        setEditingFolder(null);
        setFolderName("");
        setFolderDescription("");
      }
    } catch (error) {
      console.error("Error updating folder:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (folder: FolderType) => {
    setFolderToDelete(folder);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!folderToDelete) return;

    try {
      const response = await fetch(`/api/folders/${folderToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFolders(folders.filter((f) => f.id !== folderToDelete.id));
        if (selectedFolderId === folderToDelete.id && onFolderSelect) {
          onFolderSelect(null);
        }
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
    } finally {
      setFolderToDelete(null);
    }
  };

  const openEditModal = (folder: FolderType) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderDescription(folder.description || "");
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingFolder(null);
    setFolderName("");
    setFolderDescription("");
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">Loading folders...</div>
    );
  }

  return (
    <div>
      {/* Folder List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {requireSelection ? "Select Folder (Required)" : "Select Folder (Optional)"}
          </label>
          {showManagement && (
            <Button
              onClick={() => setShowCreateModal(true)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
          )}
        </div>

        <div className="space-y-1">
          {!requireSelection && (
            <button
              onClick={() => onFolderSelect && onFolderSelect(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedFolderId === null
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <span className="text-sm">All Quizzes</span>
              </div>
            </button>
          )}

          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                selectedFolderId === folder.id
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <button
                onClick={() => onFolderSelect && onFolderSelect(folder.id)}
                className="flex-1 text-left flex items-center gap-2"
              >
                <Folder className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{folder.name}</p>
                  {folder.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {folder.description}
                    </p>
                  )}
                </div>
              </button>

              {showManagement && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/folders/${folder.id}`);
                    }}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
                    title="View folder contents"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => openEditModal(folder)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(folder)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {folders.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-6 text-center">
            <Folder className="w-12 h-12 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {requireSelection ? "Create Your First Folder" : "No Folders Yet"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {requireSelection
                ? "Click 'New' above to create a folder and organize your quizzes by subject or topic."
                : "Create folders to organize your quizzes!"}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingFolder) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {editingFolder ? "Edit Folder" : "Create New Folder"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g., Machine Learning, Biology, etc."
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  placeholder="Brief description of this folder..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={closeModal} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
                  disabled={!folderName.trim() || saving}
                  className="flex-1"
                >
                  {saving ? "Saving..." : editingFolder ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Folder"
        message={`Are you sure you want to delete "${folderToDelete?.name}"? Quizzes in this folder will not be deleted, but they will be unlinked from the folder.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
