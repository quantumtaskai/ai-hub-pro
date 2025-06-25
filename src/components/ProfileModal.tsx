import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  position?: { top: number; right: number };
}

export default function ProfileModal({ isOpen, onClose, userId, position }: ProfileModalProps) {
  const { refreshUser, signOut } = useUserStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Click outside detection for dropdown mode
  useEffect(() => {
    const isDropdown = position !== undefined;
    
    if (isDropdown && isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, onClose, position]);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      console.log('=== ProfileModal Loading ===');
      console.log('Loading profile for userId:', userId);
      
      supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading profile:', error);
            setError(error.message);
          } else if (data) {
            console.log('Loaded profile data:', data);
            console.log('Setting email to:', data.email);
            setName(data.name || '');
            setEmail(data.email || '');
          }
          setLoading(false);
        });
    }
    if (!isOpen) {
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, userId]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Debug: Log the current state values
      console.log('=== ProfileModal Save Debug ===');
      console.log('Raw state values:', { name, email });
      
      // Trim and validate email
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();
      
      console.log('Trimmed values:', { trimmedName, trimmedEmail });

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Get current user's email to compare
      const { data: currentUser } = await supabase.auth.getUser();
      const currentEmail = currentUser?.user?.email;

      console.log('Email update attempt:', {
        currentAuthEmail: currentEmail,
        newEmailFromInput: trimmedEmail,
        originalInputValue: email,
        emailChanged: trimmedEmail !== currentEmail,
        emailLength: email.length,
        trimmedEmailLength: trimmedEmail.length
      });

      // If email changed, update auth user first
      if (trimmedEmail !== currentEmail) {
        console.log('Updating auth email from', currentEmail, 'to', trimmedEmail);
        
        // Try to get more details about the current user
        const { data: userDetails } = await supabase.auth.getUser();
        console.log('Current user details:', userDetails.user);
        
        try {
          const { data, error: authError } = await supabase.auth.updateUser({
            email: trimmedEmail
          });
          
          console.log('Auth update response:', { data, error: authError });
          
          if (authError) {
            console.error('Auth update error:', authError);
            
            // If auth update fails, let's continue with just the users table update
            // and show a warning instead of failing completely
            console.warn('Skipping auth update due to error, updating only users table');
            setError(`Warning: Auth email update failed (${authError.message}), but profile will be updated. You may need to contact support to update your login email.`);
          } else {
            console.log('Auth email updated successfully');
          }
        } catch (err) {
          console.error('Unexpected error during auth update:', err);
          setError(`Warning: Auth email update failed, but profile will be updated. You may need to contact support to update your login email.`);
        }
      }

      // Update users table (continue even if auth update failed)
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: trimmedName, email: trimmedEmail })
        .eq('id', userId);
      
      if (updateError) {
        setError(`Profile update failed: ${updateError.message}`);
        setLoading(false);
        return;
      }

      console.log('Users table updated successfully');

      // Refresh user data in store
      await refreshUser();

      // Show appropriate success message
      if (trimmedEmail !== currentEmail) {
        if (error) {
          // Auth update failed but users table updated
          setSuccess('Profile updated in database, but login email update failed. Contact support if needed.');
        } else {
          // Both updates succeeded
          setSuccess('Profile updated! Please check your email to confirm the new email address.');
        }
      } else {
        setSuccess('Profile updated!');
      }
      setLoading(false);
    } catch (error: any) {
      setError(`Update failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onClose(); // Close modal after logout
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (!isOpen) return null;

  // Use dropdown positioning if provided, otherwise center modal
  const isDropdown = position !== undefined;

  return (
    <React.Fragment>
      {/* Backdrop only for non-dropdown mode */}
      {!isDropdown && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: 'rgba(0, 0, 0, 0.5)'
        }} onClick={onClose}></div>
      )}
      
      <div 
        ref={modalRef}
        style={{
          position: 'fixed',
          ...(isDropdown ? {
            top: position!.top,
            right: position!.right,
            zIndex: 1000
          } : {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000
          }),
          background: isDropdown ? 'rgba(255, 255, 255, 0.95)' : 'white',
          backdropFilter: isDropdown ? 'blur(20px)' : 'none',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: isDropdown ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
          padding: '24px',
          width: isDropdown ? '320px' : '100%',
          maxWidth: isDropdown ? '320px' : '400px'
        }}>
        <button
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#9ca3af'
          }}
          onClick={onClose}
          disabled={loading}
        >
          ×
        </button>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#1f2937'
        }}>
          Edit Profile
        </h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Name
          </label>
          <input
            type="text"
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Email
          </label>
          <input
            type="email"
            style={{
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
            value={email}
            onChange={e => {
              console.log('Email input changed:', e.target.value);
              setEmail(e.target.value);
            }}
            disabled={loading}
          />
        </div>
        {error && (
          <div style={{
            color: '#ef4444',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            color: '#10b981',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'background 0.2s ease'
            }}
            onClick={handleLogout}
            disabled={loading}
            onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#dc2626'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#ef4444'}
          >
            🚪 Logout
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#f3f4f6',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
} 