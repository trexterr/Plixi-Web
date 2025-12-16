import { useMemo, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import SettingCard from '../../components/SettingCard';
import ToggleSwitch from '../../components/ToggleSwitch';
import NumberInput from '../../components/NumberInput';
import { useDashboardData } from '../../context/DashboardDataContext';
import { useSelectedGuild } from '../../context/SelectedGuildContext';
import { useToast } from '../../components/ToastProvider';

const RESET_PHRASE = 'RESET ECONOMY';

export default function EconomyPage() {
  const { activeRecord, updateSection, resetSection, saveSection } = useDashboardData();
  const { selectedGuild } = useSelectedGuild();
  const { showToast } = useToast();

  const economy = activeRecord.settings.economy;
  const lastSaved = activeRecord.lastSaved.economy;

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetInput, setResetInput] = useState('');

  const roleRewards = economy.dailyRoleRewards ?? [];

  const currencyPreview = useMemo(() => {
    const decimals = economy.decimalsEnabled ? 'Decimals enabled for precision payouts.' : 'Whole numbers only.';
    return `New members start with ${economy.startingBalance.toLocaleString()} ${economy.currencyName}. ${decimals}`;
  }, [economy.currencyName, economy.decimalsEnabled, economy.startingBalance]);

  const dailyPreview = useMemo(() => {
    if (!economy.dailyRewardsEnabled) {
      return 'Daily rewards are currently disabled.';
    }
    const streak = economy.streaksEnabled ? `Streak bonus x${economy.streakBonusMultiplier} after consecutive claims.` : 'No streak bonus applied.';
    return `Free users receive ${economy.dailyBaseAmount.toLocaleString()} ${economy.currencyName} every ${economy.dailyCooldownHours}h. ${streak}`;
  }, [
    economy.currencyName,
    economy.dailyBaseAmount,
    economy.dailyCooldownHours,
    economy.dailyRewardsEnabled,
    economy.streakBonusMultiplier,
    economy.streaksEnabled,
  ]);

  const workPreview = useMemo(() => {
    if (!economy.workEnabled) {
      return '/work is disabled for this server.';
    }
    return `Members earn between ${economy.workPayMin}-${economy.workPayMax} ${economy.currencyName} every ${economy.workCooldownMinutes}m.`;
  }, [
    economy.currencyName,
    economy.workCooldownMinutes,
    economy.workEnabled,
    economy.workPayMax,
    economy.workPayMin,
  ]);

  const handleFieldChange = (field, value) => {
    updateSection('economy', { [field]: value });
  };

  const addRoleReward = () => {
    const newReward = { id: `role-${Date.now()}`, role: '', amount: 0 };
    updateSection('economy', { dailyRoleRewards: [...roleRewards, newReward] });
  };

  const updateRoleReward = (id, field, value) => {
    updateSection('economy', {
      dailyRoleRewards: roleRewards.map((reward) =>
        reward.id === id ? { ...reward, [field]: value } : reward,
      ),
    });
  };

  const removeRoleReward = (id) => {
    updateSection('economy', { dailyRoleRewards: roleRewards.filter((reward) => reward.id !== id) });
  };

  const openResetModal = () => {
    setResetInput('');
    setShowResetModal(true);
  };

  const confirmReset = () => {
    resetSection('economy');
    setShowResetModal(false);
    setResetInput('');
    showToast('Economy reset to defaults', 'info');
  };

  const handleSave = () => {
    saveSection('economy');
    showToast('Economy settings saved');
  };

  return (
    <div className="page-stack economy-page">
      <SectionHeader
        eyebrow="Economy"
        title={`Economy settings for ${selectedGuild?.name ?? 'your server'}`}
        subtitle="Tune how members earn, claim, and grind currency. Everything here is frontend-only for demo purposes."
        meta={<span className="status-pill">{economy.economyEnabled ? 'Economy active' : 'Economy paused'}</span>}
      />

      <div className="card-grid economy-grid">
        <SettingCard
          title="Currency"
          description="Name, decimals, and starter balance for your in-server economy."
        >
          <ToggleSwitch
            label="Enable economy commands"
            description="Disabling hides /daily and /work across the dashboard."
            checked={economy.economyEnabled}
            onChange={(value) => handleFieldChange('economyEnabled', value)}
          />
          <div className="input-row">
            <label className="text-control">
              <span>Currency name</span>
              <input
                type="text"
                value={economy.currencyName}
                onChange={(event) => handleFieldChange('currencyName', event.target.value)}
              />
            </label>
            <label className="text-control">
              <span>Starting balance</span>
              <NumberInput min={0} value={economy.startingBalance} onChange={(value) => handleFieldChange('startingBalance', value)} />
            </label>
          </div>
          <ToggleSwitch
            label="Allow decimals"
            description="Enable when you want payouts like 10.5 Credits."
            checked={economy.decimalsEnabled}
            onChange={(value) => handleFieldChange('decimalsEnabled', value)}
          />
          <p className="helper-text">{currencyPreview}</p>
        </SettingCard>

        <SettingCard
          title="Daily Rewards"
          description="Configure how /daily behaves, including role multipliers and streaks."
        >
          <ToggleSwitch
            label="Enable daily rewards"
            description="When disabled, /daily returns a maintenance notice."
            checked={economy.dailyRewardsEnabled}
            onChange={(value) => handleFieldChange('dailyRewardsEnabled', value)}
          />
          <div className="input-row">
            <label className="text-control">
              <span>Base amount</span>
              <NumberInput min={0} value={economy.dailyBaseAmount} onChange={(value) => handleFieldChange('dailyBaseAmount', value)} />
            </label>
            <label className="text-control">
              <span>Cooldown (hours)</span>
              <NumberInput min={1} value={economy.dailyCooldownHours} onChange={(value) => handleFieldChange('dailyCooldownHours', value)} />
            </label>
          </div>
          <div className="list-editor">
            <div className="list-header">
              <div>
                <strong>Role-based amounts</strong>
                <p>Add boosted payouts per role.</p>
              </div>
              <button type="button" className="ghost-btn ghost-btn--small" onClick={addRoleReward}>
                + Add role bonus
              </button>
            </div>
            {roleRewards.length ? (
              <ul className="list-body">
                {roleRewards.map((reward) => (
                  <li key={reward.id} className="list-row">
                    <input
                      type="text"
                      value={reward.role}
                      placeholder="@Role"
                      onChange={(event) => updateRoleReward(reward.id, 'role', event.target.value)}
                    />
                    <NumberInput
                      min={0}
                      value={reward.amount}
                      onChange={(value) => updateRoleReward(reward.id, 'amount', value)}
                    />
                    <button
                      type="button"
                      className="list-icon-btn"
                      aria-label="Remove role bonus"
                      onClick={() => removeRoleReward(reward.id)}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="helper-text">No role bonuses yet.</p>
            )}
          </div>
          <ToggleSwitch
            label="Enable streak bonus"
            description="Reward consecutive /daily claims."
            checked={economy.streaksEnabled}
            className="toggle-switch--premium"
            onChange={(value) => handleFieldChange('streaksEnabled', value)}
          />
          {economy.streaksEnabled && (
            <label className="text-control">
              <span>Streak multiplier</span>
              <NumberInput
                min={1}
                step={0.05}
                value={economy.streakBonusMultiplier}
                onChange={(value) => handleFieldChange('streakBonusMultiplier', value)}
              />
            </label>
          )}
          <p className="helper-text">{dailyPreview}</p>
        </SettingCard>

        <SettingCard title="Work" description="Control /work payouts, cooldowns, and general tuning.">
          <ToggleSwitch
            label="Enable /work"
            description="When disabled members cannot grind jobs."
            checked={economy.workEnabled}
            onChange={(value) => handleFieldChange('workEnabled', value)}
          />
          <div className="input-row">
            <label className="text-control">
              <span>Cooldown (minutes)</span>
              <NumberInput min={1} value={economy.workCooldownMinutes} onChange={(value) => handleFieldChange('workCooldownMinutes', value)} />
            </label>
            <label className="text-control">
              <span>Min pay</span>
              <NumberInput min={0} value={economy.workPayMin} onChange={(value) => handleFieldChange('workPayMin', value)} />
            </label>
            <label className="text-control">
              <span>Max pay</span>
              <NumberInput min={economy.workPayMin} value={economy.workPayMax} onChange={(value) => handleFieldChange('workPayMax', value)} />
            </label>
          </div>
          <div className="helper-preview">
            <strong>Work preview</strong>
            <p>{workPreview}</p>
          </div>
        </SettingCard>
      </div>

      <section className="danger-zone-card">
        <div>
          <p className="eyebrow">Danger zone</p>
          <h3>Reset economy data</h3>
          <p>Wipes currency balances, streaks, and payouts back to defaults for this guild.</p>
        </div>
        <button type="button" className="danger-btn" onClick={openResetModal}>
          Reset economy
        </button>
      </section>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <button type="button" className="primary-btn" onClick={handleSave}>
          Save changes
        </button>
      </div>

      {showResetModal && (
        <div className="modal-backdrop">
          <div className="modal reset-modal">
            <h3>Reset economy?</h3>
            <p>This action cannot be undone. Type {RESET_PHRASE} to confirm.</p>
            <label className="text-control">
              <span>Confirmation</span>
              <input
                type="text"
                value={resetInput}
                onChange={(event) => setResetInput(event.target.value.toUpperCase())}
                placeholder={RESET_PHRASE}
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="danger-btn"
                disabled={resetInput !== RESET_PHRASE}
                onClick={confirmReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
