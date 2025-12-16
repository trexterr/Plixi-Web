import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import ToggleSwitch from '../../components/ToggleSwitch';
import SliderInput from '../../components/SliderInput';
import ModuleCard from '../../components/ModuleCard';
import NumberInput from '../../components/NumberInput';
import useGuildSettings from '../../hooks/useGuildSettings';

const STREAK_PROFILES = [
  { key: 'aggressive', label: 'Aggressive (×1.75)' },
  { key: 'regular', label: 'Regular (×1.3)' },
  { key: 'conservative', label: 'Conservative (×1.05)' },
];

const DEFAULT_JOB_NAMES = [
  'Nebula Courier',
  'Quantum Analyst',
  'Forge Tech',
  'Grav-Train Dispatcher',
  'Cryo Lab Assistant',
  'Stellar Cartographer',
  'Vault Guardian',
  'Energy Broker',
  'Aether Diver',
  'Flux Mechanic',
  'Celestial Archivist',
  'Pulse Medic',
  'Signal Whisperer',
  'Asteroid Prospector',
  'Synth Chef',
  'Hyperlane Pilot',
  'Dream Architect',
  'Holo Booth Host',
  'Biolum Farmer',
  'Atlas Keeper',
];

export default function GuildEconomyPage() {
  const { guild, updateGuild, saveGuild, selectedGuild, lastSaved } = useGuildSettings();
  const COOLDOWN_UNIT_FACTORS = { minutes: 1, hours: 60, days: 1440 };
  const workCooldownUnit = guild.work.cooldownUnit ?? 'minutes';
  const workCooldownValue = Math.max(
    1,
    Math.round(guild.work.cooldownMinutes / (COOLDOWN_UNIT_FACTORS[workCooldownUnit] || 1)),
  );

  const [editingJobs, setEditingJobs] = useState(false);

  const handleWorkCooldownValueChange = (value) => {
    const safeValue = Math.max(1, Number.isFinite(value) ? Math.floor(value) : 1);
    const minutes = safeValue * (COOLDOWN_UNIT_FACTORS[workCooldownUnit] || 1);
    updateGuild((prev) => ({ ...prev, work: { ...prev.work, cooldownMinutes: minutes } }));
  };

  const handleWorkCooldownUnitChange = (nextUnit) => {
    const factor = COOLDOWN_UNIT_FACTORS[nextUnit] || 1;
    const currentMinutes = guild.work.cooldownMinutes;
    const nextValue = Math.max(1, Math.round(currentMinutes / factor));
    updateGuild((prev) => ({
      ...prev,
      work: { ...prev.work, cooldownUnit: nextUnit, cooldownMinutes: nextValue * factor },
    }));
  };

  const [editingRoles, setEditingRoles] = useState(false);

  const addJob = () => {
    if (guild.work.jobs.length >= 300) return;
    updateGuild((prev) => ({
      ...prev,
      work: { ...prev.work, jobs: [...prev.work.jobs, { id: `job-${Date.now()}`, name: 'New job' }] },
    }));
  };

  const updateJob = (id, name) => {
    updateGuild((prev) => ({
      ...prev,
      work: { ...prev.work, jobs: prev.work.jobs.map((job) => (job.id === id ? { ...job, name } : job)) },
    }));
  };

  const removeJob = (id) => {
    updateGuild((prev) => ({
      ...prev,
      work: { ...prev.work, jobs: prev.work.jobs.filter((job) => job.id !== id) },
    }));
  };

  const clearJobPool = () => {
    updateGuild((prev) => ({
      ...prev,
      work: { ...prev.work, jobs: [] },
    }));
  };

  const resetJobPool = () => {
    const defaults = DEFAULT_JOB_NAMES.map((name, index) => ({ id: `default-job-${index}`, name }));
    updateGuild((prev) => ({
      ...prev,
      work: { ...prev.work, jobs: defaults },
    }));
  };

  const addRoleAmount = () => {
    updateGuild((prev) => ({
      ...prev,
      daily: {
        ...prev.daily,
        roleAmounts: [...prev.daily.roleAmounts, { id: `role-${Date.now()}`, role: '@Role', amount: 0 }],
      },
    }));
  };

  const handleRoleChange = (id, field, value) => {
    updateGuild((prev) => ({
      ...prev,
      daily: {
        ...prev.daily,
        roleAmounts: prev.daily.roleAmounts.map((role) => (role.id === id ? { ...role, [field]: value } : role)),
      },
    }));
  };

  const removeRoleAmount = (id) => {
    updateGuild((prev) => ({
      ...prev,
      daily: { ...prev.daily, roleAmounts: prev.daily.roleAmounts.filter((role) => role.id !== id) },
    }));
  };

  const availableJobs = guild.work.jobs.length;
  const jobLimit = 300;
  const roleCount = guild.daily.roleAmounts.length;

  if (editingRoles) {
    return (
      <div className="page-stack page-stack--compact guild-dashboard">
        <SectionHeader
          eyebrow="Guild Dashboard"
          title="Role Bonuses"
          subtitle="Reward premium tiers with custom bonus amounts."
        />

        <div className="job-editor__toolbar">
          <button type="button" className="ghost-btn" onClick={() => setEditingRoles(false)}>
            ← Back to daily rewards
          </button>
          <span className="status-pill">{roleCount} roles configured</span>
        </div>

        <div className="job-editor job-editor--roles">
          <div className="job-editor__top">
            <strong className="job-editor__title">Roles</strong>
            <div className="job-editor__top-right">
              <button type="button" className="ghost-btn ghost-btn--xs" onClick={addRoleAmount}>
                + Add role
              </button>
            </div>
          </div>
          <div className="job-editor__body">
            {roleCount ? (
              <ul className="job-list">
                {guild.daily.roleAmounts.map((role) => (
                  <li key={role.id}>
                    <select value={role.role} onChange={(event) => handleRoleChange(role.id, 'role', event.target.value)}>
                      <option value="@Role">@Role</option>
                      <option value="@VIP">@VIP</option>
                      <option value="@VIP+">@VIP+</option>
                      <option value="@Booster">@Booster</option>
                      <option value="@Member">@Member</option>
                    </select>
                    <NumberInput
                      min={0}
                      value={role.amount}
                      onChange={(value) => handleRoleChange(role.id, 'amount', value)}
                    />
                    <button type="button" onClick={() => removeRoleAmount(role.id)}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="helper-text">No bonuses configured yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (editingJobs) {
    return (
      <div className="page-stack guild-dashboard">
        <SectionHeader
          eyebrow="Guild Dashboard"
          title="Job Pool"
          subtitle="Curate up to 300 rotating jobs for /work."
          meta={<span className="status-pill">{availableJobs}/300 configured</span>}
        />

        <div className="job-editor">
          <div className="job-editor__top">
            <button type="button" className="ghost-btn ghost-btn--xs" onClick={() => setEditingJobs(false)}>
              ← Back to Work Command
            </button>
            <div className="job-editor__actions">
              <button type="button" className="ghost-btn ghost-btn--xs" onClick={addJob} disabled={availableJobs >= jobLimit}>
                + Add job
              </button>
              <button type="button" className="ghost-btn ghost-btn--xs" onClick={clearJobPool} disabled={!availableJobs}>
                Clear jobs
              </button>
              <button type="button" className="ghost-btn ghost-btn--xs" onClick={resetJobPool}>
                Reset to default
              </button>
            </div>
          </div>
          <div className="job-editor__body">
            {availableJobs ? (
              <div className="job-chip-grid">
                {guild.work.jobs.map((job) => (
                  <div className="job-chip" key={job.id}>
                    <input
                      value={job.name}
                      onChange={(event) => updateJob(job.id, event.target.value)}
                      className="job-chip__input"
                      size={Math.max(4, job.name.length)}
                    />
                    <button type="button" className="job-chip__remove" onClick={() => removeJob(job.id)}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="helper-text">No jobs configured. Add a few to get started.</p>
            )}
          </div>
          {availableJobs >= jobLimit && <p className="helper-text">Job pool full — remove entries before adding more.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack guild-dashboard">
      <SectionHeader
        eyebrow="Guild Dashboard"
        title="Economy & Currency"
        subtitle={`Configure how ${selectedGuild?.name ?? 'your guild'} mints Credits, daily rewards, and jobs.`}
        meta={<span className="status-pill">Economy</span>}
      />

      <div className="card-grid">
        <ModuleCard
          icon="💰"
          title="Currency"
          description="Name, decimals, and audit logging controls."
          status="Active"
        >
          <label className="text-control">
            <span>Currency name</span>
            <input
              value={guild.currency.name}
              onChange={(event) =>
                updateGuild((prev) => ({ ...prev, currency: { ...prev.currency, name: event.target.value } }))
              }
            />
          </label>
          <label className="text-control">
            <span>Starting balance</span>
            <NumberInput
              min={0}
              value={guild.currency.startingBalance}
              onChange={(value) =>
                updateGuild((prev) => ({
                  ...prev,
                  currency: { ...prev.currency, startingBalance: value },
                }))
              }
            />
          </label>
          <ToggleSwitch
            label="Enable decimals"
            checked={guild.currency.decimalsEnabled}
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, currency: { ...prev.currency, decimalsEnabled: value } }))
            }
          />
          <ToggleSwitch
            label="Currency audit log"
            description="Stream every payout, fine, and manual edit."
            checked={guild.currency.auditLog.enabled}
            onChange={(value) =>
              updateGuild((prev) => ({
                ...prev,
                currency: { ...prev.currency, auditLog: { ...prev.currency.auditLog, enabled: value } },
              }))
            }
          />
          {guild.currency.auditLog.enabled && (
            <label className="text-control">
              <span>Log channel</span>
              <input
                value={guild.currency.auditLog.channel}
                onChange={(event) =>
                  updateGuild((prev) => ({
                    ...prev,
                    currency: { ...prev.currency, auditLog: { ...prev.currency.auditLog, channel: event.target.value } },
                  }))
                }
              />
            </label>
          )}
        </ModuleCard>

        <ModuleCard
          icon="🎁"
          title="Daily Rewards"
          description="Base payouts, cooldowns, bonuses, and streaks."
          status={guild.daily.enabled ? 'Enabled' : 'Disabled'}
        >
          <ToggleSwitch
            label="Enable Daily Rewards"
            checked={guild.daily.enabled}
            onChange={(value) => updateGuild((prev) => ({ ...prev, daily: { ...prev.daily, enabled: value } }))}
          />
          <div className="input-row">
            <label className="text-control">
              <span>Base daily amount</span>
              <NumberInput
                min={0}
                value={guild.daily.baseAmount}
                onChange={(value) => updateGuild((prev) => ({ ...prev, daily: { ...prev.daily, baseAmount: value } }))}
              />
            </label>
            <label className="text-control">
              <span>Cooldown (hours)</span>
              <NumberInput
                min={1}
                value={guild.daily.cooldownHours}
                onChange={(value) =>
                  updateGuild((prev) => ({ ...prev, daily: { ...prev.daily, cooldownHours: value } }))
                }
              />
            </label>
          </div>
          <ToggleSwitch
            label="Enable streak bonus"
            description="Premium unlocks aggressive multipliers."
            checked={guild.daily.streak.enabled}
            className="toggle-switch--premium"
            onChange={(value) =>
              updateGuild((prev) => ({ ...prev, daily: { ...prev.daily, streak: { ...prev.daily.streak, enabled: value } } }))
            }
          />
          {guild.daily.streak.enabled && (
            <div className="input-row">
              <label className="text-control">
                <span>Profile</span>
                <select
                  value={guild.daily.streak.profile}
                  onChange={(event) =>
                    updateGuild((prev) => ({
                      ...prev,
                      daily: { ...prev.daily, streak: { ...prev.daily.streak, profile: event.target.value } },
                    }))
                  }
                >
                  {STREAK_PROFILES.map((profile) => (
                    <option key={profile.key} value={profile.key}>
                      {profile.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-control">
                <span>Bonus multiplier</span>
                <NumberInput
                  min={1}
                  step={0.05}
                  value={guild.daily.streak.multiplier}
                  onChange={(value) =>
                    updateGuild((prev) => ({
                      ...prev,
                      daily: { ...prev.daily, streak: { ...prev.daily.streak, multiplier: value } },
                    }))
                  }
                />
              </label>
            </div>
          )}
          <button type="button" className="primary-btn" onClick={() => setEditingRoles(true)}>
            Edit Role Bonuses
          </button>
        </ModuleCard>

        <ModuleCard icon="🛠️" title="Work Command" description="Cooldowns, payouts, and job pool access." status={guild.work.enabled ? 'Enabled' : 'Disabled'}>
          <ToggleSwitch
            label="Enable Work Command"
            checked={guild.work.enabled}
            onChange={(value) => updateGuild((prev) => ({ ...prev, work: { ...prev.work, enabled: value } }))}
          />
          <div className="input-row">
            <label className="text-control">
              <span>Cooldown</span>
              <div className="duration-input">
                <NumberInput min={1} value={workCooldownValue} onChange={handleWorkCooldownValueChange} />
                <select value={workCooldownUnit} onChange={(event) => handleWorkCooldownUnitChange(event.target.value)}>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </label>
            <label className="text-control">
              <span>Min pay</span>
              <NumberInput
                min={0}
                value={guild.work.payMin}
                onChange={(value) => updateGuild((prev) => ({ ...prev, work: { ...prev.work, payMin: value } }))}
              />
            </label>
            <label className="text-control">
              <span>Max pay</span>
              <NumberInput
                min={guild.work.payMin}
                value={guild.work.payMax}
                onChange={(value) => updateGuild((prev) => ({ ...prev, work: { ...prev.work, payMax: value } }))}
              />
            </label>
          </div>
          <div className="box-editor-launch">
            <button type="button" className="primary-btn" onClick={() => setEditingJobs(true)}>
              Edit Job Pool
            </button>
            <p className="helper-text">Open a focused view to manage the list of available jobs.</p>
          </div>
        </ModuleCard>

      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={() => saveGuild('Economy settings saved')}>
          Save changes
        </button>
      </div>
    </div>
  );
}
