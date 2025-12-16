import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import ModuleCard from '../../components/ModuleCard';
import useGuildSettings from '../../hooks/useGuildSettings';

export default function GuildAuditPage() {
  const { guild, updateGuild, saveGuild, resetGuild, selectedGuild, lastSaved } = useGuildSettings();
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    if (resetting) return;
    setResetting(true);
    resetGuild('Guild dashboard reset to defaults', 'info');
    setTimeout(() => setResetting(false), 600);
  };

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Audit Logs, Billing & System"
        subtitle={`Keep ${selectedGuild?.name ?? 'your guild'} compliant, premium-ready, and localized.`}
        meta={<span className="status-pill">Audit</span>}
      />

      <div className="card-grid">
        <ModuleCard
          icon="🛰️"
          title="Audit log streams"
          description="Toggle which surfaces pipe into the log channel."
          status="Active"
        >
          {Object.entries(guild.auditLogs).map(([key, value]) => (
            <ToggleSwitch
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              checked={value}
              onChange={(next) =>
                updateGuild((prev) => ({
                  ...prev,
                  auditLogs: { ...prev.auditLogs, [key]: next },
                }))
              }
            />
          ))}
        </ModuleCard>

        <ModuleCard
          icon="💎"
          title="Premium & billing"
          description="Current tier, locks, and perks."
          status={guild.billing.plan}
        >
          <div className="plan-pill">{guild.billing.plan}</div>
          <p className="helper-text">Upgrade for animations, hero slots, and concierge support.</p>
          <div className="split">
            <div>
              <strong>Feature locks</strong>
              <ul>
                {guild.billing.featureLocks.map((lock) => (
                  <li key={lock}>{lock}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Perks</strong>
              <ul>
                {guild.billing.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="button-row">
            <button type="button" className="ghost-btn">
              Cancel plan
            </button>
            <button type="button" className="primary-btn">
              Upgrade plan
            </button>
          </div>
        </ModuleCard>

        <ModuleCard
          icon="🌐"
          title="System settings"
          description="Localization and timezone for scheduled drops."
          status="Active"
        >
          <label className="text-control">
            <span>Language</span>
            <select
              value={guild.system.language}
              onChange={(event) =>
                updateGuild((prev) => ({ ...prev, system: { ...prev.system, language: event.target.value } }))
              }
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Portuguese">Portuguese</option>
            </select>
          </label>
          <label className="text-control">
            <span>Timezone</span>
            <input
              value={guild.system.timezone}
              onChange={(event) => updateGuild((prev) => ({ ...prev, system: { ...prev.system, timezone: event.target.value } }))}
            />
          </label>
        </ModuleCard>
      </div>

      <section className="danger-zone-card">
        <div>
          <p className="eyebrow">Danger zone</p>
          <h3>Reset guild dashboard</h3>
          <p>Removes every custom payout, box, raffle, and permission override.</p>
        </div>
        <button type="button" className="danger-btn" onClick={handleReset} disabled={resetting}>
          {resetting ? 'Resetting…' : 'Reset everything'}
        </button>
      </section>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={() => saveGuild('Audit and billing saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
