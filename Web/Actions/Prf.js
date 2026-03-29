const PlayerData = {
    nickname: '',
    avatar: '',
    level: 0,
    xpCurrent: 0,
    xpTotal: 0,
    hoursPlayed: 0,
    kdRatio: 0,
    headshotPct: 0,
    balance: 0,
    notifications: 0,
    chatUnread: 0,
    tags: [],
    onlineCount: 0,
    onlineBreakdown: {
        cs2: 0,
        csgo: 0,
        cssource: 0,
        cs16: 0
    }
};

function renderPlayer(data) {
    document.getElementById('avatar_img').src = data.avatar;
    document.getElementById('left_sidebar_user_avatar').src = data.avatar;
    document.getElementById('nickname').textContent = data.nickname;
    document.getElementById('left_sidebar_user_nickname').textContent = data.nickname;
    document.getElementById('left_sidebar_user_level').textContent = 'Ур. ' + data.level;
    document.getElementById('progress_level').textContent = 'Уровень ' + data.level;
    document.getElementById('progress_xp').textContent = data.xpCurrent.toLocaleString() + ' / ' + data.xpTotal.toLocaleString() + ' XP';

    setTimeout(() => {
        const pct = (data.xpCurrent / data.xpTotal) * 100;
        document.getElementById('progress_fill').style.width = pct + '%';
    }, 300);

    document.getElementById('balance').textContent = data.balance.toLocaleString() + ' ₽';
    
    const onlineEl = document.getElementById('online');
    if (onlineEl) onlineEl.textContent = data.onlineCount.toLocaleString();
}

function renderStats(data) {
    const container = document.getElementById('statistic');
    if (!container) return;
    
    container.innerHTML = '';
    const stats = [
        { value: data.hoursPlayed, label: 'Часов сыграно' },
        { value: data.kdRatio, label: 'K/D Ratio' },
        { value: data.headshotPct + '%', label: 'Хедшоты' }
    ];

    stats.forEach((stat, index) => {
        const item = document.createElement('div');
        item.className = 'stat_item';

        const value = document.createElement('div');
        value.className = 'stat_value';
        value.textContent = stat.value;

        const label = document.createElement('div');
        label.className = 'stat_label';
        label.textContent = stat.label;

        item.appendChild(value);
        item.appendChild(label);
        container.appendChild(item);

        if (index < stats.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'stat_divider';
            container.appendChild(divider);
        }
    });
}

function renderTags(tags) {
    const container = document.getElementById('tags');
    if (!container) return;
    
    container.innerHTML = '';
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag_chip';
        span.textContent = tag;
        container.appendChild(span);
    });
}

function renderHeader(data) {
    const chatBadge = document.getElementById('chat_badge');
    if (chatBadge) {
        if (data.chatUnread > 0) {
            chatBadge.textContent = data.chatUnread > 99 ? '99+' : data.chatUnread;
            chatBadge.style.display = 'flex';
        } else {
            chatBadge.style.display = 'none';
        }
    }

    const notificationDot = document.getElementById('notification');
    if (notificationDot) {
        notificationDot.style.display = data.notifications > 0 ? 'block' : 'none';
    }
}

function initOnlineCounter() {
    const counter = document.getElementById('online_counter');
    const breakdown = document.getElementById('online_breakdown');
    if (!counter || !breakdown) return;

    Object.entries(PlayerData.onlineBreakdown).forEach(([game, count]) => {
        const row = breakdown.querySelector(`[data-game="${game}"] .count`);
        if (row) row.textContent = count.toLocaleString();
    });

    counter.addEventListener('click', (e) => {
        e.stopPropagation();
        breakdown.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
        if (!counter.contains(e.target)) {
            breakdown.classList.remove('visible');
        }
    });
}

function initTabs() {
    const buttons = document.querySelectorAll('#tab_buttons button');
    const contents = document.querySelectorAll('[data-tab-content]');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            
            const targetContent = document.querySelector(`[data-tab-content="${tabName}"]`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    if (buttons.length > 0) {
        buttons[0].click();
    }
}

function initChat() {
    const chatBtn = document.getElementById('chat_btn');
    const chatPanel = document.getElementById('chat_panel');
    
    if (!chatBtn || !chatPanel) return;
    
    chatBtn.addEventListener('click', () => {
        chatPanel.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
        if (chatPanel.classList.contains('open') && 
            !chatPanel.contains(e.target) && 
            !chatBtn.contains(e.target)) {
            chatPanel.classList.remove('open');
        }
    });
}

function steamLogin() {
    const returnUrl = encodeURIComponent('https://твой-сайт.ru/auth/steam/callback');
    const realm     = encodeURIComponent('https://твой-сайт.ru/');

    const steamOpenIdUrl =
        'https://steamcommunity.com/openid/login' +
        '?openid.ns='         + encodeURIComponent('http://specs.openid.net/auth/2.0') +
        '&openid.mode=checkid_setup' +
        '&openid.return_to='  + returnUrl +
        '&openid.realm='      + realm +
        '&openid.identity='   + encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select') +
        '&openid.claimed_id=' + encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select');

    window.location.href = steamOpenIdUrl;
}

document.addEventListener('DOMContentLoaded', () => {
    renderPlayer(PlayerData);
    renderHeader(PlayerData);
    renderStats(PlayerData);
    renderTags(PlayerData.tags);
    initOnlineCounter();
    initTabs();
    initChat();
});