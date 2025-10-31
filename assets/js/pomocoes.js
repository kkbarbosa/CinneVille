document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';

    async function carregarPromocoes() {
        try {
            const response = await fetch(`${API_BASE_URL}/promocoes`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const promocoes = await response.json();
            console.log('Dados de promoções recebidos:', promocoes); // Adicione esta linha!
            const listaPromocoes = document.getElementById('lista-promocoes');

            if (!listaPromocoes) {
                console.error("Elemento '#lista-promocoes' não encontrado");
                return;
            }

            if (promocoes.length === 0) {
                listaPromocoes.innerHTML = '<p class="text-center col-12">Nenhuma promoção disponível no momento.</p>';
                return; 
            }

            listaPromocoes.innerHTML = promocoes.map(promocao => `
                <div class="col">
                    <div class="card h-100 promo-card text-white bg-dark border-secondary">
                        <img src="${promocao.imagem_url || 'assets/img/placeholder_promocao.jpg'}" class="card-img-top" alt="${promocao.titulo}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${promocao.titulo}</h5>
                            <p class="card-text">${promocao.descricao || 'Detalhes da promoção não disponíveis.'}</p>
                            <p class="card-text mt-auto">Válido de: ${new Date(promocao.data_inicio).toLocaleDateString()} até ${new Date(promocao.data_fim).toLocaleDateString()}</p>
                            ${promocao.valor_desconto ? `<p class="card-text fw-bold">Desconto: R$ ${promocao.valor_desconto.toFixed(2).replace('.', ',')}</p>` : ''}
                            ${promocao.porcentagem_desconto ? `<p class="card-text fw-bold">Desconto: ${promocao.porcentagem_desconto}%</p>` : ''}
                            <span class="badge bg-danger text-white">${promocao.tipo_promocao.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Erro ao carregar promoções:', error);
            const listaPromocoes = document.getElementById('lista-promocoes');
            if (listaPromocoes) {
                listaPromocoes.innerHTML = `
                    <div class="col-12 text-center text-danger">
                        <p>Falha ao carregar promoções. Tente novamente.</p>
                        <button onclick="window.location.reload()" class="btn btn-warning">Recarregar</button>
                    </div>
                `;
            }
        }
    }

    carregarPromocoes(); // Carrega as promoções ao carregar a página
});