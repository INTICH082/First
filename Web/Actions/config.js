// config.js — общая конфигурация приложения

const CONFIG = {
    // Автоматически определяется из window.location (не нужно менять вручную)
    API_BASE_URL: window.location.origin,
    
    // Игры и их отображение
    GAMES: {
        cs2:      { id: 'cs2',      name: 'CS2',    fullName: 'Counter-Strike 2',       badgeClass: 'badge_cs2'      },
        csgo:     { id: 'csgo',     name: 'CS:GO',  fullName: 'Counter-Strike: GO',     badgeClass: 'badge_csgo'     },
        cssource: { id: 'cssource', name: 'CS:S',   fullName: 'CS:Source',              badgeClass: 'badge_cssource' },
        cs16:     { id: 'cs16',     name: 'CS 1.6', fullName: 'Counter-Strike 1.6',     badgeClass: 'badge_cs16'     }
    },
    
    LABEL_COLORS: {
        cs2:      { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.25)'  },
        csgo:     { bg: 'rgba(240,180,41,0.12)',  color: '#f0b429', border: 'rgba(240,180,41,0.25)'  },
        cssource: { bg: 'rgba(168,85,247,0.12)',  color: '#a855f7', border: 'rgba(168,85,247,0.25)'  },
        cs16:     { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e', border: 'rgba(34,197,94,0.25)'   }
    },

    // Мок-серверы (пока нет бэкенда)
    MOCK_SERVERS: {
        cs2: [
            { id: 'cs2-dm-1', name: 'First | DM #1 [128 tick]', map: 'de_dust2', ip: '45.11.123.45:27015', location: 'Москва', maxPlayers: 20, tags: ['128tick', 'HS only', 'No AWP'] },
            { id: 'cs2-dm-2', name: 'First | DM #2 [Mirage]', map: 'de_mirage', ip: '45.11.123.46:27015', location: 'Москва', maxPlayers: 20, tags: ['128tick', 'Pistols'] },
            { id: 'cs2-retake-1', name: 'First | Retake #1', map: 'de_inferno', ip: '45.11.123.47:27015', location: 'Санкт-Петербург', maxPlayers: 10, tags: ['Retake', 'Competitive'] }
        ],
        csgo: [
            { id: 'csgo-surf-1', name: 'First | Surf [Tier 1-3]', map: 'surf_mesa', ip: '45.11.124.10:27015', location: 'Москва', maxPlayers: 32, tags: ['Surf', 'Timer'] }
        ],
        cssource: [],
        cs16: [
            { id: 'cs16-jail-1', name: 'First | Jailbreak #1', map: 'jb_summer', ip: '45.11.125.20:27015', location: 'Москва', maxPlayers: 32, tags: ['Jail', 'Vip free'] }
        ]
    }
};

// Для обратной совместимости в других скриптах
window.CONFIG = CONFIG;