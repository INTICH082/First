const PlayerData = {
    nickname: 'INTICH',
    avatar: '#',
    level: 35,
    xpCurrent: 1500000,
    xpTotal: 2000000,
    hoursPlayed: 156,
    kdRatio: 3.22,
    headshotPct: 76,
    balance: 120000,
    notifications: 5,
    chatUnread: 32,
    tags: ['VIP', 'Global Elite', 'Verified', 'Owner']
}

function renderPlayer(data) {
    document.getElementById('avatar_img').src = data.avatar;
    document.getElementById('left_sidebar_user_avatar').src = data.avatar;

    document.getElementById('nickname').textContent = data.nickname;
    document.getElementById('left_sidebar_user_nickname').textContent = data.nickname;

    document.getElementById('left_sidebar_user_level').textContent = 'Ур. ' + data.level;
    document.querySelector('.progress_level').textContent = 'Уровень ' + data.level;
    document.querySelector('.progress_xp').textContent = data.xpCurrent + ' / ' + data.xpTotal + 'XP';

    setTimeout(() => {
        const pct = data.xpCurrent / data.xpTotal * 100;
        document.getElementById('progress_fill').style.width = pct + '%';
    }, 200);

    document.getElementById('balance').textContent = data.balance + ' ₽';
}

function renderStats(data) {
    const container = document.getElementById('statistic');
    container.innerHTML = '';

    const stats = [
        { value: data.hoursPlayed, label: 'Часов сыграно' },
        { value: data.kdRatio,     label: 'K/D Ratio' },
        { value: data.headshotPct + '%', label: 'Хедшот' }
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
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag_chip';
        span.textContent = tag;
        container.appendChild(span);
    });
}

function renderHeader(data) {
    document.getElementById('chat_badge').textContent = data.chatUnread;
    document.getElementById('notification').textContent = data.notifications;
    document.getElementById('online').textContent = '1246';
}