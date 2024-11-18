document.querySelector('.menu-toggle').addEventListener('click', function() {
    var menu = document.querySelector('.menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});
