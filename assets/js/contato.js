document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formMessage.textContent = ''; // Limpa mensagens anteriores
            formMessage.className = 'mt-3 text-center'; // Reseta classes

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_BASE_URL}/contato`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    formMessage.textContent = result.message;
                    formMessage.classList.add('text-success');
                    contactForm.reset(); // Limpa o formulário após o sucesso
                } else {
                    formMessage.textContent = result.message || 'Erro ao enviar mensagem.';
                    formMessage.classList.add('text-danger');
                }
            } catch (error) {
                console.error('Erro na rede ou servidor:', error);
                formMessage.textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
                formMessage.classList.add('text-danger');
            }
        });
    }
});