document.addEventListener('DOMContentLoaded', () => {
  checkAuthStatus();

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = 'index.html';
    });
  }

  function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType   = localStorage.getItem('userType');
    const userName   = localStorage.getItem('userName');

    const loginLink     = document.getElementById('loginLink');
    const userMenu      = document.getElementById('userMenu');
    const userNameSpan  = document.getElementById('userNameSpan');
    const adminLink     = document.getElementById('adminLink');

    if (isLoggedIn && userName) {
      if (loginLink)    loginLink.style.display = 'none';
      if (userMenu)     userMenu.style.display  = 'block';
      if (userNameSpan) userNameSpan.textContent = userName;
      if (adminLink)    adminLink.style.display = userType === 'admin' ? 'block' : 'none';
    } else {
      if (loginLink) loginLink.style.display = 'block';
      if (userMenu)  userMenu.style.display  = 'none';
    }
  }
});
