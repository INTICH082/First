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

const SiteData = {
    balance: 2400,
    notifications: 3,
    chatUnread: 7,
    onlineCount: 0,
    onlineBreakdown: { cs2: 0, csgo: 0, cssource: 0, cs16: 0 }
};

const GAMES = {
    cs2: { id: 'cs2', name: 'CS2', fullName: 'Counter-Strike 2', badgeClass: 'badge_cs2' },
    csgo: { id: 'csgo', name: 'CS:GO', fullName: 'Counter-Strike: GO', badgeClass: 'badge_csgo' },
    cssource: { id: 'cssource', name: 'CS:S', fullName: 'CS:Source', badgeClass: 'badge_cssource' },
    cs16: { id: 'cs16', name: 'CS 1.6', fullName: 'Counter-Strike 1.6', badgeClass: 'badge_cs16' }
};

const LABEL_COLORS = {
    cs2: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.25)' },
    csgo: { bg: 'rgba(240,180,41,0.12)', color: '#f0b429', border: 'rgba(240,180,41,0.25)' },
    cssource: { bg: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'rgba(168,85,247,0.25)' },
    cs16: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)' }
};

let currentGame = 'cs2';
let serverUpdateInterval = null;

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initOnlineCounter();
    buildGameSelector();
    initChat();
    
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    selectGame(gameParam && GAMES[gameParam] ? gameParam : 'cs2');
    
    startServerUpdates();
});

function initHeader() {
    document.getElementById('balance').textContent = SiteData.balance.toLocaleString() + ' ₽';
    
    const cb = document.getElementById('chat_badge');
    if (SiteData.chatUnread > 0) {
        cb.textContent = SiteData.chatUnread > 99 ? '99+' : SiteData.chatUnread;
        cb.style.display = 'flex';
    }
    
    if (SiteData.notifications > 0) {
        document.getElementById('notification').style.display = 'block';
    }
}

function updateOnlineDisplay() {
    document.getElementById('online').textContent = SiteData.onlineCount.toLocaleString();
    document.getElementById('count_cs2').textContent = SiteData.onlineBreakdown.cs2.toLocaleString();
    document.getElementById('count_csgo').textContent = SiteData.onlineBreakdown.csgo.toLocaleString();
    document.getElementById('count_cssource').textContent = SiteData.onlineBreakdown.cssource.toLocaleString();
    document.getElementById('count_cs16').textContent = SiteData.onlineBreakdown.cs16.toLocaleString();
}

function initOnlineCounter() {
    const c = document.getElementById('online_counter');
    const b = document.getElementById('online_breakdown');
    c.addEventListener('click', e => {
        e.stopPropagation();
        b.classList.toggle('visible');
    });
    document.addEventListener('click', e => {
        if (!c.contains(e.target)) b.classList.remove('visible');
    });
}

function buildGameSelector() {
    const wrap = document.getElementById('game_selector');
    
    const btn = document.createElement('button');
    btn.id = 'gs_btn';
    const bSpan = document.createElement('span');
    const nSpan = document.createElement('span');
    const chev = document.createElement('i');
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
    document.getElementById('gs_btn').classList.add('open');
    document.getElementById('gs_dd').classList.add('open');
};

const closeDD = () => {
    document.getElementById('gs_btn').classList.remove('open');
    document.getElementById('gs_dd').classList.remove('open');
};

function updateSelector(id) {
    const g = GAMES[id];
    const spans = document.getElementById('gs_btn').querySelectorAll('span');
    spans[0].id = g.badgeClass;
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
    const lbl = document.getElementById('game_label');
    lbl.textContent = GAMES[id].fullName;
    lbl.style.background = c.bg;
    lbl.style.color = c.color;
    lbl.style.borderColor = c.border;
    renderServers(id);
}

async function fetchServerStatus(serverId) {
    const server = getServerById(serverId);
    const isOnline = Math.random() > 0.1;
    
    if (!isOnline) {
        return {
            online: false,
            players: 0,
            maxPlayers: server.maxPlayers,
            ping: null,
            map: server.map
        };
    }
    
    const players = Math.floor(Math.random() * server.maxPlayers);
    
    return {
        online: true,
        players: players,
        maxPlayers: server.maxPlayers,
        ping: Math.floor(Math.random() * 80) + 10,
        map: server.map
    };
}

function getServerById(id) {
    for (const game of Object.values(SERVERS_CONFIG)) {
        const server = game.find(s => s.id === id);
        if (server) return server;
    }
    return null;
}

async function updateAllServers() {
    let totalOnline = 0;
    const breakdown = { cs2: 0, csgo: 0, cssource: 0, cs16: 0 };
    
    for (const [gameId, servers] of Object.entries(SERVERS_CONFIG)) {
        for (const server of servers) {
            const status = await fetchServerStatus(server.id);
            updateServerCard(server.id, status);
            
            if (status.online) {
                totalOnline += status.players;
                breakdown[gameId] += status.players;
            }
        }
    }
    
    SiteData.onlineCount = totalOnline;
    SiteData.onlineBreakdown = breakdown;
    updateOnlineDisplay();
}

function startServerUpdates() {
    updateAllServers();
    serverUpdateInterval = setInterval(updateAllServers, 30000);
}

function renderServers(gameId) {
    const grid = document.getElementById('servers_grid');
    const count = document.getElementById('servers_count');
    const servers = SERVERS_CONFIG[gameId] || [];
    
    count.textContent = servers.length + ' сервер' + (servers.length === 1 ? '' : servers.length < 5 ? 'а' : 'ов');
    
    grid.style.opacity = '0';
    setTimeout(() => {
        grid.innerHTML = '';
        servers.forEach((s, i) => {
            const card = buildServerCard(s);
            card.style.animationDelay = (i * 0.05) + 's';
            grid.appendChild(card);
        });
        grid.style.opacity = '1';
        updateAllServers();
    }, 150);
}

function buildServerCard(server) {
    const card = document.createElement('div');
    card.id = 'server_' + server.id;
    card.className = 'server_card';
    
    card.innerHTML = `
        <div class="server_card_header">
            <div class="server_status server_status_offline" id="status_${server.id}"></div>
            <div class="server_info">
                <div class="server_name">${escapeHtml(server.name)}</div>
                <div class="server_map" id="map_${server.id}">${escapeHtml(server.map)}</div>
            </div>
            <div class="server_ping" id="ping_${server.id}">-- ms</div>
        </div>
        <div class="server_card_body">
            <div class="server_players_bar">
                <div class="server_players_fill" id="fill_${server.id}" style="width: 0%"></div>
            </div>
            <div class="server_players_text" id="players_${server.id}">0/${server.maxPlayers}</div>
        </div>
        <div class="server_card_footer">
            <div class="server_location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${escapeHtml(server.location)}</span>
            </div>
            <div class="server_tags" id="tags_${server.id}">
                ${server.tags.map(t => `<span class="server_tag">${escapeHtml(t)}</span>`).join('')}
            </div>
            <button class="server_connect_btn" onclick="connectToServer('${server.ip}')">
                <i class="fas fa-play"></i> Подключиться
            </button>
        </div>
    `;
    
    return card;
}

function updateServerCard(serverId, status) {
    const statusEl = document.getElementById('status_' + serverId);
    const playersEl = document.getElementById('players_' + serverId);
    const fillEl = document.getElementById('fill_' + serverId);
    const pingEl = document.getElementById('ping_' + serverId);
    const mapEl = document.getElementById('map_' + serverId);
    
    if (!statusEl) return;
    
    statusEl.className = 'server_status';
    if (!status.online) {
        statusEl.classList.add('server_status_offline');
        pingEl.textContent = 'offline';
        pingEl.className = 'server_ping';
    } else if (status.players >= status.maxPlayers) {
        statusEl.classList.add('server_status_full');
        pingEl.textContent = status.ping + ' ms';
        pingEl.className = 'server_ping medium';
    } else {
        statusEl.classList.add('server_status_online');
        pingEl.textContent = status.ping + ' ms';
        pingEl.className = 'server_ping ' + (status.ping < 50 ? 'good' : status.ping < 100 ? 'medium' : 'bad');
    }
    
    playersEl.textContent = `${status.players}/${status.maxPlayers}`;
    const percent = status.maxPlayers > 0 ? (status.players / status.maxPlayers * 100) : 0;
    fillEl.style.width = percent + '%';
    
    if (status.map) {
        mapEl.textContent = status.map;
    }
}

function connectToServer(ip) {
    navigator.clipboard.writeText('connect ' + ip).then(() => {
        console.log('Команда скопирована: connect ' + ip);
        alert('Команда подключения скопирована в буфер обмена: connect ' + ip);
    });
}

function initChat() {
    const btn = document.getElementById('chat_btn');
    const pan = document.getElementById('chat_panel');
    btn.addEventListener('click', () => pan.classList.toggle('open'));
    document.addEventListener('click', e => {
        if (pan.classList.contains('open') && !pan.contains(e.target) && !btn.contains(e.target)) {
            pan.classList.remove('open');
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}