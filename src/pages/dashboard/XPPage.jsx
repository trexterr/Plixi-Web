import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import SettingCard from '../../components/SettingCard';
import ToggleSwitch from '../../components/ToggleSwitch';
import SliderInput from '../../components/SliderInput';
import { useSelectedGuild } from '../../context/SelectedGuildContext';

export default function XPPage() {
  const { selectedGuild } = useSelectedGuild();
  const [xpSettings, setXpSettings] = useState({
    xpPerMessage: 15,
    xpPerVoiceMinute: 8,
    doubleWeekend: true,
    levelRoles: true,
    decayEnabled: false,
  });

  const handleChange = (field, value) => {
    setXpSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="XP Engine"
        title={`Progression tuning for ${selectedGuild?.name ?? 'your guild'}`}
        subtitle="Calibrate how members earn XP across chat, voice, raids, and limited events."
        meta={<span className="status-pill">{xpSettings.decayEnabled ? 'Decay active' : 'Stable XP'}</span>}
      />

      <div className="card-grid">
        <SettingCard title="Multipliers" description="Blended XP rates for typed messages and voice minutes.">
          <SliderInput
            label="XP per message"
            suffix="xp"
            min={1}
            max={50}
            value={xpSettings.xpPerMessage}
            onChange={(value) => handleChange('xpPerMessage', value)}
          />
          <SliderInput
            label="XP per voice minute"
            suffix="xp"
            min={1}
            max={25}
            value={xpSettings.xpPerVoiceMinute}
            onChange={(value) => handleChange('xpPerVoiceMinute', value)}
          />
        </SettingCard>

        <SettingCard title="Events" description="Boost grindy weekends or huge patch days.">
          <ToggleSwitch
            label="Double XP weekends"
            description="Automatically applies Friday 5pm → Monday 8am."
            checked={xpSettings.doubleWeekend}
            onChange={(value) => handleChange('doubleWeekend', value)}
          />
        </SettingCard>

        <SettingCard title="Level unlocks" description="Auto-sync prestige roles when members ding.">
          <ToggleSwitch
            label="Grant level roles"
            checked={xpSettings.levelRoles}
            onChange={(value) => handleChange('levelRoles', value)}
          />
          <p className="helper-text">Connect roles like @Veteran, @Elite, and @Mythic to milestones.</p>
        </SettingCard>

        <SettingCard title="Decay & seasons" description="Keep inactive members from dominating the leaderboard.">
          <ToggleSwitch
            label="Enable decay"
            description="Drops 5% of XP after 14 inactive days."
            checked={xpSettings.decayEnabled}
            onChange={(value) => handleChange('decayEnabled', value)}
          />
        </SettingCard>
      </div>

      <div className="preview-card">
        <div>
          <span>XP preview</span>
          <p>
            {xpSettings.xpPerMessage} XP / message • {xpSettings.xpPerVoiceMinute} XP / voice minute •{' '}
            {xpSettings.doubleWeekend ? 'Double XP weekends active' : 'Standard schedule'}
          </p>
        </div>
      </div>

      <div className="page-actions">
        <div>
          <span>Last synced</span>
          <strong>Live prototype</strong>
        </div>
        <button type="button" className="primary-btn" disabled>
          Connected via API
        </button>
      </div>
    </div>
  );
}
