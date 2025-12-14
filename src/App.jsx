import { useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { MOCK_GUILDS, MOCK_USER } from './data';
import { SelectedGuildProvider } from './context/SelectedGuildContext';
import { DashboardDataProvider } from './context/DashboardDataContext';
import DashboardShell from './pages/DashboardShell';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import EconomyPage from './pages/dashboard/EconomyPage';
import JobsPage from './pages/dashboard/JobsPage';
import MarketplacePage from './pages/dashboard/MarketplacePage';
import MysteryBoxesPage from './pages/dashboard/MysteryBoxesPage';
import RafflesPage from './pages/dashboard/RafflesPage';
import PremiumPage from './pages/dashboard/PremiumPage';
import LogsPage from './pages/dashboard/LogsPage';
import LeaderboardsPage from './pages/dashboard/LeaderboardsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import MarketingHomePage from './pages/MarketingHomePage';
import PricingPage from './pages/PricingPage';
import ToastProvider from './components/ToastProvider';
import TopNavigation from './components/TopNavigation';

function App() {
  const memoizedGuilds = useMemo(() => MOCK_GUILDS, []);
  const memoizedUser = useMemo(() => MOCK_USER, []);

  useEffect(() => {
    document.title = 'Plixi - Control center';
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <SelectedGuildProvider guilds={memoizedGuilds} user={memoizedUser}>
          <DashboardDataProvider>
            <div className="app-shell">
              <TopNavigation />
              <Routes>
                <Route path="/" element={<MarketingHomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/app" element={<DashboardShell />}>
                  <Route index element={<DashboardHomePage />} />
                  <Route path="economy" element={<EconomyPage />} />
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="marketplace" element={<MarketplacePage />} />
                  <Route path="mystery-boxes" element={<MysteryBoxesPage />} />
                  <Route path="raffles" element={<RafflesPage />} />
                  <Route path="premium" element={<PremiumPage />} />
                  <Route path="logs" element={<LogsPage />} />
                  <Route path="leaderboards" element={<LeaderboardsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </DashboardDataProvider>
        </SelectedGuildProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
