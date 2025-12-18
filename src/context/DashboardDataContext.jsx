import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { DEFAULT_SETTINGS } from '../data';
import { useSelectedGuild } from './SelectedGuildContext';
import { fetchGuildSettingsFromSupabase, persistGuildSettingsToSupabase } from '../lib/guildSettingsApi';

const DashboardDataContext = createContext(null);
const STORAGE_KEY = 'plixi-dashboard-data-v1';

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
const createLastSavedMap = () =>
  Object.keys(DEFAULT_SETTINGS).reduce((acc, key) => {
    acc[key] = null;
    return acc;
  }, {});

const ensureRecordShape = (record) => {
  const defaults = cloneDefaults();
  const safeSettings = {};
  Object.keys(defaults).forEach((section) => {
    safeSettings[section] = {
      ...defaults[section],
      ...(record?.settings?.[section] ?? {}),
    };
  });
  if (safeSettings.guild?.raffles) {
    const storedActive = record?.settings?.guild?.raffles?.active;
    const sanitizedActive = Array.isArray(storedActive)
      ? storedActive.filter((raffle) => {
          const label = typeof raffle?.name === 'string' ? raffle.name.toLowerCase() : '';
          return label && !label.includes('sigma') && !label.includes('rawr');
        })
      : null;
    safeSettings.guild.raffles.active =
      sanitizedActive && sanitizedActive.length ? sanitizedActive : defaults.guild.raffles.active;
  }
  const safeLastSaved = {
    ...createLastSavedMap(),
    ...(record?.lastSaved ?? {}),
  };
  return { settings: safeSettings, lastSaved: safeLastSaved };
};

const createGuildRecord = () => ensureRecordShape();

const reducer = (state, action) => {
  switch (action.type) {
    case 'SYNC_GUILDS': {
      const nextRecords = { ...state.records };
      action.guildIds.forEach((guildId) => {
        nextRecords[guildId] = ensureRecordShape(nextRecords[guildId]);
      });
      return { ...state, records: nextRecords };
    }
    case 'HYDRATE_GUILD': {
      const { guildId, data } = action;
      const guildRecord = state.records[guildId];
      if (!guildRecord || !data) return state;
      const currentGuild = guildRecord.settings.guild;
      const nextGuild = { ...currentGuild };
      Object.entries(data).forEach(([key, value]) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          nextGuild[key] = { ...currentGuild[key], ...value };
        } else {
          nextGuild[key] = value;
        }
      });
      return {
        ...state,
        records: {
          ...state.records,
          [guildId]: {
            ...guildRecord,
            settings: {
              ...guildRecord.settings,
              guild: nextGuild,
            },
          },
        },
      };
    }
    case 'UPDATE_SECTION': {
      const { guildId, section, updates } = action;
      const guildRecord = state.records[guildId];
      if (!guildRecord) return state;
      return {
        ...state,
        records: {
          ...state.records,
          [guildId]: {
            ...guildRecord,
            settings: {
              ...guildRecord.settings,
              [section]: {
                ...guildRecord.settings[section],
                ...updates,
              },
            },
          },
        },
      };
    }
    case 'RESET_SECTION': {
      const { guildId, section } = action;
      const guildRecord = state.records[guildId];
      if (!guildRecord) return state;
      const defaults = cloneDefaults();
      return {
        ...state,
        records: {
          ...state.records,
          [guildId]: {
            ...guildRecord,
            settings: {
              ...guildRecord.settings,
              [section]: defaults[section],
            },
            lastSaved: {
              ...guildRecord.lastSaved,
              [section]: null,
            },
          },
        },
      };
    }
    case 'SAVE_SECTION': {
      const { guildId, section, timestamp } = action;
      const guildRecord = state.records[guildId];
      if (!guildRecord) return state;
      return {
        ...state,
        records: {
          ...state.records,
          [guildId]: {
            ...guildRecord,
            lastSaved: {
              ...guildRecord.lastSaved,
              [section]: timestamp,
            },
          },
        },
      };
    }
    default:
      return state;
  }
};

export function DashboardDataProvider({ children }) {
  const { guilds, selectedGuildId } = useSelectedGuild();

  const hydratedGuildsRef = useRef(new Set());

  const [state, dispatch] = useReducer(
    reducer,
    guilds,
    (initialGuilds) => {
      if (typeof window !== 'undefined') {
        try {
          const persisted = window.localStorage.getItem(STORAGE_KEY);
          if (persisted) {
            const parsed = JSON.parse(persisted);
            const normalizedRecords = {};
            Object.entries(parsed.records ?? {}).forEach(([guildId, record]) => {
              normalizedRecords[guildId] = ensureRecordShape(record);
            });
            initialGuilds.forEach((guild) => {
              if (!normalizedRecords[guild.id]) {
                normalizedRecords[guild.id] = createGuildRecord();
              }
            });
            return { records: normalizedRecords };
          }
        } catch {
          // ignore corrupt storage
        }
      }

      const records = {};
      initialGuilds.forEach((guild) => {
        records[guild.id] = createGuildRecord();
      });
      return { records };
    },
  );

  useEffect(() => {
    const guildIds = guilds.map((guild) => guild.id);
    dispatch({ type: 'SYNC_GUILDS', guildIds });
  }, [guilds]);

  useEffect(() => {
    guilds.forEach((guild) => {
      if (!guild?.id) return;
      if (hydratedGuildsRef.current.has(guild.id)) return;
      hydratedGuildsRef.current.add(guild.id);
      (async () => {
        try {
          const remoteData = await fetchGuildSettingsFromSupabase(guild.id);
          if (remoteData) {
            dispatch({ type: 'HYDRATE_GUILD', guildId: guild.id, data: remoteData });
          }
        } catch (error) {
          console.error('Failed to hydrate guild settings', error);
        }
      })();
    });
  }, [guilds]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeGuildId = selectedGuildId ?? guilds[0]?.id ?? null;
  const activeRecord = activeGuildId ? state.records[activeGuildId] : null;

  const updateSection = (section, updates) => {
    if (!activeGuildId) return;
    dispatch({ type: 'UPDATE_SECTION', guildId: activeGuildId, section, updates });
  };

  const resetSection = (section) => {
    if (!activeGuildId) return;
    dispatch({ type: 'RESET_SECTION', guildId: activeGuildId, section });
  };

  const saveSection = async (section) => {
    if (!activeGuildId) return;
    if (section === 'guild') {
      const guildSettings = state.records[activeGuildId]?.settings?.guild;
      await persistGuildSettingsToSupabase(activeGuildId, guildSettings);
    }
    dispatch({ type: 'SAVE_SECTION', guildId: activeGuildId, section, timestamp: new Date().toISOString() });
  };

  const value = useMemo(
    () => ({
      state,
      activeRecord: ensureRecordShape(activeRecord),
      updateSection,
      resetSection,
      saveSection,
    }),
    [state, activeRecord],
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
}
