/**
 * Main.js — страница серверов.
 * Зависит от auth.js и header_auth.js (подключаются выше в HTML).
 *
 * ─── Как подключить бэкенд ───────────────────────────────────────
 *  Все места, где надо добавить реальный fetch, помечены:
 *    // TODO [BACKEND]: ...
 * ─────────────────────────────────────────────────────────────────
 */

/* ================================================================
   Конфигурация серверов
   TODO [BACKEND]: заменить на GET /api/servers — список из БД
   ================================================================ */
const SERVERS_CONFIG = {
    cs2: [
        {
            id: 'cs2-dm-1',
            name: 'First | DM #1 [128 tick]',
            map: 'de_dust2',
            ip: '45.11.123.45:27015',
            location: 'Москва',
            maxPlayers: 20,
            tags: ['128tick', 'HS only', 'No AWP']
        },
        {
            id: 'cs2-dm-2',
            name: 'First | DM #2 [Mirage]',
            map: 'de_mirage',
            ip: '45.11.123.46:27015',
            location: 'Москва',
            maxPlayers: 20,
            tags: ['128tick', 'Pistols']
        },
        {
            id: 'cs2-retake-1',
            name: 'First | Retake #1',
            map: 'de_inferno',
            ip: '45.11.123.47:27015',
            location: 'Санкт-Петербург',
            maxPlayers: 10,
            tags: ['Retake', 'Competitive']
        }
    ],
    csgo: [
        {
            id: 'csgo-surf-1',
            name: 'First | Surf [Tier 1-3]',
            map: 'surf_mesa',
            ip: '45.11.124.10:27015',
            location: 'Москва',
            maxPlayers: 32,
            tags: ['Surf', 'Timer']
        }
    ],
    cssource: [],
    cs16: [
        {
            id: 'cs16-jail-1',
            name: 'First | Jailbreak #1',
            map: 'jb_summer',
            ip: '45.11.125.20:27015',
            location: 'Москва',
            maxPlayers: 32,
            tags: ['Jail', 'Vip free']
        }
    ]
};

const GAMES = {
    cs2:      { id: 'cs2',      name: 'CS2',    fullName: 'Counter-Strike 2',       badgeClass: 'badge_cs2'      },
    csgo:     { id: 'csgo',     name: 'CS:GO',  fullName: 'Counter-Strike: GO',     badgeClass: 'badge_csgo'     },
    cssource: { id: 'cssource', name: 'CS:S',   fullName: 'CS:Source',              badgeClass: 'badge_cssource' },
    cs16:     { id: 'cs16',     name: 'CS 1.6', fullName: 'Counter-Strike 1.6',     badgeClass: 'badge_cs16'     }
};

const LABEL_COLORS = {
    cs2:      { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', border: 'rgba(96,165,250,0.25)'  },
    csgo:     { bg: 'rgba(240,180,41,0.12)',  color: '#f0b429', border: 'rgba(240,180,41,0.25)'  },
    cssource: { bg: 'rgba(168,85,247,0.12)',  color: '#a855f7', border: 'rgba(168,85,247,0.25)'  },
    cs16:     { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e', border: 'rgba(34,197,94,0.25)'   }
};

/* ================================================================
   Состояние страницы
   ================================================================ */
let currentGame        = 'cs2';
let serverUpdateTimer  = null;

/* ================================================================
   DOMContentLoaded
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    /* 1. HeaderAuth назначает колбэки Auth.onLogin / Auth.onLogout */
    HeaderAuth.init();

    /* 2. Доп-колбэк: при логине заполняем сайдбар */
    const originalOnLogin = Auth.onLogin;
    Auth.onLogin = (user) => {
        originalOnLogin(user);
        fillSidebarUser(user);
    };
    const originalOnLogout = Auth.onLogout;
    Auth.onLogout = () => {
        originalOnLogout();
        clearSidebarUser();
    };

    /* 3. Инициализация страницы */
    initOnlineCounter();
    buildGameSelector();
    initChat();

    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    selectGame(gameParam && GAMES[gameParam] ? gameParam : 'cs2');

    startServerUpdates();

    /* 4. Проверяем сессию (авторизован или нет) */
    Auth.init();
});

/* ================================================================
   Сайдбар: пользователь
   ================================================================ */
function fillSidebarUser(user) {
    const av = document.getElementById('left_sidebar_user_avatar');
    if (av) av.src = user.avatar_url || '';
    const nn = document.getElementById('left_sidebar_user_nickname');
    if (nn) nn.textContent = user.nickname || '—';
    const lv = document.getElementById('left_sidebar_user_level');
    if (lv) lv.textContent = 'Ур. ' + (user.level || 0);
}

function clearSidebarUser() {
    const av = document.getElementById('left_sidebar_user_avatar');
    if (av) av.src = '';
    const nn = document.getElementById('left_sidebar_user_nickname');
    if (nn) nn.textContent = '—';
    const lv = document.getElementById('left_sidebar_user_level');
    if (lv) lv.textContent = '—';
}

/* ================================================================
   Онлайн-счётчик
   ================================================================ */
function initOnlineCounter() {
    const c = document.getElementById('online_counter');
    const b = document.getElementById('online_breakdown');
    if (!c || !b) return;
    c.addEventListener('click', e => { e.stopPropagation(); b.classList.toggle('visible'); });
    document.addEventListener('click', e => { if (!c.contains(e.target)) b.classList.remove('visible'); });
}

/**
 * TODO [BACKEND]: заменить заглушку на реальный запрос:
 *   const res  = await fetch('/api/online', { credentials: 'include' });
 *   const data = await res.json();
 *   // data = { total: 1842, cs2: 1100, csgo: 420, cssource: 210, cs16: 112 }
 *   updateOnlineDisplay(data.total, data);
 */
async function fetchOnline() {
    // Заглушка — отображаем «—» пока нет бэкенда
    updateOnlineDisplay(null, null);
}

function updateOnlineDisplay(total, breakdown) {
    const onEl = document.getElementById('online');
    if (onEl) onEl.textContent = total !== null ? total.toLocaleString('ru-RU') : '—';

    const games = ['cs2', 'csgo', 'cssource', 'cs16'];
    games.forEach(g => {
        const el = document.getElementById('count_' + g);
        if (el) el.textContent = (breakdown && breakdown[g] !== undefined)
            ? breakdown[g].toLocaleString('ru-RU')
            : '—';
    });
}

/* ================================================================
   Game selector
   ================================================================ */
function buildGameSelector() {
    const wrap = document.getElementById('game_selector');
    if (!wrap) return;

    const btn = document.createElement('button');
    btn.id = 'gs_btn';

    const bSpan = document.createElement('span');
    const nSpan = document.createElement('span');
    const chev  = document.createElement('i');
    chev.className = 'fas fa-chevron-down chevron';
    btn.appendChild(bSpan);
    btn.appendChild(nSpan);
    btn.appendChild(chev);

    const dd = document.createElement('div');
    dd.id = 'gs_dd';

    Object.values(GAMES).forEach(g => {
        const opt = document.createElement('div');
        opt.className = 'game_option';
        opt.dataset.game = g.id;
        const b = document.createElement('span');
        b.id = g.badgeClass;
        b.textContent = g.name;
        const n = document.createElement('span');
        n.textContent = g.fullName;
        opt.appendChild(b);
        opt.appendChild(n);
        opt.addEventListener('click', () => { selectGame(g.id); closeDD(); });
        dd.appendChild(opt);
    });

    wrap.appendChild(btn);
    wrap.appendChild(dd);

    btn.addEventListener('click', e => {
        e.stopPropagation();
        dd.classList.contains('open') ? closeDD() : openDD();
    });
    document.addEventListener('click', () => closeDD());
}

const openDD = () => {
    document.getElementById('gs_btn')?.classList.add('open');
    document.getElementById('gs_dd')?.classList.add('open');
};
const closeDD = () => {
    document.getElementById('gs_btn')?.classList.remove('open');
    document.getElementById('gs_dd')?.classList.remove('open');
};

function updateSelector(id) {
    const g    = GAMES[id];
    const btn  = document.getElementById('gs_btn');
    if (!btn) return;
    const spans = btn.querySelectorAll('span');
    spans[0].id          = g.badgeClass;
    spans[0].textContent = g.name;
    spans[1].textContent = g.fullName;
    document.querySelectorAll('.game_option').forEach(o => {
        o.classList.toggle('active', o.dataset.game === id);
    });
}

function selectGame(id) {
    currentGame = id;
    updateSelector(id);
    const c   = LABEL_COLORS[id];
    const lbl = document.getElementById('game_label');
    if (lbl) {
        lbl.textContent       = GAMES[id].fullName;
        lbl.style.background  = c.bg;
        lbl.style.color       = c.color;
        lbl.style.borderColor = c.border;
    }
    renderServers(id);
}

/* ================================================================
   Серверы — рендер и обновление
   ================================================================ */
function renderServers(gameId) {
    const grid  = document.getElementById('servers_grid');
    const count = document.getElementById('servers_count');

    // TODO [BACKEND]: servers = await fetch('/api/servers?game=' + gameId)
    const servers = SERVERS_CONFIG[gameId] || [];

    const n = servers.length;
    if (count) count.textContent = n + ' сервер' + (n === 1 ? '' : n < 5 ? 'а' : 'ов');

    if (!grid) return;
    grid.style.opacity = '0';
    setTimeout(() => {
        grid.innerHTML = '';
        if (n === 0) {
            grid.innerHTML = '<div class="servers_empty">Серверов нет</div>';
        } else {
            servers.forEach((s, i) => {
                const card = buildServerCard(s);
                card.style.animationDelay = (i * 0.05) + 's';
                grid.appendChild(card);
            });
        }
        grid.style.opacity = '1';
        updateAllServers();
    }, 150);
}

function buildServerCard(server) {
    const card = document.createElement('div');
    card.id        = 'server_' + server.id;
    card.className = 'server_card';
    card.innerHTML = `
        <div class="server_card_header">
            <div class="server_status server_status_offline" id="status_${server.id}"></div>
            <div class="server_info">
                <div class="server_name">${escapeHtml(server.name)}</div>
                <div class="server_map" id="map_${server.id}">${escapeHtml(server.map)}</div>
            </div>
            <div class="server_ping" id="ping_${server.id}">—</div>
        </div>
        <div class="server_card_body">
            <div class="server_players_bar">
                <div class="server_players_fill" id="fill_${server.id}" style="width:0%"></div>
            </div>
            <div class="server_players_text" id="players_${server.id}">—/${server.maxPlayers}</div>
        </div>
        <div class="server_card_footer">
            <div class="server_location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${escapeHtml(server.location)}</span>
            </div>
            <div class="server_tags">
                ${server.tags.map(t => `<span class="server_tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <button class="server_connect_btn" onclick="connectToServer('${escapeHtml(server.ip)}')">
                <i class="fas fa-play"></i> Подключиться
            </button>
        </div>`;
    return card;
}

/**
 * TODO [BACKEND]: заменить на реальный запрос к game-query серверу:
 *   const res    = await fetch('/api/servers/status?id=' + serverId, { credentials: 'include' });
 *   const status = await res.json();
 *   // status = { online: true, players: 12, maxPlayers: 20, ping: 23, map: 'de_dust2' }
 */
async function fetchServerStatus(serverId) {
    /* Заглушка: возвращаем «нет данных» до подключения бэкенда */
    const server = getServerById(serverId);
    return {
        online:     null,   // null = нет данных
        players:    null,
        maxPlayers: server ? server.maxPlayers : 0,
        ping:       null,
        map:        server ? server.map : ''
    };
}

function getServerById(id) {
    for (const game of Object.values(SERVERS_CONFIG)) {
        const s = game.find(s => s.id === id);
        if (s) return s;
    }
    return null;
}

async function updateAllServers() {
    let totalOnline = 0;
    const breakdown = { cs2: 0, csgo: 0, cssource: 0, cs16: 0 };
    let hasData     = false;

    for (const [gameId, servers] of Object.entries(SERVERS_CONFIG)) {
        for (const server of servers) {
            const status = await fetchServerStatus(server.id);
            updateServerCard(server.id, status);
            if (status.online === true) {
                hasData = true;
                totalOnline        += status.players || 0;
                breakdown[gameId]  += status.players || 0;
            }
        }
    }

    updateOnlineDisplay(hasData ? totalOnline : null, hasData ? breakdown : null);
}

function updateServerCard(serverId, status) {
    const statusEl  = document.getElementById('status_'  + serverId);
    const playersEl = document.getElementById('players_' + serverId);
    const fillEl    = document.getElementById('fill_'    + serverId);
    const pingEl    = document.getElementById('ping_'    + serverId);
    const mapEl     = document.getElementById('map_'     + serverId);

    if (!statusEl) return;

    statusEl.className = 'server_status';

    if (status.online === null) {
        /* Нет данных от бэкенда */
        statusEl.classList.add('server_status_offline');
        if (pingEl) { pingEl.textContent = '—'; pingEl.className = 'server_ping'; }
        if (playersEl) playersEl.textContent = `—/${status.maxPlayers}`;
        if (fillEl) fillEl.style.width = '0%';
    } else if (!status.online) {
        statusEl.classList.add('server_status_offline');
        if (pingEl) { pingEl.textContent = 'offline'; pingEl.className = 'server_ping'; }
        if (playersEl) playersEl.textContent = `0/${status.maxPlayers}`;
        if (fillEl) fillEl.style.width = '0%';
    } else if (status.players >= status.maxPlayers) {
        statusEl.classList.add('server_status_full');
        if (pingEl) { pingEl.textContent = (status.ping ?? '—') + ' ms'; pingEl.className = 'server_ping medium'; }
        if (playersEl) playersEl.textContent = `${status.players}/${status.maxPlayers}`;
        if (fillEl) fillEl.style.width = '100%';
    } else {
        statusEl.classList.add('server_status_online');
        const pingClass = !status.ping ? '' : status.ping < 50 ? 'good' : status.ping < 100 ? 'medium' : 'bad';
        if (pingEl) { pingEl.textContent = (status.ping ?? '—') + ' ms'; pingEl.className = 'server_ping ' + pingClass; }
        const pct = status.maxPlayers > 0 ? (status.players / status.maxPlayers * 100) : 0;
        if (playersEl) playersEl.textContent = `${status.players}/${status.maxPlayers}`;
        if (fillEl) fillEl.style.width = pct + '%';
    }

    if (mapEl && status.map) mapEl.textContent = status.map;
}

function startServerUpdates() {
    updateAllServers();
    /* TODO [BACKEND]: можно уменьшить интервал когда бэкенд быстрый */
    serverUpdateTimer = setInterval(updateAllServers, 30_000);
}

/* ================================================================
   Подключение к серверу
   ================================================================ */
function connectToServer(ip) {
    const cmd = 'connect ' + ip;
    navigator.clipboard.writeText(cmd).then(() => {
        showToast('Скопировано: ' + cmd);
    }).catch(() => {
        showToast('Команда: ' + cmd);
    });
}

/* ================================================================
   Чат
   ================================================================ */
function initChat() {
    const btn = document.getElementById('chat_btn');
    const pan = document.getElementById('chat_panel');
    if (!btn || !pan) return;
    btn.addEventListener('click', () => pan.classList.toggle('open'));
    document.addEventListener('click', e => {
        if (pan.classList.contains('open') && !pan.contains(e.target) && !btn.contains(e.target)) {
            pan.classList.remove('open');
        }
    });
}

/* ================================================================
   Toast (лёгкое уведомление вместо alert)
   ================================================================ */
function showToast(msg) {
    let t = document.getElementById('_toast');
    if (!t) {
        t = document.createElement('div');
        t.id = '_toast';
        Object.assign(t.style, {
            position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
            background:'#16161b', border:'1px solid rgba(255,255,255,.12)',
            color:'#f0f0f5', padding:'10px 20px', borderRadius:'10px',
            fontSize:'.82rem', fontFamily:'DM Sans,sans-serif',
            zIndex:'9999', transition:'opacity .3s', opacity:'0', pointerEvents:'none'
        });
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._tid);
    t._tid = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

/* ================================================================
   Утилиты
   ================================================================ */
function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}