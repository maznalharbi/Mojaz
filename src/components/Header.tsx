import React, { useState } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import '../styles/Header.css';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userName, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: 'الرئيسية', icon: '🏠' },
    { label: 'الاعتراضات', icon: '⚠️' },
    { icon: '⚙️' , label: 'الإعدادات',  },
  ];

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Title */}
        <div className="header-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l8 4v8.82c0 4.52-3.07 8.76-7.5 9.82V4.18h-1v18.64C7.07 21.76 4 17.52 4 13V8.18l8-4z"/>
              <path d="M12 6C9.79 6 8 7.79 8 10s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
            </svg>
          </div>
          <div className="logo-text-container">
            <h1 className="logo-text">نظام موجّز+</h1>
            <p className="logo-subtitle">فريق صفّ</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <nav className="header-nav desktop-only">
          {menuItems.map((item) => (
            <button key={item.label} className="nav-item">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Section: User and Logout */}
        <div className="header-actions">
          <div className="user-info desktop-only">
            <div className="user-avatar">{userName.charAt(0)}</div>
            <span>{userName}</span>
          </div>

          <button onClick={onLogout} className="btn btn-logout">
            <LogOut size={18} />
            <span className="logout-text">تسجيل خروج</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="menu-toggle mobile-only"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="mobile-menu">
          <div className="mobile-menu-items">
            {menuItems.map((item) => (
              <button key={item.label} className="mobile-nav-item">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
