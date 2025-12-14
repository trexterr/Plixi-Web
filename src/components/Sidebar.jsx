import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SIDEBAR_GROUPS } from '../data';
import { useSelectedGuild } from '../context/SelectedGuildContext';

export default function Sidebar() {
  const { guilds, selectedGuild, selectedGuildId, selectGuild } = useSelectedGuild();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (!selectorRef.current) return;
      if (!selectorRef.current.contains(event.target)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <aside className="dashboard-sidebar">
      <div className="brand">
        <div className="glyph">PX</div>
        <div>
          <strong>Plixi</strong>
          <small>Discord control tower</small>
        </div>
      </div>

      <div className="guild-selector" ref={selectorRef}>
        <button type="button" onClick={() => setSelectorOpen((prev) => !prev)}>
          <div className="guild-avatar" aria-hidden="true">
            {selectedGuild?.icon ?? '🛰️'}
          </div>
          <div>
            <p>{selectedGuild?.name ?? 'Select a server'}</p>
            <small>{selectedGuild?.vanity ?? '—'}</small>
          </div>
          <span className="chevron" aria-hidden="true">
            ▾
          </span>
        </button>
        {selectorOpen && (
          <ul>
            {guilds.map((guild) => (
              <li key={guild.id}>
                <button
                  type="button"
                  className={guild.id === selectedGuildId ? 'active' : ''}
                  onClick={() => {
                    selectGuild(guild.id);
                    setSelectorOpen(false);
                  }}
                >
                  <span className="guild-avatar" aria-hidden="true">
                    {guild.icon}
                  </span>
                  <span>{guild.name}</span>
                  {guild.premium && <span className="pill">Premium</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <nav className="sidebar-nav">
        {SIDEBAR_GROUPS.map((group) => (
          <div key={group.title} className="sidebar-group">
            <p>{group.title}</p>
            {group.items.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                end={item.path === '/app'}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="ghost-btn">
          + Add another server
        </button>
        <p>Need help? Our concierge team replies in under 5 minutes.</p>
      </div>
    </aside>
  );
}
