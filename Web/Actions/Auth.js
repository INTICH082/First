/**
 * auth.js — общий модуль авторизации
 * Подключается на каждой странице ДО страничного скрипта:
 *   <script src="../Actions/auth.js"></script>
 *   <script src="../Actions/Main.js"></script>
 *
 * Экспортирует глобальный объект Auth.
 * Страничные скрипты вешают колбэки:
 *   Auth.onLogin  = (user) => { ... }
 *   Auth.onLogout = ()     => { ... }
 */

const Auth = (() => {

    /* ── текущий пользователь (null = не авторизован) ─────────────── */
    let _user = null;

    /* ── колбэки (страница назначает их до DOMContentLoaded) ─────── */
    let _onLogin  = () => {};
    let _onLogout = () => {};

    /* ════════════════════════════════════════════════════════════════
       API
       ════════════════════════════════════════════════════════════════ */

    /**
     * Проверяет сессию на бэкенде.
     * Бэкенд читает session-cookie и возвращает:
     *   200 { id, steam_id, nickname, avatar_url, level, xp_current,
     *          xp_total, balance, notifications_unread, chat_unread }
     *   401 { error: 'unauthorized' }
     *
     * TODO: убедись, что бэкенд отдаёт этот эндпоинт (см. README).
     */
    async function fetchMe() {
        try {
            const res = await fetch('/api/me', { credentials: 'include' });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }

    /**
     * Выход — бэкенд удаляет сессию.
     * TODO: убедись, что POST /api/auth/logout очищает cookie.
     */
    async function fetchLogout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch { /* сеть упала — всё равно чистим UI */ }
    }

    /* ════════════════════════════════════════════════════════════════
       Публичный интерфейс
       ════════════════════════════════════════════════════════════════ */

    /**
     * Вызывается один раз при загрузке страницы.
     * Запрашивает /api/me и обновляет UI.
     */
    async function init() {
        _user = await fetchMe();
        _user ? _onLogin(_user) : _onLogout();
    }

    /**
     * Редирект на Steam OpenID.
     * TODO: замени BASE_URL на домен своего сайта.
     */
    function steamLogin() {
        const BASE_URL   = 'https://твой-сайт.ru'; // ← поменяй
        const returnUrl  = encodeURIComponent(BASE_URL + '/api/auth/steam/callback');
        const realm      = encodeURIComponent(BASE_URL + '/');

        window.location.href =
            'https://steamcommunity.com/openid/login' +
            '?openid.ns='         + encodeURIComponent('http://specs.openid.net/auth/2.0') +
            '&openid.mode=checkid_setup' +
            '&openid.return_to='  + returnUrl +
            '&openid.realm='      + realm +
            '&openid.identity='   + encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select') +
            '&openid.claimed_id=' + encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select');
    }

    /** Выход: чистит сессию на бэкенде, обновляет UI. */
    async function logout() {
        await fetchLogout();
        _user = null;
        _onLogout();
    }

    /** Геттер текущего пользователя. */
    function getUser() { return _user; }

    /** Возвращает true, если пользователь авторизован. */
    function isLoggedIn() { return _user !== null; }

    return {
        init,
        steamLogin,
        logout,
        getUser,
        isLoggedIn,

        /* Страница назначает колбэки ДО вызова Auth.init() */
        set onLogin(fn)  { _onLogin  = fn; },
        set onLogout(fn) { _onLogout = fn; }
    };
})();

/* Глобальная обёртка кнопки Steam (используется в onclick в HTML) */
function steamLogin() { Auth.steamLogin(); }