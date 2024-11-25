// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userContent = document.getElementById('userContent');
    const loginButton = document.getElementById('userLoginButton');
    const registerButton = document.getElementById('userRegisterButton');
    const logoutButton = document.getElementById('userLogoutButton');

    if (isLoggedIn === 'true') {
        userContent.style.display = 'block';
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        logoutButton.style.display = 'block';
    } else {
        userContent.style.display = 'none';
        loginButton.style.display = 'block';
        registerButton.style.display = 'block';
        logoutButton.style.display = 'none';
    }
}

function login() {
    // Add proper validation here
    localStorage.setItem('isLoggedIn', 'true');
    checkLoginStatus();
}

function register() {
    // Add proper validation here
    localStorage.setItem('isLoggedIn', 'true');
    checkLoginStatus();
}

function close_session() {
    localStorage.removeItem('isLoggedIn');
    checkLoginStatus();
}

function updateContentVisibility() {
    const isLogged = localStorage.getItem('logeado') === 'true';
    /*document.getElementById('loginBox').style.display = isLogged ? 'none' : 'block';*/
    document.getElementById('userLoginButton').style.display = isLogged ? 'none' : 'block';
    document.getElementById('userRegisterButton').style.display = isLogged ? 'none' : 'block';
    document.getElementById('userLogoutButton').style.display = isLogged ? 'block' : 'none';
    document.getElementById('userContent').style.display = isLogged ? 'block' : 'none';

}

/*
function login() {
    window.location.reload();
    localStorage.setItem('logeado', 'true');
    updateContentVisibility();
}

function close_session() {
    localStorage.setItem('logeado', 'false');
    updateContentVisibility();
}*/