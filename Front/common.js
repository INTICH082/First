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

onlinedropdown();