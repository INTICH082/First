/**
 * auth.js — общий модуль авторизации
 */

const Auth = (() => {
    let _user = null;
    let _onLogin  = () => {};
    let _onLogout = () => {};

    const API_BASE = window.CONFIG?.API_BASE_URL || window.location.origin;

    async function fetchMe() {
        try {
            const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null;
        }
    }

    async function fetchLogout() {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch { /* игнорируем */ }
    }

    async function init() {
        _user = await fetchMe();
        _user ? _onLogin(_user) : _onLogout();
    }

    function steamLogin() {
        const returnUrl = encodeURIComponent(`${API_BASE}/api/auth/steam/callback`);
        const realm     = encodeURIComponent(`${API_BASE}/`);
        window.location.href =
            'https://steamcommunity.com/openid/login' +
            '?openid.ns='         + encodeURIComponent('http://specs.openid.net/auth/2.0') +
            '&openid.mode=checkid_setup' +
            '&openid.return_to='  + returnUrl +
            '&openid.realm='      + realm +
            '&openid.identity='   + encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select') +
            '&openid.claimed_id=' + encodeURIComponent('http://specs.openid.net/auth/2.0/identifier_select');
    }

    async function logout() {
        await fetchLogout();
        _user = null;
        _onLogout();
    }

    function getUser() { return _user; }
    function isLoggedIn() { return _user !== null; }

    return {
        init,
        steamLogin,
        logout,
        getUser,
        isLoggedIn,
        set onLogin(fn)  { _onLogin = fn; },
        set onLogout(fn) { _onLogout = fn; }
    };
})();

// Глобальная функция для кнопки (вызывается из HTML)
window.steamLogin = () => Auth.steamLogin();