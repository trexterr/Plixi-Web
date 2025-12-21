import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AuthCallbackPage from './pages/AuthCallbackPage';
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
import GuildBillingPage from './pages/dashboard/GuildBillingPage';
import GuildSystemPage from './pages/dashboard/GuildSystemPage';
import ToastProvider from './components/ToastProvider';
import TopNavigation from './components/TopNavigation';
import { supabase } from './lib/supabase';

const mapDiscordUser = (sessionUser) => {
  if (!sessionUser) return null;
  const metadata = sessionUser.user_metadata ?? {};
  const displayName =
    metadata.global_name ||
    metadata.display_name ||
    metadata.full_name ||
    metadata.name ||
    metadata.preferred_username ||
    metadata.user_name ||
    sessionUser.email ||
    'Discord User';
  const avatar = metadata.avatar_url || metadata.picture || metadata.avatar;

  return {
    id: sessionUser.id,
    displayName,
    avatar: avatar ?? 'https://cdn.discordapp.com/embed/avatars/0.png',
    metadata,
  };
};

const extractDiscordUserId = (user) => {
  const metadata = user?.user_metadata ?? {};
  const identities = user?.identities ?? [];
  const identityData = identities.find((id) => id?.provider === 'discord')?.identity_data ?? {};

  const rawId =
    metadata.provider_id ||
    metadata.user_id ||
    metadata.sub ||
    identityData.id ||
    identityData.sub ||
    null;

  if (!rawId) return null;
  const numeric = Number(rawId);
  return Number.isFinite(numeric) ? numeric : rawId;
};

const normalizeDiscordGuild = (guild) => {
  if (!guild?.id || !guild?.name) return null;
  const iconHash = guild.icon_hash || guild.icon;
  const iconUrl =
    iconHash && guild.id
      ? `https://cdn.discordapp.com/icons/${guild.id}/${iconHash}.png?size=64`
      : '🛰️';

  return {
    id: guild.id,
    name: guild.name,
    icon: iconUrl,
    memberCount: guild.approximate_member_count ?? null,
    premium: Boolean(guild.premium_subscription_count),
  };
};

function App() {
  const [guilds, setGuilds] = useState([]);
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    document.title = 'Plixi - Control center';
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSessionUser(mapDiscordUser(data?.session?.user ?? null));
      } catch (error) {
        console.error('Failed to fetch Supabase session', error);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSessionUser(mapDiscordUser(session?.user ?? null));
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchGuilds = async () => {
      if (!sessionUser) return setGuilds([]);

      try {
        const { data: userData } = await supabase.auth.getUser();
        const discordId = extractDiscordUserId(userData?.user ?? null) || extractDiscordUserId(sessionUser);
        if (!discordId) {
          setGuilds([]);
          return;
        }

        const { data, error } = await supabase
          .from('user_guilds')
          .select(
            `
            guild:guild_id (
              guild_id,
              name,
              plan,
              member_count,
              owner_id,
              last_updated,
              icon_hash
            )
          `,
          )
          .eq('user_id', discordId)
          .eq('can_manage', true);

        if (error) throw error;

        const normalized = Array.isArray(data)
          ? data
              .map((row) =>
                row?.guild
                  ? normalizeDiscordGuild({
                      id: row.guild.guild_id,
                      name: row.guild.name,
                      icon_hash: row.guild.icon_hash,
                      icon: row.guild.icon_hash,
                      premium_subscription_count: row.guild.plan !== 'Free',
                      approximate_member_count: row.guild.member_count,
                    })
                  : null,
              )
              .filter(Boolean)
          : [];

        if (!isMounted) return;
        setGuilds(normalized);
      } catch (error) {
        console.error('Failed to fetch guilds for user', error);
        if (isMounted) setGuilds([]);
      }
    };

    fetchGuilds();

    return () => {
      isMounted = false;
    };
  }, [sessionUser]);

  useEffect(() => {
    if (!sessionUser) return;

    const ensureUserRecord = async () => {
      const metadata = sessionUser.metadata ?? {};

      try {
        const { data: existingUser, error: lookupError } = await supabase
          .from('users')
          .select('id')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (lookupError) {
          console.error('Failed checking user record', lookupError);
          return;
        }

        if (existingUser) return;

        const rawDiscordId =
          metadata.provider_id ||
          metadata.user_id ||
          metadata.sub ||
          null;

        const discordIdNumber = rawDiscordId ? Number(rawDiscordId) : null;
        const normalizedDiscordId =
          discordIdNumber !== null && Number.isFinite(discordIdNumber)
            ? discordIdNumber
            : null;

        const username =
          metadata.full_name ||
          metadata.user_name ||
          metadata.name ||
          sessionUser.displayName ||
          'Discord User';

        const avatarUrl =
          metadata.avatar_url ||
          metadata.picture ||
          sessionUser.avatar ||
          null;

        const { error: insertError } = await supabase.from('users').insert({
          id: sessionUser.id,
          discord_id: normalizedDiscordId,
          username,
          avatar_url: avatarUrl,
        });

        if (insertError) {
          console.error('Failed inserting user record', insertError);
        }
      } catch (error) {
        console.error('Unexpected error ensuring user record', error);
      }
    };

    ensureUserRecord();
  }, [sessionUser]);

  return (
    <BrowserRouter>
      <ToastProvider>
        <SelectedGuildProvider guilds={guilds} user={sessionUser}>
          <DashboardDataProvider>
            <div className="app-shell">
              <TopNavigation />
              <Routes>
                <Route path="/" element={<MarketingHomePage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/docs/:sectionSlug" element={<DocsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/auth" element={<AuthCallbackPage />} />
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
                    <Route path="billing" element={<GuildBillingPage />} />
                    <Route path="system" element={<GuildSystemPage />} />
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
