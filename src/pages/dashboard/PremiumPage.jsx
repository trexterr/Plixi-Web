import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader';
import SettingCard from '../../components/SettingCard';
import ToggleSwitch from '../../components/ToggleSwitch';
import ConfirmModal from '../../components/ConfirmModal';
import { useDashboardData } from '../../context/DashboardDataContext';
import { useSelectedGuild } from '../../context/SelectedGuildContext';
import { useToast } from '../../components/ToastProvider';

export default function PremiumPage() {
  const { activeRecord, updateSection, resetSection, saveSection } = useDashboardData();
  const { selectedGuild, isPremium } = useSelectedGuild();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const premium = activeRecord.settings.premium;
  const lastSaved = activeRecord.lastSaved.premium;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSave = () => {
    saveSection('premium');
    showToast('Premium preferences saved');
  };

  const handleReset = () => {
    resetSection('premium');
    setConfirmOpen(false);
    showToast('Premium settings reset', 'info');
  };

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Premium"
        title="Upsell like MEE6"
        subtitle="Toggle hero features, lock them for non-premium guilds, and showcase what upgrades unlock."
        meta={<span className={`status-pill ${isPremium ? 'success' : ''}`}>{isPremium ? 'Premium active' : 'Free plan'}</span>}
      />

      <div className="card-grid">
        <SettingCard
          title="AI Insights"
          description="Daily recap on engagement spikes, whales, and economy leaks."
          badge="Premium"
          locked={!isPremium}
        >
          <ToggleSwitch
            label="Enable AI reports"
            checked={premium.aiInsights}
            onChange={(value) => updateSection('premium', { aiInsights: value })}
            disabled={!isPremium}
          />
        </SettingCard>

        <SettingCard
          title="Branding control"
          description="Swap Plixi branding with your colors, logos, and footers."
          badge="Premium"
          locked={!isPremium}
        >
          <ToggleSwitch
            label="Hide Plixi watermark"
            checked={premium.brandingControl}
            onChange={(value) => updateSection('premium', { brandingControl: value })}
            disabled={!isPremium}
          />
        </SettingCard>

        <SettingCard
          title="Concierge team"
          description="Get access to human operators that help stage large events."
          badge="Invite-only"
          locked={!isPremium}
        >
          <ToggleSwitch
            label="Activate concierge support"
            checked={premium.concierge}
            onChange={(value) => updateSection('premium', { concierge: value })}
            disabled={!isPremium}
          />
        </SettingCard>

        <SettingCard
          title="Upgrade card"
          description="What non-premium guilds will see when they attempt to toggle the locked cards."
          subtle
        >
          <div className="premium-promo">
            <div>
              <strong>Plixi Premium</strong>
              <p>Unlock AI balancing, concierge support, and branded dashboards.</p>
              <ul>
                <li>Customizable commands</li>
                <li>Unlimited logs</li>
                <li>Priority discord support</li>
              </ul>
            </div>
            <button type="button" className="primary-btn" disabled={isPremium} onClick={() => navigate('/pricing')}>
              {isPremium ? 'Already upgraded' : 'Upgrade now'}
            </button>
          </div>
        </SettingCard>
      </div>

      <div className="page-actions">
        <div>
          <span>Last saved</span>
          <strong>{lastSaved ? new Date(lastSaved).toLocaleString() : 'Not yet saved'}</strong>
        </div>
        <div>
          <button type="button" className="ghost-btn" onClick={() => setConfirmOpen(true)}>
            Reset
          </button>
          <button type="button" className="primary-btn" onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmModal
          title="Reset premium settings?"
          description="This will toggle all premium features back to default values."
          confirmLabel="Reset"
          onConfirm={handleReset}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
