import React, { useEffect, useRef } from 'react';
import { useUserStore } from '../store/userStore';
import { toast } from 'react-hot-toast';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile: () => void;
  position: { top: number; right: number };
}

export default function ProfileDropdown({ isOpen, onClose, onEditProfile, position }: ProfileDropdownProps) {
  const { user, signOut } = useUserStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        minWidth: '240px',
        padding: '16px',
        animation: 'dropdownFadeIn 0.15s ease-out',
        transformOrigin: 'top right'
      }}
    >
      {/* User Info Header */}
      <div style={{
        paddingBottom: '12px',
        marginBottom: '12px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{
              fontWeight: '600',
              color: '#1f2937',
              fontSize: '14px'
            }}>
              {user.name}
            </div>
            <div style={{
              color: '#6b7280',
              fontSize: '12px'
            }}>
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Edit Profile */}
        <button
          onClick={() => {
            onEditProfile();
            onClose();
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(59, 130, 246, 0.1)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
        >
          <span style={{ fontSize: '16px' }}>✏️</span>
          Edit Profile
        </button>

        {/* Settings (Future) */}
        <button
          onClick={() => {
            toast.info('Settings coming soon!');
            onClose();
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(59, 130, 246, 0.1)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
        >
          <span style={{ fontSize: '16px' }}>⚙️</span>
          Settings
        </button>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'rgba(0, 0, 0, 0.1)',
          margin: '8px 0'
        }}></div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#ef4444',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => (e.target as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'transparent'}
        >
          <span style={{ fontSize: '16px' }}>🚪</span>
          Logout
        </button>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes dropdownFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}