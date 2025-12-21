import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { SIDEBAR_GROUPS } from '../data';
import { useSelectedGuild } from '../context/SelectedGuildContext';

export default function Sidebar() {
  const { guilds, selectedGuild, selectedGuildId, selectGuild } = useSelectedGuild();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selectorRef = useRef(null);
  const inviteUrl =
    'https://discord.com/oauth2/authorize?client_id=1371993653060436029&permissions=8&integration_type=0&scope=bot+applications.commands';

  const renderGuildIcon = (guild) => {
    const icon = guild?.icon;
    if (typeof icon === 'string' && icon.startsWith('http')) {
      return <img src={icon} alt={`${guild?.name ?? 'Guild'} icon`} />;
    }
    return icon ?? '🛰️';
  };

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
      <div className="guild-selector" ref={selectorRef}>
        <button type="button" onClick={() => setSelectorOpen((prev) => !prev)}>
          <div className="guild-avatar" aria-hidden="true">
            {renderGuildIcon(selectedGuild)}
          </div>
          <div className={`active-guild-copy ${selectedGuild?.premium ? 'has-pill' : ''}`}>
            <span className="guild-name-line">{selectedGuild?.name ?? 'Select a server'}</span>
            {selectedGuild?.premium && <span className="pill">Premium</span>}
          </div>
          <span className={`chevron ${selectorOpen ? 'open' : ''}`} aria-hidden="true">
            ▾
          </span>
        </button>
        {selectorOpen && guilds.length > 0 && (
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
                    {renderGuildIcon(guild)}
                  </span>
                  <span className="guild-name">{guild.name}</span>
                  {guild.premium && <span className="pill">Premium</span>}
                </button>
              </li>
            ))}
            <li className="guild-selector__add">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(inviteUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                + Add another server
              </button>
            </li>
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
        <p>Need help? Join the support server and open a ticket.</p>
      </div>
    </aside>
  );
}
