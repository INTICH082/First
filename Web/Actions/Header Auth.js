/**
 * header_auth.js — общий UI-модуль для кнопки авторизации в шапке.
 * Подключается на каждой странице ПОСЛЕ auth.js:
 *   <script src="../Actions/auth.js"></script>
 *   <script src="../Actions/header_auth.js"></script>
 *   <script src="../Actions/Main.js"></script>  (или Prf.js)
 *
 * Ожидает в HTML:
 *   #steam_auth        — кнопка «Войти через Steam»
 *   #profile_header_btn  — кнопка-профиль (скрыта по умолчанию)
 *     #profile_header_avatar
 *     #profile_header_name
 *     #profile_header_level
 *     #profile_header_dropdown
 *     #logout_btn
 *   #balance_wrap      — блок баланса (скрыт когда не авторизован)
 *   #notification      — точка уведомлений
 *   #chat_badge        — бейдж чата
 */

const HeaderAuth = (() => {

    function show(el)  { if (el) el.style.display = 'flex'; }
    function hide(el)  { if (el) el.style.display = 'none'; }
    function el(id)    { return document.getElementById(id); }
    function txt(id,v) { const e=el(id); if(e) e.textContent=v; }

    /* ── применить данные пользователя в шапке ─────────────────── */
    function applyUser(user) {
        /* Кнопка Steam → скрыть */
        hide(el('steam_auth'));

        /* Кнопка профиля → показать */
        const btn = el('profile_header_btn');
        if (btn) {
            btn.style.display = 'flex';
            const av = el('profile_header_avatar');
            if (av) av.src = user.avatar_url || '';
            txt('profile_header_name',  user.nickname || '—');
            txt('profile_header_level', 'Ур. ' + (user.level || 0));
        }

        /* Баланс */
        const bw = el('balance_wrap');
        if (bw) {
            bw.style.display = 'flex';
            txt('balance', (user.balance || 0).toLocaleString('ru-RU') + ' ₽');
        }

        /* Уведомления */
        const nd = el('notification');
        if (nd) nd.style.display = (user.notifications_unread > 0) ? 'block' : 'none';

        /* Бейдж чата */
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

    /* ── сброс шапки в «не авторизован» ─────────────────────────── */
    function applyGuest() {
        show(el('steam_auth'));
        hide(el('profile_header_btn'));
        hide(el('balance_wrap'));
        const nd = el('notification');
        if (nd) nd.style.display = 'none';
        const cb = el('chat_badge');
        if (cb) cb.style.display = 'none';
    }

    /* ── дропдаун профиля ──────────────────────────────────────── */
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

    /* ── инициализация: вешаем колбэки Auth ─────────────────────── */
    function init() {
        Auth.onLogin  = applyUser;
        Auth.onLogout = applyGuest;
        initDropdown();
        /* applyGuest — немедленное «до ответа сервера» состояние */
        applyGuest();
    }

    return { init };
})();