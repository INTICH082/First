/**
 * Prf.js — страница профиля игрока.
 * Зависит от auth.js и header_auth.js (подключаются выше в HTML).
 *
 * ─── Как подключить бэкенд ───────────────────────────────────────
 *  Места для API-запросов помечены: // TODO [BACKEND]: ...
 * ─────────────────────────────────────────────────────────────────
 */

/* ================================================================
   DOMContentLoaded
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    /* 1. HeaderAuth назначает Auth.onLogin / Auth.onLogout */
    HeaderAuth.init();

    /* 2. Расширяем колбэк: при логине заполняем профиль */
    const originalOnLogin  = Auth.onLogin;
    const originalOnLogout = Auth.onLogout;

    Auth.onLogin = (user) => {
        originalOnLogin(user);
        fillSidebarUser(user);
        /* TODO [BACKEND]: загрузить полный профиль игрока
           fetchProfile(user.id).then(renderProfile); */
        renderProfile(user);   // пока показываем данные из /api/me
    };

    Auth.onLogout = () => {
        originalOnLogout();
        clearProfileCard();
        clearSidebarUser();
    };

    /* 3. Остальные инициализации */
    initOnlineCounter();
    initTabs();
    initChat();
    fetchOnline();

    /* 4. Проверяем сессию */
    Auth.init();
});

/* ================================================================
   Профиль — рендер
   ================================================================ */

/**
 * Заполняет карточку игрока.
 * @param {object} data  — объект пользователя из /api/me или /api/profile/:id
 *
 * TODO [BACKEND]: /api/profile/:id возвращает:
 *   { id, steam_id, nickname, avatar_url, level,
 *     xp_current, xp_total, balance,
 *     hours_played, kd_ratio, headshot_pct, tags: [] }
 */
function renderProfile(data) {
    /* Аватар */
    setAttr('avatar_img', 'src', data.avatar_url || '');
    setAttr('left_sidebar_user_avatar', 'src', data.avatar_url || '');

    /* Ник */
    setText('nickname', data.nickname || '—');

    /* Сайдбар */
    fillSidebarUser(data);

    /* Прогресс-бар */
    const xpCur = data.xp_current || 0;
    const xpMax = data.xp_total   || 0;
    setText('progress_level', 'Уровень ' + (data.level || '—'));
    setText('progress_xp', xpCur.toLocaleString('ru-RU') + ' / ' + (xpMax || '—') + ' XP');

    setTimeout(() => {
        const pct  = xpMax > 0 ? (xpCur / xpMax) * 100 : 0;
        const fill = document.getElementById('progress_fill');
        if (fill) fill.style.width = pct + '%';
    }, 300);

    /* Статистика */
    renderStats(data);

    /* Теги */
    renderTags(data.tags || []);
}

function clearProfileCard() {
    setAttr('avatar_img', 'src', '');
    setText('nickname', '—');
    setText('progress_level', 'Уровень —');
    setText('progress_xp', '— / — XP');
    const fill = document.getElementById('progress_fill');
    if (fill) fill.style.width = '0%';
    const stat = document.getElementById('statistic');
    if (stat) stat.innerHTML = '';
    const tags = document.getElementById('tags');
    if (tags) tags.innerHTML = '';
}

/* ================================================================
   Статистика в карточке
   ================================================================ */
function renderStats(data) {
    const container = document.getElementById('statistic');
    if (!container) return;

    container.innerHTML = '';

    /* TODO [BACKEND]: часы/kd/hs приходят из таблицы user_stats */
    const stats = [
        { value: data.hours_played  ?? '—', label: 'Часов сыграно' },
        { value: data.kd_ratio      ?? '—', label: 'K/D Ratio' },
        { value: data.headshot_pct !== undefined ? data.headshot_pct + '%' : '—', label: 'Хедшоты' }
    ];

    stats.forEach((stat, index) => {
        const item  = document.createElement('div');
        item.className = 'stat_item';

        const value = document.createElement('div');
        value.className   = 'stat_value';
        value.textContent = stat.value;

        const label = document.createElement('div');
        label.className   = 'stat_label';
        label.textContent = stat.label;

        item.appendChild(value);
        item.appendChild(label);
        container.appendChild(item);

        if (index < stats.length - 1) {
            const div = document.createElement('div');
            div.className = 'stat_divider';
            container.appendChild(div);
        }
    });
}

/* ================================================================
   Теги
   ================================================================ */
function renderTags(tags) {
    const container = document.getElementById('tags');
    if (!container) return;
    container.innerHTML = '';
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className   = 'tag_chip';
        span.textContent = tag;
        container.appendChild(span);
    });
}

/* ================================================================
   Сайдбар
   ================================================================ */
function fillSidebarUser(data) {
    setAttr('left_sidebar_user_avatar', 'src', data.avatar_url || '');
    setText('left_sidebar_user_nickname', data.nickname || '—');
    setText('left_sidebar_user_level', data.level ? 'Ур. ' + data.level : '—');
}

function clearSidebarUser() {
    setAttr('left_sidebar_user_avatar', 'src', '');
    setText('left_sidebar_user_nickname', '—');
    setText('left_sidebar_user_level', '—');
}

/* ================================================================
   Онлайн-счётчик
   ================================================================ */
function initOnlineCounter() {
    const counter   = document.getElementById('online_counter');
    const breakdown = document.getElementById('online_breakdown');
    if (!counter || !breakdown) return;

    counter.addEventListener('click', e => {
        e.stopPropagation();
        breakdown.classList.toggle('visible');
    });

    document.addEventListener('click', e => {
        if (!counter.contains(e.target)) breakdown.classList.remove('visible');
    });
}

/**
 * TODO [BACKEND]:
 *   const res  = await fetch('/api/online', { credentials: 'include' });
 *   const data = await res.json();
 *   // { total, cs2, csgo, cssource, cs16 }
 *   applyOnline(data.total, data);
 */
async function fetchOnline() {
    applyOnline(null, null);
}

function applyOnline(total, breakdown) {
    const onEl = document.getElementById('online');
    if (onEl) onEl.textContent = total !== null ? total.toLocaleString('ru-RU') : '—';

    ['cs2', 'csgo', 'cssource', 'cs16'].forEach(g => {
        const row = document.querySelector(`[data-game="${g}"] .count`);
        if (row) row.textContent = (breakdown && breakdown[g] !== undefined)
            ? breakdown[g].toLocaleString('ru-RU')
            : '—';
    });
}

/* ================================================================
   Табы
   ================================================================ */
function initTabs() {
    const buttons  = document.querySelectorAll('#tab_buttons button');
    const contents = document.querySelectorAll('[data-tab-content]');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b  => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.querySelector(`[data-tab-content="${btn.dataset.tab}"]`);
            if (target) target.classList.add('active');
        });
    });

    if (buttons.length > 0) buttons[0].click();
}

/* ================================================================
   Чат
   ================================================================ */
function initChat() {
    const chatBtn   = document.getElementById('chat_btn');
    const chatPanel = document.getElementById('chat_panel');
    if (!chatBtn || !chatPanel) return;

    chatBtn.addEventListener('click', () => chatPanel.classList.toggle('open'));

    document.addEventListener('click', e => {
        if (chatPanel.classList.contains('open') &&
            !chatPanel.contains(e.target) &&
            !chatBtn.contains(e.target)) {
            chatPanel.classList.remove('open');
        }
    });
}

/* ================================================================
   Утилиты
   ================================================================ */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setAttr(id, attr, value) {
    const el = document.getElementById(id);
    if (el) el[attr] = value;
}