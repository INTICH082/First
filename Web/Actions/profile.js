/**
 * profile.js — страница профиля
 */

document.addEventListener('DOMContentLoaded', () => {
    HeaderAuth.init();

    const originalOnLogin = Auth.onLogin;
    Auth.onLogin = (user) => {
        originalOnLogin(user);
        fillSidebarUser(user);
        renderProfile(user);
    };
    const originalOnLogout = Auth.onLogout;
    Auth.onLogout = () => {
        originalOnLogout();
        clearProfileCard();
        clearSidebarUser();
    };

    initOnlineCounter();
    initTabs();
    initChat();
    fetchOnline();

    Auth.init();
});

// Утилиты
const el = (id) => document.getElementById(id);
const setText = (id, val) => { const e = el(id); if (e) e.textContent = val; };
const setAttr = (id, attr, val) => { const e = el(id); if (e) e[attr] = val; };

function renderProfile(data) {
    setAttr('avatar_img', 'src', data.avatar_url || '');
    setAttr('left_sidebar_user_avatar', 'src', data.avatar_url || '');
    setText('nickname', data.nickname || '—');
    fillSidebarUser(data);

    const xpCur = data.xp_current || 0;
    const xpMax = data.xp_total || 0;
    setText('progress_level', `Уровень ${data.level || '—'}`);
    setText('progress_xp', `${xpCur.toLocaleString('ru-RU')} / ${xpMax || '—'} XP`);

    setTimeout(() => {
        const fill = el('progress_fill');
        if (fill) fill.style.width = (xpMax > 0 ? (xpCur / xpMax) * 100 : 0) + '%';
    }, 300);

    renderStats(data);
    renderTags(data.tags || []);
}

function clearProfileCard() {
    setAttr('avatar_img', 'src', '');
    setText('nickname', '—');
    setText('progress_level', 'Уровень —');
    setText('progress_xp', '— / — XP');
    const fill = el('progress_fill');
    if (fill) fill.style.width = '0%';
    const stat = el('statistic');
    if (stat) stat.innerHTML = '';
    const tags = el('tags');
    if (tags) tags.innerHTML = '';
}

function renderStats(data) {
    const container = el('statistic');
    if (!container) return;
    container.innerHTML = '';
    const stats = [
        { value: data.hours_played ?? '—', label: 'Часов сыграно' },
        { value: data.kd_ratio ?? '—', label: 'K/D Ratio' },
        { value: data.headshot_pct !== undefined ? data.headshot_pct + '%' : '—', label: 'Хедшоты' }
    ];
    stats.forEach((stat, i) => {
        const item = document.createElement('div');
        item.className = 'stat_item';
        item.innerHTML = `<div class="stat_value">${stat.value}</div><div class="stat_label">${stat.label}</div>`;
        container.appendChild(item);
        if (i < stats.length - 1) {
            const div = document.createElement('div');
            div.className = 'stat_divider';
            container.appendChild(div);
        }
    });
}

function renderTags(tags) {
    const container = el('tags');
    if (!container) return;
    container.innerHTML = '';
    tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag_chip';
        span.textContent = tag;
        container.appendChild(span);
    });
}

function fillSidebarUser(data) {
    setAttr('left_sidebar_user_avatar', 'src', data.avatar_url || '');
    setText('left_sidebar_user_nickname', data.nickname || '—');
    setText('left_sidebar_user_level', data.level ? `Ур. ${data.level}` : '—');
}

function clearSidebarUser() {
    setAttr('left_sidebar_user_avatar', 'src', '');
    setText('left_sidebar_user_nickname', '—');
    setText('left_sidebar_user_level', '—');
}

// Онлайн
function initOnlineCounter() {
    const counter = el('online_counter');
    const breakdown = el('online_breakdown');
    if (!counter || !breakdown) return;
    counter.addEventListener('click', e => {
        e.stopPropagation();
        breakdown.classList.toggle('visible');
    });
    document.addEventListener('click', e => {
        if (!counter.contains(e.target)) breakdown.classList.remove('visible');
    });
}

async function fetchOnline() {
    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/online`, { credentials: 'include' });
        if (!res.ok) throw new Error('Online fetch failed');
        const data = await res.json();
        applyOnline(data.total, data);
    } catch {
        applyOnline(null, null);
    }
}

function applyOnline(total, breakdown) {
    const onEl = el('online');
    if (onEl) onEl.textContent = total !== null ? total.toLocaleString('ru-RU') : '—';
    ['cs2', 'csgo', 'cssource', 'cs16'].forEach(g => {
        const row = document.querySelector(`[data-game="${g}"] .count`);
        if (row) row.textContent = (breakdown && breakdown[g] !== undefined)
            ? breakdown[g].toLocaleString('ru-RU')
            : '—';
    });
}

// Табы
function initTabs() {
    const buttons = document.querySelectorAll('#tab_buttons button');
    const contents = document.querySelectorAll('[data-tab-content]');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.querySelector(`[data-tab-content="${btn.dataset.tab}"]`);
            if (target) target.classList.add('active');
        });
    });
    if (buttons.length) buttons[0].click();
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