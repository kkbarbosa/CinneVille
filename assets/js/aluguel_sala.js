document.addEventListener('DOMContentLoaded', () => {
    const rentalForm = document.getElementById('rentalForm');
    const formMessage = document.getElementById('formMessage');
    const salaSelect = document.getElementById('id_sala'); // Onde as salas serão listadas
    const API_BASE_URL = 'http://localhost:5000/api'; // Certifique-se que esta URL está correta

    // Função para carregar as salas no select
    async function loadSalas() {
        try {
            const response = await fetch(`${API_BASE_URL}/salas`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar salas: ${response.status} ${response.statusText}`);
            }
            const salas = await response.json();

            salaSelect.innerHTML = '<option value="">Selecione uma Sala</option>'; // Opção padrão
            salas.forEach(sala => {
                const option = document.createElement('option');
                option.value = sala.id_sala;
                // CORRIGIDO AQUI: Usando sala.nome_sala em vez de sala.nome
                option.textContent = `${sala.nome_sala} (Capacidade: ${sala.capacidade_total})`; // Ajuste aqui para nome_sala e capacidade_total
                salaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar salas:', error);
            formMessage.textContent = 'Erro ao carregar as salas disponíveis. Tente novamente mais tarde.';
            formMessage.classList.add('text-danger');
        }
    }

    // Carrega as salas quando a página é carregada
    if (salaSelect) {
        loadSalas();
    }

    if (rentalForm) {
        rentalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            formMessage.textContent = ''; // Limpa mensagens anteriores
            formMessage.className = 'mt-3 text-center'; // Reseta classes

            const formData = new FormData(rentalForm);
            const data = Object.fromEntries(formData.entries());

            // Adiciona o id_usuario se o usuário estiver logado
            const userId = localStorage.getItem('userId');
            if (userId) {
                data.id_usuario = userId;
            }

            console.log('Dados da solicitação de aluguel:', data);

            try {
                const headers = {
                    'Content-Type': 'application/json',
                };
                // Se o usuário estiver logado, adicione o id_usuario aos headers para o backend pegar
                if (userId) {
                    headers['x-user-id'] = userId;
                }
                // Se você tiver userType no localStorage e o backend precisar, adicione também
                const userType = localStorage.getItem('userType');
                if (userType) {
                    headers['x-user-type'] = userType;
                }


                const response = await fetch(`${API_BASE_URL}/aluguel`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || `Erro do servidor: ${response.status}`);
                }

                formMessage.textContent = 'Sua solicitação de aluguel foi enviada com sucesso! Entraremos em contato em breve.';
                formMessage.classList.add('text-success');
                rentalForm.reset();

            } catch (error) {
                console.error('Erro ao enviar solicitação de aluguel:', error);
                formMessage.textContent = error.message || 'Ocorreu um erro ao enviar sua solicitação. Tente novamente.';
                formMessage.classList.add('text-danger');
            }
        });
    }
});