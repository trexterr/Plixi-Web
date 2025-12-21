import { useEffect, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { TOP_NAV_LINKS } from '../data';
import { useSelectedGuild } from '../context/SelectedGuildContext';
import plixiLogo from '../assets/PLIXI_OFFICIAL_PFP.png';
import { supabase } from '../lib/supabase';

export default function TopNavigation() {
  const { user } = useSelectedGuild();
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  const handleDiscordLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          scopes: 'identify guilds',
          redirectTo: `${window.location.origin}/auth`,
        },
      });
    } catch (error) {
      console.error('Discord login failed', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Discord logout failed', error);
    } finally {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (
        avatarButtonRef.current?.contains(event.target) ||
        dropdownRef.current?.contains(event.target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="top-nav">
      <Link to="/" className="brand-mark">
        <div className="glyph">
          <img src={plixiLogo} alt="Plixi logo" />
        </div>
        <div className="brand-copy">
          <strong>PLIXI</strong>
        </div>
      </Link>

      <nav className="top-nav-links">
        {TOP_NAV_LINKS.map((link) => (
          link.external ? (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ) : (
            <NavLink
              key={link.label}
              to={link.to}
              end={Boolean(link.end)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {link.label}
            </NavLink>
          )
        ))}
      </nav>

      <div className="top-nav-actions">
        <a
          href="https://discord.com/oauth2/authorize?client_id=1371993653060436029&permissions=8&integration_type=0&scope=bot+applications.commands"
          className="outline-btn"
          target="_blank"
          rel="noreferrer"
        >
          Invite
        </a>
        <Link to="/pricing" className="primary-btn">
          Premium
        </Link>
        {user ? (
          <div className="avatar-menu" ref={dropdownRef}>
            <button
              type="button"
              className={`avatar-chip${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen((prev) => !prev)}
              ref={avatarButtonRef}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <img src={user.avatar} alt={user.displayName} />
              <span>{user.displayName}</span>
              <span className="chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            {menuOpen && (
              <div className="avatar-dropdown">
                <button type="button" onClick={handleSignOut}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button type="button" className="outline-btn" onClick={handleDiscordLogin}>
            Login with Discord
          </button>
        )}
      </div>
    </header>
  );
}
