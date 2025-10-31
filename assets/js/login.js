document.addEventListener('DOMContentLoaded', () => {
  const API = 'http://localhost:5000/api';

  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const captchaToken = grecaptcha.getResponse();
    console.log('token=', captchaToken.slice(0, 30), 'len=', captchaToken.length);
    if (!captchaToken) {
      alert('Por favor marque "Não sou um robô".');
      return;
    }

    const email = form.email.value.trim();
    const senha = form.senha.value.trim();

    try {
      const r = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          senha,
          captchaToken
        })
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data.message || 'Erro no login.');

      // login OK – salva dados
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', data.usuario.id);
      localStorage.setItem('userType', data.usuario.tipo); // unificado para auth.js
      localStorage.setItem('userName', data.usuario.nome);

      // redireciona com refresh anti-cache
      window.location.href = 'index.html?refresh=' + Date.now();
    } catch (err) {
      alert(err.message);
    } finally {
      grecaptcha.reset();
    }
  });
});
