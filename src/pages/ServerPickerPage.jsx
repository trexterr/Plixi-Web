import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedGuild } from '../context/SelectedGuildContext';
import { supabase } from '../lib/supabase';

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1371993653060436029&permissions=8&integration_type=0&scope=bot+applications.commands';

const renderGuildIcon = (guild) => {
  const icon = guild?.icon;
  if (typeof icon === 'string' && icon.startsWith('http')) {
    return (
      <img
        src={icon}
        alt={`${guild?.name ?? 'Guild'} icon`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
      />
    );
  }
  const fallback = typeof icon === 'string' ? icon : '🛰️';
  return (
    <span style={{ fontSize: '24px', lineHeight: 1 }}>
      {fallback}
    </span>
  );
};

export default function ServerPickerPage({ sessionUser }) {
  const { guilds, selectGuild, selectedGuildId } = useSelectedGuild();
  const navigate = useNavigate();

  const sortedGuilds = useMemo(() => {
    return [...guilds].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [guilds]);

  const handleSelect = (guildId) => {
    selectGuild(guildId);
    navigate('/app');
  };

  const handleInvite = () => {
    window.open(INVITE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleLogin = async () => {
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

  return (
    <section
      className="server-picker"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 0',
        background: 'radial-gradient(circle at 20% 20%, rgba(124, 92, 255, 0.12), transparent 35%), radial-gradient(circle at 80% 40%, rgba(52, 194, 255, 0.15), transparent 30%), #0f1014',
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: 860,
          width: '100%',
          background: '#13151c',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 20px 70px rgba(0,0,0,0.45)',
          padding: '32px 40px 44px',
          borderRadius: '16px',
        }}
      >
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p className="eyebrow">Server access</p>
          <h1>Select a Discord server</h1>
          <p style={{ maxWidth: 520, margin: '8px auto 0' }}>
            These are the servers you can manage. Choose one to open the dashboard or invite Plixi to another server.
          </p>
        </header>

        {!sessionUser ? (
          <div className="server-picker__empty" style={{ textAlign: 'center', marginBottom: 28 }}>
            <p>Login with Discord to view and manage your servers.</p>
            <div className="server-picker__actions" style={{ textAlign: 'center', marginTop: 12 }}>
              <button type="button" className="primary-btn" onClick={handleLogin}>
                Login with Discord
              </button>
            </div>
          </div>
        ) : sortedGuilds.length ? (
          <ul
            className="server-picker__list"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 auto 28px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px 18px',
              maxWidth: 760,
            }}
          >
            {sortedGuilds.map((guild) => (
              <li key={guild.id}>
                <button
                  type="button"
                  className={`server-card${guild.id === selectedGuildId ? ' active' : ''}`}
                  onClick={() => handleSelect(guild.id)}
                  style={{
                    width: 150,
                    borderRadius: 14,
                    border: guild.id === selectedGuildId ? '2px solid #8ae2ff' : '1px solid rgba(255,255,255,0.08)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '14px 10px 18px',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                    boxShadow: guild.id === selectedGuildId ? '0 12px 30px rgba(138, 226, 255, 0.25)' : '0 10px 28px rgba(0,0,0,0.35)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#8ae2ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = guild.id === selectedGuildId ? '#8ae2ff' : '1px solid rgba(255,255,255,0.08)';
                  }}
                >
                  <span
                    className="server-card__icon"
                    aria-hidden="true"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {renderGuildIcon(guild)}
                  </span>
                  <span className="server-card__meta" style={{ textAlign: 'center', maxWidth: 160 }}>
                    <strong style={{ display: 'block', fontSize: 15 }}>{guild.name}</strong>
                    {guild.plan ? (
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: 6,
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.08)',
                          fontSize: 11,
                          letterSpacing: 0.3,
                          textTransform: 'uppercase',
                        }}
                      >
                        {guild.plan}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="server-picker__empty" style={{ textAlign: 'center', marginBottom: 28 }}>
            <p>No servers found for this account. Make sure your Discord user is added with manage access.</p>
          </div>
        )}

        <div className="server-picker__actions" style={{ textAlign: 'center' }}>
          <button type="button" className="primary-btn" onClick={handleInvite}>
            Invite Plixi to a server
          </button>
        </div>
      </div>
    </section>
  );
}
