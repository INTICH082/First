function onlinedropdown() {
    const widget = document.querySelector('.online-widget');
    const dropdown = document.getElementById('online-dropdown');

    if (!widget || !dropdown) return;

    widget.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdown.classList.toggle('dropdown-hidden');
    });

    document.addEventListener('click', function(event) {
        if (!widget.contains(event.target)) {
            dropdown.classList.add('dropdown-hidden');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const gameSelector = document.getElementById('game-selector');
    if (!gameSelector) return;

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
});

onlinedropdown();