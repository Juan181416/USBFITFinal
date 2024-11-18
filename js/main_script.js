document.addEventListener('DOMContentLoaded', () => {
    updateContentVisibility();
});

function updateContentVisibility() {
    const isLogged = localStorage.getItem('logeado') === 'true';
    /*document.getElementById('loginBox').style.display = isLogged ? 'none' : 'block';*/
    document.getElementById('userLoginButton').style.display = isLogged ? 'none' : 'block';
    document.getElementById('userRegisterButton').style.display = isLogged ? 'none' : 'block';
    document.getElementById('userLogoutButton').style.display = isLogged ? 'block' : 'none';
    document.getElementById('userContent').style.display = isLogged ? 'block' : 'none';

}

function login() {
    window.location.reload();
    localStorage.setItem('logeado', 'true');
    updateContentVisibility();
}

function close_session() {
    localStorage.setItem('logeado', 'false');
    updateContentVisibility();
}