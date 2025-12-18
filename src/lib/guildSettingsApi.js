import { supabase } from './supabase';

const GUILD_ID_OVERRIDES = {
  'guild-starlance': 1371982928380301372n,
  'guild-synth': 1371982928380301373n,
  'guild-harbor': 1371982928380301374n,
};

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === 't' || lower === '1') return true;
    if (lower === 'false' || lower === 'f' || lower === '0') return false;
  }
  return fallback;
};

const parseDurationToMinutes = (input) => {
  if (!input) return null;
  const match = /^(\d+(?:\.\d+)?)([smhd])$/i.exec(String(input).trim());
  if (!match) return null;
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (!Number.isFinite(value)) return null;
  switch (unit) {
    case 's':
      return Math.round(value / 60);
    case 'm':
      return Math.round(value);
    case 'h':
      return Math.round(value * 60);
    case 'd':
      return Math.round(value * 60 * 24);
    default:
      return null;
  }
};

const formatMinutes = (minutes, granularity = 'm') => {
  const safe = Math.max(1, Number.isFinite(minutes) ? Math.round(minutes) : 1);
  switch (granularity) {
    case 'h':
      return `${Math.max(1, Math.round(safe / 60))}h`;
    case 'd':
      return `${Math.max(1, Math.round(safe / 1440))}d`;
    default:
      return `${safe}m`;
  }
};

const formatHours = (hours) => {
  const safe = Math.max(1, Number.isFinite(hours) ? Math.round(hours) : 1);
  return `${safe}h`;
};

const coerceNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const deriveGuildNumericId = (guildId) => {
  if (!guildId) return null;
  if (GUILD_ID_OVERRIDES[guildId] !== undefined) {
    return Number(GUILD_ID_OVERRIDES[guildId]);
  }
  let hash = 0;
  for (let i = 0; i < guildId.length; i += 1) {
    hash = (hash * 31 + guildId.charCodeAt(i)) % 1000000000000;
  }
  return hash || 1;
};

const mapCurrencyRow = (row) =>
  !row
    ? null
    : {
        currency: {
          name: row.currency_name ?? 'Credits',
          startingBalance: coerceNumber(row.start_balance, 0),
          decimalsEnabled: normalizeBoolean(row.decimals_enabled),
        },
      };

const mapDailyRow = (row) =>
  !row
    ? null
    : {
        daily: {
          enabled: normalizeBoolean(row.enabled, true),
          baseAmount: coerceNumber(row.base_amount, 200),
          cooldownHours: Math.max(1, Math.round((parseDurationToMinutes(row.cooldown) ?? 1440) / 60)),
          roleAmounts: Array.isArray(row.role_bonuses) ? row.role_bonuses : [],
          streak: {
            enabled: normalizeBoolean(row.streak_enabled),
            profile: row.streak_profile ?? 'standard',
          },
        },
      };

const mapWorkRow = (row) =>
  !row
    ? null
    : {
        work: {
          enabled: normalizeBoolean(row.enabled, true),
          cooldownMinutes: parseDurationToMinutes(row.cooldown) ?? 240,
          payMin: coerceNumber(row.min_pay, 200),
          payMax: coerceNumber(row.max_pay, 500),
          jobs: Array.isArray(row.job_pool) ? row.job_pool : [],
        },
      };

const mapMarketplaceRow = (row) =>
  !row
    ? null
    : {
        marketplaceSuite: {
          enabled: normalizeBoolean(row.enabled, true),
          resultsPerPage: coerceNumber(row.results_per_page, 6),
          feesEnabled: normalizeBoolean(row.fees, false),
          feePercent: coerceNumber(row.fee_percentage, 0),
          appearance: {
            title: row.display_title ?? 'Marketplace',
            color: row.color ?? '#7c3aed',
          },
        },
      };

const mapAuctionRow = (row) =>
  !row
    ? null
    : {
        marketplaceSuite: {
          auctions: {
            enabled: normalizeBoolean(row.enabled, true),
            buyoutsEnabled: normalizeBoolean(row.allow_buyouts, true),
            resultsPerPage: coerceNumber(row.results_per_page, 4),
            feeEnabled: normalizeBoolean(row.fees, false),
            feePercent: coerceNumber(row.fee_percentage, 0),
            appearance: {
              title: row.display_title ?? 'Auction House',
              color: row.color ?? '#f97316',
            },
          },
        },
      };

const mapTradesRow = (row) =>
  !row
    ? null
    : {
        marketplaceSuite: {
          trading: {
            enabled: normalizeBoolean(row.trading_enabled, true),
            giftingEnabled: normalizeBoolean(row.gifting_enabled, true),
          },
        },
      };

const mapItemRow = (row) =>
  !row
    ? null
    : {
        items: {
          enabled: normalizeBoolean(row.enabled, true),
          rarityCap: coerceNumber(row.allowed_rarities, 0),
        },
      };

const mapRaffleRow = (row) =>
  !row
    ? null
    : {
        raffles: {
          enabled: normalizeBoolean(row.enabled, true),
          animationSpeed: row.animation_speed ?? 'standard',
          announceRare: normalizeBoolean(row.announce_rarities, false),
          announceChannel: row.announcement ?? null,
          announceBy: row.announce_by ?? null,
          minRarity: row.min_rarity ?? null,
          prizePoolPercent: coerceNumber(row.max_odds, 0),
          openOnPurchase: normalizeBoolean(row.open_on_purchase, false),
        },
      };

export async function fetchGuildSettingsFromSupabase(guildId) {
  const numericId = deriveGuildNumericId(guildId);
  if (!numericId) return null;

  const requests = await Promise.allSettled([
    supabase.from('currency_settings').select('*').eq('guild_id', numericId).maybeSingle(),
    supabase.from('daily_collect_settings').select('*').eq('guild_id', numericId).maybeSingle(),
    supabase.from('work_command_settings').select('*').eq('guild_id', numericId).maybeSingle(),
    supabase.from('marketplace_settings').select('*').eq('guild_id', numericId).maybeSingle(),
    supabase.from('auction_settings').select('*').eq('guild_id', numericId).maybeSingle(),
    supabase.from('trades_gifts_settings').select('*').eq('guild_id', numericId).maybeSingle(),
    supabase.from('item_settings').select('*').eq('guild_id', numericId).maybeSingle(),
    supabase.from('raffle_settings').select('*').eq('guild_id', numericId).maybeSingle(),
  ]);

  const [
    currencyResult,
    dailyResult,
    workResult,
    marketplaceResult,
    auctionResult,
    tradesResult,
    itemResult,
    raffleResult,
  ] = requests.map((result) => (result.status === 'fulfilled' ? result.value : { data: null, error: result.reason }));

  const aggregate = {};

  if (currencyResult?.data) Object.assign(aggregate, mapCurrencyRow(currencyResult.data));
  if (dailyResult?.data) Object.assign(aggregate, mapDailyRow(dailyResult.data));
  if (workResult?.data) Object.assign(aggregate, mapWorkRow(workResult.data));
  if (marketplaceResult?.data) Object.assign(aggregate, mapMarketplaceRow(marketplaceResult.data));
  if (auctionResult?.data) Object.assign(aggregate, mapAuctionRow(auctionResult.data));
  if (tradesResult?.data) Object.assign(aggregate, mapTradesRow(tradesResult.data));
  if (itemResult?.data) Object.assign(aggregate, mapItemRow(itemResult.data));
  if (raffleResult?.data) Object.assign(aggregate, mapRaffleRow(raffleResult.data));

  return aggregate;
}

const safeRoleBonuses = (roles) =>
  Array.isArray(roles)
    ? roles.map((role) => ({
        id: role.id ?? role.role ?? `role-${Date.now()}`,
        role: role.role ?? '@Role',
        amount: coerceNumber(role.amount, 0),
      }))
    : [];

const safeJobPool = (jobs) =>
  Array.isArray(jobs)
    ? jobs.map((job, index) => ({
        id: job.id ?? `job-${index}`,
        name: job.name ?? `Job ${index + 1}`,
      }))
    : [];

export async function persistGuildSettingsToSupabase(guildId, guildSettings) {
  const numericId = deriveGuildNumericId(guildId);
  if (!numericId || !guildSettings) return;

  const payloads = [
    supabase.from('currency_settings').upsert(
      {
        guild_id: numericId,
        currency_name: guildSettings.currency?.name ?? 'Credits',
        start_balance: guildSettings.currency?.startingBalance ?? 0,
        decimals_enabled: Boolean(guildSettings.currency?.decimalsEnabled),
      },
      { onConflict: 'guild_id' },
    ),
    supabase.from('daily_collect_settings').upsert(
      {
        guild_id: numericId,
        enabled: Boolean(guildSettings.daily?.enabled),
        base_amount: guildSettings.daily?.baseAmount ?? 0,
        cooldown: formatHours(guildSettings.daily?.cooldownHours ?? 24),
        streak_enabled: Boolean(guildSettings.daily?.streak?.enabled),
        streak_profile: guildSettings.daily?.streak?.profile ?? 'standard',
        role_bonuses: safeRoleBonuses(guildSettings.daily?.roleAmounts),
      },
      { onConflict: 'guild_id' },
    ),
    supabase.from('work_command_settings').upsert(
      {
        guild_id: numericId,
        enabled: Boolean(guildSettings.work?.enabled),
        cooldown: formatMinutes(guildSettings.work?.cooldownMinutes ?? 240, 'm'),
        min_pay: guildSettings.work?.payMin ?? 0,
        max_pay: guildSettings.work?.payMax ?? 0,
        job_pool: safeJobPool(guildSettings.work?.jobs),
      },
      { onConflict: 'guild_id' },
    ),
    supabase.from('marketplace_settings').upsert(
      {
        guild_id: numericId,
        enabled: Boolean(guildSettings.marketplaceSuite?.enabled),
        results_per_page: guildSettings.marketplaceSuite?.resultsPerPage ?? 6,
        fees: Boolean(guildSettings.marketplaceSuite?.feesEnabled),
        fee_percentage: guildSettings.marketplaceSuite?.feePercent ?? 0,
        display_title: guildSettings.marketplaceSuite?.appearance?.title ?? 'Marketplace',
        color: guildSettings.marketplaceSuite?.appearance?.color ?? '#7c3aed',
      },
      { onConflict: 'guild_id' },
    ),
    supabase.from('auction_settings').upsert(
      {
        guild_id: numericId,
        enabled: Boolean(guildSettings.marketplaceSuite?.auctions?.enabled),
        allow_buyouts: Boolean(guildSettings.marketplaceSuite?.auctions?.buyoutsEnabled),
        results_per_page: guildSettings.marketplaceSuite?.auctions?.resultsPerPage ?? 4,
        fees: Boolean(guildSettings.marketplaceSuite?.auctions?.feeEnabled),
        fee_percentage: guildSettings.marketplaceSuite?.auctions?.feePercent ?? 0,
        display_title: guildSettings.marketplaceSuite?.auctions?.appearance?.title ?? 'Auction House',
        color: guildSettings.marketplaceSuite?.auctions?.appearance?.color ?? '#f97316',
      },
      { onConflict: 'guild_id' },
    ),
    supabase.from('trades_gifts_settings').upsert(
      {
        guild_id: numericId,
        trading_enabled: Boolean(guildSettings.marketplaceSuite?.trading?.enabled),
        gifting_enabled: Boolean(guildSettings.marketplaceSuite?.trading?.giftingEnabled),
      },
      { onConflict: 'guild_id' },
    ),
    supabase.from('item_settings').upsert(
      {
        guild_id: numericId,
        enabled: Boolean(guildSettings.items?.enabled),
        allowed_rarities: guildSettings.items?.rarityCap ?? 0,
      },
      { onConflict: 'guild_id' },
    ),
    supabase.from('raffle_settings').upsert(
      {
        guild_id: numericId,
        enabled: Boolean(guildSettings.raffles?.rafflesEnabled ?? guildSettings.raffles?.enabled),
        animation_speed: guildSettings.boxes?.behavior?.animationSpeed ?? 'standard',
        announce_rarities: Boolean(guildSettings.boxes?.behavior?.announceRare),
        announcement: guildSettings.boxes?.behavior?.announceChannel ?? null,
        announce_by: guildSettings.boxes?.behavior?.announceBy ?? null,
        min_rarity: guildSettings.boxes?.behavior?.minRarity ?? null,
        max_odds: guildSettings.boxes?.behavior?.maxOdds ?? null,
        open_on_purchase: Boolean(
          guildSettings.boxes?.behavior?.openOnPurchase ?? guildSettings.raffles?.openOnPurchase,
        ),
      },
      { onConflict: 'guild_id' },
    ),
  ];

  const results = await Promise.allSettled(payloads);
  const failed = results
    .map((result) => (result.status === 'fulfilled' ? result.value?.error : result.reason))
    .filter(Boolean);
  if (failed.length) {
    const aggregateError = new Error('Failed to persist some guild settings');
    aggregateError.causes = failed;
    throw aggregateError;
  }
}
