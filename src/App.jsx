import { useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { MOCK_GUILDS, MOCK_USER } from './data';
import { SelectedGuildProvider } from './context/SelectedGuildContext';
import { DashboardDataProvider } from './context/DashboardDataContext';
import DashboardShell from './pages/DashboardShell';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import EconomyPage from './pages/dashboard/EconomyPage';
import MarketplacePage from './pages/dashboard/MarketplacePage';
import MysteryBoxesPage from './pages/dashboard/MysteryBoxesPage';
import RafflesPage from './pages/dashboard/RafflesPage';
import PremiumPage from './pages/dashboard/PremiumPage';
import LogsPage from './pages/dashboard/LogsPage';
import LeaderboardsPage from './pages/dashboard/LeaderboardsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import MarketingHomePage from './pages/MarketingHomePage';
import PricingPage from './pages/PricingPage';
import DocsPage from './pages/DocsPage';
import JobsPage from './pages/dashboard/JobsPage';
import XPPage from './pages/dashboard/XPPage';
import GuildEconomyPage from './pages/dashboard/GuildEconomyPage';
import GuildItemsPage from './pages/dashboard/GuildItemsPage';
import GuildBoxesPage from './pages/dashboard/GuildBoxesPage';
import GuildMarketplacePage from './pages/dashboard/GuildMarketplacePage';
import GuildTradesPage from './pages/dashboard/GuildTradesPage';
import GuildAuctionsPage from './pages/dashboard/GuildAuctionsPage';
import GuildRafflesPage from './pages/dashboard/GuildRafflesPage';
import GuildShopPage from './pages/dashboard/GuildShopPage';
import GuildLeaderboardsPage from './pages/dashboard/GuildLeaderboardsPage';
import GuildAuditPage from './pages/dashboard/GuildAuditPage';
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
                <Route path="/docs" element={<DocsPage />} />
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
                  <Route path="xp" element={<XPPage />} />
                  <Route path="guild">
                    <Route index element={<Navigate to="economy" replace />} />
                    <Route path="economy" element={<GuildEconomyPage />} />
                    <Route path="items" element={<GuildItemsPage />} />
                    <Route path="boxes" element={<GuildBoxesPage />} />
                    <Route path="marketplace" element={<GuildMarketplacePage />} />
                    <Route path="auctions" element={<GuildAuctionsPage />} />
                    <Route path="raffles" element={<GuildRafflesPage />} />
                    <Route path="shop" element={<GuildShopPage />} />
                    <Route path="leaderboards" element={<GuildLeaderboardsPage />} />
                    <Route path="audit" element={<GuildAuditPage />} />
                    <Route path="trades" element={<GuildTradesPage />} />
                  </Route>
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
