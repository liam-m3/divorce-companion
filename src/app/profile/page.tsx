'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Profile, RelationshipType, Stage, Priority } from '@/types';
import {
  COUNTRY_OPTIONS,
  RELATIONSHIP_TYPE_OPTIONS,
  STAGE_OPTIONS,
  PRIORITY_OPTIONS,
} from '@/lib/onboarding-config';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import OptionCard from '@/components/onboarding/OptionCard';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [country, setCountry] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType | ''>('');
  const [stage, setStage] = useState<Stage | ''>('');
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [childrenCount, setChildrenCount] = useState<number | null>(null);
  const [childrenAges, setChildrenAges] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        const p = profile as Profile;
        setDisplayName(p.display_name || '');
        setCountry(p.country || '');
        setRelationshipType((p.relationship_type as RelationshipType) || '');
        setStage((p.stage as Stage) || '');
        setPriorities((p.priorities as Priority[]) || []);
        setHasChildren(p.has_children);
        setChildrenCount(p.children_count);
        setChildrenAges(p.children_ages || '');
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [router]);

  const togglePriority = (priority: Priority) => {
    if (priorities.includes(priority)) {
      setPriorities(priorities.filter((p) => p !== priority));
    } else {
      setPriorities([...priorities, priority]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          country,
          relationship_type: relationshipType,
          stage,
          priorities,
          has_children: hasChildren,
          children_count: hasChildren ? childrenCount : null,
          children_ages: hasChildren ? childrenAges : null,
        })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess('Profile updated successfully');
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setPasswordMessage('Please fill in both fields');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('Passwords do not match');
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMessage(error.message);
      } else {
        setPasswordMessage('Password updated successfully');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch {
      setPasswordMessage('An unexpected error occurred');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    // Sign out — actual account deletion requires a server-side admin call
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Edit Profile
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          {/* Display Name */}
          <Card className="p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Your Name</h2>
            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
            />
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Location</h2>
            <Select
              options={[...COUNTRY_OPTIONS]}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Select your country"
            />
          </Card>

          {/* Relationship Type */}
          <Card className="p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Relationship Status</h2>
            <div className="space-y-3">
              {RELATIONSHIP_TYPE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={relationshipType === option.value}
                  onClick={() => setRelationshipType(option.value as RelationshipType)}
                />
              ))}
            </div>
          </Card>

          {/* Stage */}
          <Card className="p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Where are you in the process?</h2>
            <div className="space-y-3">
              {STAGE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={stage === option.value}
                  onClick={() => setStage(option.value as Stage)}
                />
              ))}
            </div>
          </Card>

          {/* Priorities */}
          <Card className="p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Your Priorities</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Select all that apply</p>
            <div className="space-y-3">
              {PRIORITY_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={priorities.includes(option.value as Priority)}
                  onClick={() => togglePriority(option.value as Priority)}
                  type="checkbox"
                />
              ))}
            </div>
          </Card>

          {/* Children */}
          <Card className="p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Children</h2>
            <div className="space-y-3">
              <OptionCard
                label="Yes, I have children"
                selected={hasChildren === true}
                onClick={() => setHasChildren(true)}
              />
              <OptionCard
                label="No children"
                selected={hasChildren === false}
                onClick={() => setHasChildren(false)}
              />
            </div>

            {hasChildren && (
              <div className="space-y-4 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <Input
                  label="How many children?"
                  type="number"
                  min={1}
                  max={20}
                  value={childrenCount ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setChildrenCount(val ? parseInt(val, 10) : null);
                  }}
                  placeholder="Enter number"
                />
                <Input
                  label="What are their ages? (optional)"
                  type="text"
                  value={childrenAges}
                  onChange={(e) => setChildrenAges(e.target.value)}
                  placeholder="e.g., 5, 8, 12"
                />
              </div>
            )}
          </Card>

          {/* Messages */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={handleSave} isLoading={isSaving} className="flex-1">
              Save Changes
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>

          {/* Account Management */}
          <Card className="p-6">
            <h2 className="font-semibold text-zinc-900 dark:text-white mb-4">Change Password</h2>
            <div className="space-y-3">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
              />
              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.includes('successfully') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {passwordMessage}
                </p>
              )}
              <Button size="sm" onClick={handleChangePassword} isLoading={passwordSaving}>
                Update Password
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-red-200 dark:border-red-900/50">
            <h2 className="font-semibold text-red-600 dark:text-red-400 mb-2">Delete Account</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              This will sign you out. To permanently delete your data, please contact support.
            </p>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={handleDeleteAccount} className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30">
                  Yes, sign me out
                </Button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(true)} className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30">
                Delete Account
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
