/**
 * main.js — страница серверов
 */

// Импорт конфигурации (уже глобально)
const { GAMES, LABEL_COLORS, MOCK_SERVERS } = window.CONFIG;

let currentGame = 'cs2';
let serverUpdateTimer = null;

// DOM элементы
const el = (id) => document.getElementById(id);

// Утилиты
function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

function showToast(msg) {
    let t = el('_toast');
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
    t._tid = setTimeout(() => t.style.opacity = '0', 2500);
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    HeaderAuth.init();

    // Расширяем колбэки Auth
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

    initOnlineCounter();
    buildGameSelector();
    initChat();

    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    selectGame(gameParam && GAMES[gameParam] ? gameParam : 'cs2');

    startServerUpdates();
    Auth.init();
});

// Сайдбар
function fillSidebarUser(user) {
    const av = el('left_sidebar_user_avatar');
    if (av) av.src = user.avatar_url || '';
    const nn = el('left_sidebar_user_nickname');
    if (nn) nn.textContent = user.nickname || '—';
    const lv = el('left_sidebar_user_level');
    if (lv) lv.textContent = `Ур. ${user.level || 0}`;
}

function clearSidebarUser() {
    const av = el('left_sidebar_user_avatar');
    if (av) av.src = '';
    const nn = el('left_sidebar_user_nickname');
    if (nn) nn.textContent = '—';
    const lv = el('left_sidebar_user_level');
    if (lv) lv.textContent = '—';
}

// Онлайн
function initOnlineCounter() {
    const c = el('online_counter');
    const b = el('online_breakdown');
    if (!c || !b) return;
    c.addEventListener('click', e => { e.stopPropagation(); b.classList.toggle('visible'); });
    document.addEventListener('click', e => { if (!c.contains(e.target)) b.classList.remove('visible'); });
}

async function fetchOnline() {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/online`, { credentials: 'include' });
        if (!res.ok) throw new Error('Online fetch failed');
        const data = await res.json();
        updateOnlineDisplay(data.total, data);
    } catch {
        updateOnlineDisplay(null, null);
    }
}

function updateOnlineDisplay(total, breakdown) {
    const onEl = el('online');
    if (onEl) onEl.textContent = total !== null ? total.toLocaleString('ru-RU') : '—';
    ['cs2', 'csgo', 'cssource', 'cs16'].forEach(g => {
        const cell = el(`count_${g}`);
        if (cell) cell.textContent = (breakdown && breakdown[g] !== undefined)
            ? breakdown[g].toLocaleString('ru-RU')
            : '—';
    });
}

// Селектор игры
function buildGameSelector() {
    const wrap = el('game_selector');
    if (!wrap) return;

    const btn = document.createElement('button');
    btn.id = 'gs_btn';
    btn.innerHTML = '<span></span><span></span><i class="fas fa-chevron-down chevron"></i>';

    const dd = document.createElement('div');
    dd.id = 'gs_dd';

    Object.values(GAMES).forEach(g => {
        const opt = document.createElement('div');
        opt.className = 'game_option';
        opt.dataset.game = g.id;
        opt.innerHTML = `<span class="${g.badgeClass}">${g.name}</span><span>${g.fullName}</span>`;
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

function openDD() {
    el('gs_btn')?.classList.add('open');
    el('gs_dd')?.classList.add('open');
}
function closeDD() {
    el('gs_btn')?.classList.remove('open');
    el('gs_dd')?.classList.remove('open');
}

function updateSelector(id) {
    const g = GAMES[id];
    const btn = el('gs_btn');
    if (!btn) return;
    const spans = btn.querySelectorAll('span');
    spans[0].className = g.badgeClass;
    spans[0].textContent = g.name;
    spans[1].textContent = g.fullName;
    document.querySelectorAll('.game_option').forEach(o => {
        o.classList.toggle('active', o.dataset.game === id);
    });
}

function selectGame(id) {
    currentGame = id;
    updateSelector(id);
    const c = LABEL_COLORS[id];
    const lbl = el('game_label');
    if (lbl) {
        lbl.textContent = GAMES[id].fullName;
        Object.assign(lbl.style, {
            background: c.bg,
            color: c.color,
            borderColor: c.border
        });
    }
    renderServers(id);
}

// Серверы
function renderServers(gameId) {
    const grid = el('servers_grid');
    const count = el('servers_count');
    // Используем моки или запрос к API
    const servers = MOCK_SERVERS[gameId] || [];
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
    card.className = 'server_card';
    card.id = `server_${server.id}`;
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
            <div class="server_location"><i class="fas fa-map-marker-alt"></i><span>${escapeHtml(server.location)}</span></div>
            <div class="server_tags">${server.tags.map(t => `<span class="server_tag">${escapeHtml(t)}</span>`).join('')}</div>
            <button class="server_connect_btn" data-ip="${escapeHtml(server.ip)}"><i class="fas fa-play"></i> Подключиться</button>
        </div>`;
    // Вешаем обработчик на кнопку
    card.querySelector('.server_connect_btn').addEventListener('click', (e) => {
        const ip = e.currentTarget.dataset.ip;
        connectToServer(ip);
    });
    return card;
}

async function fetchServersStatus(ids) {
    if (ids.length === 0) return {};
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/servers/status?ids=${ids.join(',')}`, {
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Status fetch failed');
        return await res.json();
    } catch {
        // Fallback: возвращаем пустой объект (все серверы покажут "нет данных")
        return {};
    }
}

function getServerById(id) {
    for (const game of Object.values(MOCK_SERVERS)) {
        const s = game.find(s => s.id === id);
        if (s) return s;
    }
    return null;
}

async function updateAllServers() {
    // Собираем ID всех серверов текущей игры
    const servers = MOCK_SERVERS[currentGame] || [];
    const ids = servers.map(s => s.id);
    const statuses = await fetchServersStatus(ids);

    let totalOnline = 0;
    const breakdown = { cs2: 0, csgo: 0, cssource: 0, cs16: 0 };
    let hasData = false;

    for (const server of servers) {
        const status = statuses[server.id] || { online: null, players: null, ping: null, map: server.map };
        updateServerCard(server.id, status, server.maxPlayers);
        if (status.online === true) {
            hasData = true;
            totalOnline += status.players || 0;
            breakdown[currentGame] += status.players || 0;
        }
    }

    // Общий онлайн обновляем отдельным запросом
    fetchOnline();
}

function updateServerCard(serverId, status, maxPlayers) {
    const statusEl  = el(`status_${serverId}`);
    const playersEl = el(`players_${serverId}`);
    const fillEl    = el(`fill_${serverId}`);
    const pingEl    = el(`ping_${serverId}`);
    const mapEl     = el(`map_${serverId}`);

    if (!statusEl) return;

    statusEl.className = 'server_status';

    if (status.online === null) {
        statusEl.classList.add('server_status_offline');
        if (pingEl) { pingEl.textContent = '—'; pingEl.className = 'server_ping'; }
        if (playersEl) playersEl.textContent = `—/${maxPlayers}`;
        if (fillEl) fillEl.style.width = '0%';
    } else if (!status.online) {
        statusEl.classList.add('server_status_offline');
        if (pingEl) { pingEl.textContent = 'offline'; pingEl.className = 'server_ping'; }
        if (playersEl) playersEl.textContent = `0/${maxPlayers}`;
        if (fillEl) fillEl.style.width = '0%';
    } else if (status.players >= maxPlayers) {
        statusEl.classList.add('server_status_full');
        if (pingEl) { pingEl.textContent = (status.ping ?? '—') + ' ms'; pingEl.className = 'server_ping medium'; }
        if (playersEl) playersEl.textContent = `${status.players}/${maxPlayers}`;
        if (fillEl) fillEl.style.width = '100%';
    } else {
        statusEl.classList.add('server_status_online');
        const pingClass = !status.ping ? '' : status.ping < 50 ? 'good' : status.ping < 100 ? 'medium' : 'bad';
        if (pingEl) { pingEl.textContent = (status.ping ?? '—') + ' ms'; pingEl.className = `server_ping ${pingClass}`; }
        const pct = maxPlayers > 0 ? (status.players / maxPlayers * 100) : 0;
        if (playersEl) playersEl.textContent = `${status.players}/${maxPlayers}`;
        if (fillEl) fillEl.style.width = pct + '%';
    }

    if (mapEl && status.map) mapEl.textContent = status.map;
}

function startServerUpdates() {
    updateAllServers();
    serverUpdateTimer = setInterval(updateAllServers, 30000);
}

// Подключение
function connectToServer(ip) {
    const cmd = `connect ${ip}`;
    navigator.clipboard?.writeText(cmd)
        .then(() => showToast(`Скопировано: ${cmd}`))
        .catch(() => showToast(`Команда: ${cmd}`));
}

// Чат
function initChat() {
    const btn = el('chat_btn');
    const pan = el('chat_panel');
    if (!btn || !pan) return;
    btn.addEventListener('click', () => pan.classList.toggle('open'));
    document.addEventListener('click', e => {
        if (pan.classList.contains('open') && !pan.contains(e.target) && !btn.contains(e.target)) {
            pan.classList.remove('open');
        }
    });
}