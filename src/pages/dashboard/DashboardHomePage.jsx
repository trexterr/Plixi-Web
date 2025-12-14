import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FEATURE_MODULES, FEATURE_SECTIONS } from '../../data';
import { useDashboardData } from '../../context/DashboardDataContext';
import { useSelectedGuild } from '../../context/SelectedGuildContext';
import { useToast } from '../../components/ToastProvider';
import SectionHeader from '../../components/SectionHeader';
import FeatureCard from '../../components/FeatureCard';

export default function DashboardHomePage() {
  const { activeRecord, updateSection } = useDashboardData();
  const { selectedGuild, isPremium } = useSelectedGuild();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const featureFlags = activeRecord.settings.featureFlags ?? {};

  const groupedSections = useMemo(
    () =>
      FEATURE_SECTIONS.map((section) => ({
        ...section,
        modules: FEATURE_MODULES.filter((module) => module.category === section.key),
      })),
    [],
  );

  const handleToggle = (module) => {
    const current = featureFlags[module.key] ?? { enabled: module.defaultEnabled, mode: module.modes?.[0] };
    if (module.premium && !isPremium && !current.enabled) {
      showToast('Unlock this module by upgrading to Plixi Premium', 'info');
      return;
    }
    const nextState = { ...current, enabled: !current.enabled };
    updateSection('featureFlags', { [module.key]: nextState });
    showToast(`${module.title} ${nextState.enabled ? 'activated' : 'disabled'}`);
  };

  const handleModeChange = (module, nextMode) => {
    const current = featureFlags[module.key] ?? { enabled: module.defaultEnabled, mode: module.modes?.[0] };
    updateSection('featureFlags', { [module.key]: { ...current, mode: nextMode } });
  };

  const handleConfigure = (module) => {
    if (module.premium && !isPremium) {
      showToast('Premium required to configure this module', 'info');
      return;
    }
    navigate(module.route);
  };

  return (
    <div className="page-stack">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">Plixi Control Center</p>
          <h1>Welcome back, {selectedGuild?.name ?? 'Guild Captain'}.</h1>
          <p>
            Keep members engaged with curated automations, premium mechanics, and admin-grade observability. Everything
            you need lives in this dashboard.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={() => navigate('/pricing')}>
              Upgrade now
            </button>
            <button type="button" className="ghost-btn" onClick={() => navigate('/logs')}>
              View audit logs
            </button>
          </div>
          <ul className="hero-metrics">
            <li>
              <strong>{Object.values(featureFlags).filter((flag) => flag?.enabled).length}</strong>
              <span>Modules active</span>
            </li>
            <li>
              <strong>{isPremium ? 'Premium' : 'Creator'}</strong>
              <span>Plan tier</span>
            </li>
            <li>
              <strong>{selectedGuild?.memberCount?.toLocaleString() ?? '—'}</strong>
              <span>Members</span>
            </li>
          </ul>
        </div>
        <div className="hero-illustration">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-callout">
            <p>Announcement</p>
            <strong>Quest Studio is live</strong>
            <span>Drop onboarding quests with multi-step funnels.</span>
          </div>
        </div>
      </div>

      {groupedSections.map((section) => (
        <section key={section.key} id={`${section.key}-features`} className="feature-section">
          <SectionHeader eyebrow={section.title} title={section.title} subtitle={section.description} />
          <div className="feature-grid">
            {section.modules.map((module) => (
              <FeatureCard
                key={module.key}
                module={module}
                state={featureFlags[module.key]}
                isPremiumGuild={isPremium}
                onToggle={() => handleToggle(module)}
                onModeChange={(mode) => handleModeChange(module, mode)}
                onConfigure={() => handleConfigure(module)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
