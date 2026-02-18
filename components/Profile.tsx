import React, { useState, useEffect, useCallback, useRef, useId } from 'react';
import {
  User as UserIcon,
  Mail,
  CalendarDays,
  Clock,
  Pencil,
  Save,
  X,
  Download,
  Upload,
  HardDrive,
  Database,
  Shield,
  AlertCircle,
  Check,
} from 'lucide-react';
import { User } from '../types';
import hybridStorage from '../utils/hybridStorage';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface ProfileProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

interface StorageInfo {
  type: string;
  estimatedSize: string;
  features: string[];
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

type ToastType = 'success' | 'error';

interface ToastState {
  message: string;
  type: ToastType;
}

const Toast: React.FC<{ toast: ToastState; onDismiss: () => void }> = React.memo(
  ({ toast, onDismiss }) => {
    useEffect(() => {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg',
          toast.type === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
          toast.type === 'error' && 'border-red-200 bg-red-50 text-red-800',
        )}
      >
        {toast.type === 'success' ? (
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" focusable="false" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" focusable="false" />
        )}
        <span className="text-sm font-medium">{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-2 rounded-md p-1 transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
        </button>
      </div>
    );
  },
);

Toast.displayName = 'Toast';

const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(currentUser);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const autoId = useId();
  const storageHeadingId = `${autoId}-storage`;
  const exportHeadingId = `${autoId}-export`;
  const importHeadingId = `${autoId}-import`;

  useEffect(() => {
    const info = hybridStorage.getStorageInfo();
    setStorageInfo(info);
  }, []);

  useEffect(() => {
    setEditedUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (isEditing) {
      nameInputRef.current?.focus();
    }
  }, [isEditing]);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleSave = useCallback(async () => {
    if (!editedUser.name.trim()) {
      showToast('Name cannot be empty.', 'error');
      nameInputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    try {
      await hybridStorage.saveUser({
        ...editedUser,
        name: editedUser.name.trim(),
        password: 'placeholder',
      });
      onUpdateUser({ ...editedUser, name: editedUser.name.trim() });
      setIsEditing(false);
      showToast('Profile updated successfully.', 'success');
    } catch {
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [editedUser, onUpdateUser, showToast]);

  const handleCancel = useCallback(() => {
    setEditedUser(currentUser);
    setIsEditing(false);
  }, [currentUser]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedUser((prev) => ({ ...prev, name: e.target.value }));
    },
    [],
  );

  const exportData = useCallback(async () => {
    try {
      const userData = await hybridStorage.exportUserData(currentUser.id);
      if (!userData) {
        showToast('No data to export.', 'error');
        return;
      }

      const dataStr = JSON.stringify(userData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `devcareer-backup-${new Date().toISOString().split('T')[0]}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      showToast('Data exported successfully.', 'success');
    } catch {
      showToast('Failed to export data. Please try again.', 'error');
    }
  }, [currentUser.id, showToast]);

  const handleImport = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const success = await hybridStorage.importUserData(currentUser.id, content);

          if (success) {
            showToast('Data imported successfully. Reloading…', 'success');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            showToast('Invalid file format. Please select a valid DevCareer backup.', 'error');
          }
        } catch {
          showToast('Failed to import data. Please try again.', 'error');
        }
      };
      reader.readAsText(file);

      // Reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [currentUser.id, showToast],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditing && e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [isEditing, handleCancel],
  );

  const infoFields = [
    {
      label: 'Full Name',
      value: isEditing ? editedUser.name : currentUser.name,
      icon: UserIcon,
      editable: true,
    },
    {
      label: 'Email Address',
      value: currentUser.email,
      icon: Mail,
      editable: false,
    },
    {
      label: 'Account Created',
      value: formatDate(currentUser.createdAt),
      icon: CalendarDays,
      editable: false,
      dateTime: currentUser.createdAt,
    },
    {
      label: 'Last Login',
      value: formatDate(currentUser.lastLogin),
      icon: Clock,
      editable: false,
      dateTime: currentUser.lastLogin,
    },
  ];

  return (
    <div
      className="mx-auto w-full max-w-4xl space-y-8"
      onKeyDown={handleKeyDown}
    >
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings and data.
        </p>
      </div>

      {/* ── User Information ────────────────────────────────── */}
      <Card padding="none" as="section" aria-labelledby="user-info-heading">
        <CardContent>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
            <h2
              id="user-info-heading"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              User Information
            </h2>

            {!isEditing ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={isLoading}
                  onClick={handleSave}
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" focusable="false" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="px-6 py-6 sm:px-8">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {infoFields.map((field) => {
                const Icon = field.icon;
                const isName = field.editable;

                return (
                  <div key={field.label}>
                    {isName && isEditing ? (
                      <Input
                        ref={nameInputRef}
                        label={field.label}
                        value={editedUser.name}
                        onChange={handleNameChange}
                        required
                        autoComplete="name"
                        icon={
                          <Icon
                            className="h-4 w-4"
                            aria-hidden="true"
                            focusable="false"
                          />
                        }
                      />
                    ) : (
                      <>
                        <dt className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
                          <Icon
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                            focusable="false"
                          />
                          {field.label}
                        </dt>
                        <dd className="text-sm font-medium text-slate-900">
                          {field.dateTime ? (
                            <time dateTime={field.dateTime}>{field.value}</time>
                          ) : (
                            field.value
                          )}
                        </dd>
                      </>
                    )}
                  </div>
                );
              })}
            </dl>
          </div>
        </CardContent>
      </Card>

      {/* ── Data Management ─────────────────────────────────── */}
      <Card padding="none" as="section" aria-labelledby="data-mgmt-heading">
        <CardContent>
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <h2
              id="data-mgmt-heading"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              Data Management
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Storage details, backup, and restore.
            </p>
          </div>

          <div className="space-y-0 divide-y divide-slate-100">
            {/* Storage info */}
            {storageInfo && (
              <section
                className="px-6 py-6 sm:px-8"
                aria-labelledby={storageHeadingId}
              >
                <h3
                  id={storageHeadingId}
                  className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900"
                >
                  <Database
                    className="h-4 w-4 text-slate-400"
                    aria-hidden="true"
                    focusable="false"
                  />
                  Storage Information
                </h3>

                <div className="rounded-lg border border-slate-200 bg-slate-50/50">
                  <dl className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between px-4 py-3">
                      <dt className="flex items-center gap-2 text-sm text-slate-600">
                        <HardDrive
                          className="h-3.5 w-3.5 shrink-0 text-slate-400"
                          aria-hidden="true"
                          focusable="false"
                        />
                        Storage Type
                      </dt>
                      <dd className="text-sm font-semibold text-slate-900">
                        {storageInfo.type}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between px-4 py-3">
                      <dt className="flex items-center gap-2 text-sm text-slate-600">
                        <Database
                          className="h-3.5 w-3.5 shrink-0 text-slate-400"
                          aria-hidden="true"
                          focusable="false"
                        />
                        Estimated Size
                      </dt>
                      <dd className="text-sm font-semibold tabular-nums text-slate-900">
                        {storageInfo.estimatedSize}
                      </dd>
                    </div>

                    {storageInfo.features.length > 0 && (
                      <div className="px-4 py-3">
                        <dt className="mb-2 flex items-center gap-2 text-sm text-slate-600">
                          <Shield
                            className="h-3.5 w-3.5 shrink-0 text-slate-400"
                            aria-hidden="true"
                            focusable="false"
                          />
                          Features
                        </dt>
                        <dd>
                          <ul className="flex flex-wrap gap-2" aria-label="Storage features">
                            {storageInfo.features.map((feature, index) => (
                              <li
                                key={index}
                                className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200"
                              >
                                <Check
                                  className="h-3 w-3 shrink-0 text-emerald-500"
                                  aria-hidden="true"
                                  focusable="false"
                                />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </section>
            )}

            {/* Export / Import */}
            <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {/* Export */}
              <section
                className="px-6 py-6 sm:px-8"
                aria-labelledby={exportHeadingId}
              >
                <h3
                  id={exportHeadingId}
                  className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900"
                >
                  <Download
                    className="h-4 w-4 text-slate-400"
                    aria-hidden="true"
                    focusable="false"
                  />
                  Export Data
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-500">
                  Download all your companies and applications as a JSON backup file.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={exportData}
                  className="w-full"
                >
                  <Download className="h-4 w-4" aria-hidden="true" focusable="false" />
                  Export All Data
                </Button>
              </section>

              {/* Import */}
              <section
                className="px-6 py-6 sm:px-8"
                aria-labelledby={importHeadingId}
              >
                <h3
                  id={importHeadingId}
                  className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900"
                >
                  <Upload
                    className="h-4 w-4 text-slate-400"
                    aria-hidden="true"
                    focusable="false"
                  />
                  Import Data
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-500">
                  Restore your data from a previously exported backup file.
                </p>
                <label
                  className={cn(
                    'flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-5 text-center transition-colors',
                    'hover:border-blue-400 hover:bg-blue-50/50',
                    'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:ring-offset-2',
                  )}
                >
                  <Upload
                    className="h-6 w-6 text-slate-400"
                    aria-hidden="true"
                    focusable="false"
                  />
                  <span className="text-sm font-medium text-slate-600">
                    Choose backup file
                  </span>
                  <span className="text-xs text-slate-400">.json files only</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="sr-only"
                    aria-describedby={`${importHeadingId}-desc`}
                  />
                  <span id={`${importHeadingId}-desc`} className="sr-only">
                    Select a DevCareer JSON backup file to restore your data
                  </span>
                </label>
              </section>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toast notification */}
      {toast && <Toast toast={toast} onDismiss={dismissToast} />}
    </div>
  );
};

export default React.memo(Profile);