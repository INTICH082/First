function setupDropdown(triggerSelector, dropdownId) {
    const trigger = document.querySelector(triggerSelector);
    const dropdown = document.getElementById(dropdownId);
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdown.classList.toggle('dropdown-hidden');
        positionNotificationPanel();
    });

    document.addEventListener('click', function(event) {
        if (!trigger.contains(event.target)) {
            dropdown.classList.add('dropdown-hidden');
            positionNotificationPanel();
        }
    });
}

function positionNotificationPanel() {
    const msgDropdown = document.getElementById('messages-dropdown');
    const notifDropdown = document.getElementById('notifications-dropdown');
    const notifContainer = document.querySelector('.icon-panel-container:nth-child(2)');

    if (!notifDropdown || !msgDropdown || !notifContainer) return;

    if (msgDropdown.classList.contains('dropdown-hidden')) {
        notifDropdown.style.top = '0px';
        return;
    }

    const msgRect = msgDropdown.getBoundingClientRect();
    const containerRect = notifContainer.getBoundingClientRect();

    const offset = msgRect.bottom - containerRect.top + 10;
    notifDropdown.style.top = offset + 'px';
}

document.addEventListener('DOMContentLoaded', () => {
    const gameSelector = document.getElementById('game-selector');
    if (gameSelector) {
        const trigger = gameSelector.querySelector('.select-trigger');
        const options = gameSelector.querySelectorAll('.option');
        const selectedText = gameSelector.querySelector('.selected-text');

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            gameSelector.classList.toggle('active');
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = option.dataset.value;
                const text = option.querySelector('span').textContent;
                selectedText.textContent = text;
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                gameSelector.classList.remove('active');
                console.log('Выбрана игра:', value, text);
            });
        });

        document.addEventListener('click', () => {
            gameSelector.classList.remove('active');
        });
    }

    setupDropdown('.online-widget', 'online-dropdown');
    setupDropdown('#messages', 'messages-dropdown');
    setupDropdown('#notifications', 'notifications-dropdown');

    positionNotificationPanel();
});