/**
 * headerAuth.js — UI авторизации в шапке
 */

const HeaderAuth = (() => {
    const el = (id) => document.getElementById(id);

    function setDisplay(el, show) {
        if (!el) return;
        if (show) {
            // Восстанавливаем display, сохранённый в data-original-display, или 'flex'
            const orig = el.dataset.originalDisplay || 'flex';
            el.style.display = orig;
        } else {
            if (el.style.display !== 'none') {
                el.dataset.originalDisplay = el.style.display || 'flex';
            }
            el.style.display = 'none';
        }
    }

    function setText(id, value) {
        const e = el(id);
        if (e) e.textContent = value;
    }

    function applyUser(user) {
        setDisplay(el('steam_auth'), false);
        setDisplay(el('profile_header_btn'), true);
        setDisplay(el('balance_wrap'), true);

        const av = el('profile_header_avatar');
        if (av) av.src = user.avatar_url || '';
        setText('profile_header_name', user.nickname || '—');
        setText('profile_header_level', `Ур. ${user.level || 0}`);
        setText('balance', (user.balance || 0).toLocaleString('ru-RU') + ' ₽');

        const nd = el('notification');
        if (nd) nd.style.display = (user.notifications_unread > 0) ? 'block' : 'none';

        const cb = el('chat_badge');
        if (cb) {
            const n = user.chat_unread || 0;
            if (n > 0) {
                cb.textContent = n > 99 ? '99+' : n;
                cb.style.display = 'flex';
            } else {
                cb.style.display = 'none';
            }
        }
    }

    function applyGuest() {
        setDisplay(el('steam_auth'), true);
        setDisplay(el('profile_header_btn'), false);
        setDisplay(el('balance_wrap'), false);

        const nd = el('notification');
        if (nd) nd.style.display = 'none';
        const cb = el('chat_badge');
        if (cb) cb.style.display = 'none';
    }

    function initDropdown() {
        const btn = el('profile_header_btn');
        if (!btn) return;

        btn.addEventListener('click', e => {
            e.stopPropagation();
            btn.classList.toggle('open');
        });

        document.addEventListener('click', e => {
            if (!btn.contains(e.target)) btn.classList.remove('open');
        });

        const lob = el('logout_btn');
        if (lob) {
            lob.addEventListener('click', async e => {
                e.preventDefault();
                btn.classList.remove('open');
                await Auth.logout();
            });
        }
    }

    function init() {
        Auth.onLogin  = applyUser;
        Auth.onLogout = applyGuest;
        initDropdown();
        applyGuest();
    }

    return { init };
})();