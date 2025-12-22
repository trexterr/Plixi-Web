import { useState } from 'react';
import { useSelectedGuild } from '../context/SelectedGuildContext';
import { useDashboardData } from '../context/DashboardDataContext';
import { useToast } from './ToastProvider';
import LoadingSkeleton from './LoadingSkeleton';

export default function DashboardTopbar({ isReady }) {
  const { user, selectedGuild, isPremium } = useSelectedGuild();
  const { activeRecord } = useDashboardData();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const memberCount = selectedGuild?.memberCount?.toLocaleString() ?? '—';
  const lastSave = Object.values(activeRecord.lastSaved ?? {})
    .filter(Boolean)
    .sort()
    .pop();

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      showToast('Dashboard data synced with Plixi Cloud', 'success');
    }, 900);
  };

  return (
    <div className="dashboard-topbar">
      <div className="topbar-insights">
        <div>
          <span>Active guild</span>
          {isReady ? <strong>{selectedGuild?.name}</strong> : <LoadingSkeleton width="180px" />}
        </div>
        <div>
          <span>Members</span>
          {isReady ? <strong>{memberCount}</strong> : <LoadingSkeleton width="80px" />}
        </div>
        <div className="plan-insight">
          <span>Plan</span>
          {isReady ? (
            <strong className="plan-readout">{isPremium ? 'Premium' : 'None'}</strong>
          ) : (
            <LoadingSkeleton width="70px" />
          )}
        </div>
        <div>
          <span>Last saved</span>
          {isReady ? <strong>{lastSave ? new Date(lastSave).toLocaleTimeString() : 'Not yet'}</strong> : <LoadingSkeleton width="90px" />}
        </div>
      </div>
      <button className="primary-btn" type="button" disabled={syncing} onClick={handleSync}>
        {syncing ? 'Syncing…' : 'Sync changes'}
      </button>
    </div>
  );
}
