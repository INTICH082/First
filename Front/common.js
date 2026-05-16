const panels = [];

function setExpanded(trigger, dropdown) {
    if (!trigger.hasAttribute('aria-expanded')) return;
    trigger.setAttribute(
        'aria-expanded',
        dropdown.classList.contains('dropdown-hidden') ? 'false' : 'true'
    );
}

function closeAllPanels(exceptDropdown) {
    panels.forEach(({ trigger, dropdown }) => {
        if (dropdown !== exceptDropdown) {
            dropdown.classList.add('dropdown-hidden');
            setExpanded(trigger, dropdown);
        }
    });
}

function setupDropdown(triggerSelector, dropdownId) {
    const trigger = document.querySelector(triggerSelector);
    const dropdown = document.getElementById(dropdownId);
    if (!trigger || !dropdown) return;

    panels.push({ trigger, dropdown });

    trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        const wasHidden = dropdown.classList.contains('dropdown-hidden');
        closeAllPanels(dropdown);
        dropdown.classList.toggle('dropdown-hidden', !wasHidden);
        setExpanded(trigger, dropdown);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const gameSelector = document.getElementById('game-selector');
    if (gameSelector) {
        const trigger = gameSelector.querySelector('.select-trigger');
        const options = gameSelector.querySelectorAll('.option');
        const selectedText = gameSelector.querySelector('.selected-text');

        if (trigger && selectedText && options.length) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                gameSelector.classList.toggle('active');
            });

            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const label = option.querySelector('span');
                    selectedText.textContent = label ? label.textContent : '';
                    options.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    gameSelector.classList.remove('active');
                });
            });
        }
    }

    setupDropdown('.online-widget', 'online-dropdown');
    setupDropdown('#messages', 'messages-dropdown');
    setupDropdown('#notifications', 'notifications-dropdown');

    document.addEventListener('click', (event) => {
        panels.forEach(({ trigger, dropdown }) => {
            if (
                !trigger.contains(event.target) &&
                !dropdown.contains(event.target) &&
                !dropdown.classList.contains('dropdown-hidden')
            ) {
                dropdown.classList.add('dropdown-hidden');
                setExpanded(trigger, dropdown);
            }
        });

        const gs = document.getElementById('game-selector');
        if (gs && gs.classList.contains('active') && !gs.contains(event.target)) {
            gs.classList.remove('active');
        }
    });
});