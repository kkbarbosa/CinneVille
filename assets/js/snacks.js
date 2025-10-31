document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    let allSnacks = []; // Variável para armazenar todos os snacks carregados
    const snacksSectionTitle = document.getElementById('snacks-section-title'); // Referência ao elemento do título

    async function carregarSnacks() {
        try {
            const response = await fetch(`${API_BASE_URL}/snacks`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const snacks = await response.json();
            allSnacks = snacks; // Armazena todos os snacks
            console.log('Dados de snacks recebidos:', allSnacks);

            renderSnacks(allSnacks); // Renderiza todos os snacks inicialmente

        } catch (error) {
            console.error('Erro ao carregar snacks:', error);
            const listaSnacks = document.getElementById('lista-snacks');
            if (listaSnacks) {
                listaSnacks.innerHTML = `
                    <div class="col-12 text-center text-danger">
                        <p>Falha ao carregar snacks. Tente novamente.</p>
                        <button onclick="window.location.reload()" class="btn btn-warning">Recarregar</button>
                    </div>
                `;
            }
        }
    }

    function renderSnacks(snacksToRender) {
        const listaSnacks = document.getElementById('lista-snacks');

        if (!listaSnacks) {
            console.error("Elemento '#lista-snacks' não encontrado");
            return;
        }

        if (snacksToRender.length === 0) {
            listaSnacks.innerHTML = '<p class="text-center col-12 text-white">Nenhum snack encontrado para esta categoria.</p>';
            return;
        }

        listaSnacks.innerHTML = snacksToRender.map(snack => `
            <div class="col">
                <div class="snack-card h-100 shadow-lg" data-category="${snack.tipo.toLowerCase()}">
                    <div class="snack-image-container">
                        <span class="category-badge">${snack.tipo.toUpperCase()}</span>
                        <span class="price-badge">R$ ${(+snack.preco).toFixed(2).replace('.', ',')}</span>
                        <img src="${snack.imagem_url || 'assets/img/placeholder_snack.jpg'}" class="snack-image" alt="${snack.nome}">
                    </div>
                    <div class="card-body p-4 d-flex flex-column">
                        <h5 class="card-title text-danger fw-bold mb-2">
                            ${getCategoryIcon(snack.tipo)}${snack.nome}
                        </h5>
                        <p class="card-text text-light small mb-3 flex-grow-1">
                            ${snack.descricao || 'Descrição não disponível.'}
                        </p>
                        <div class="mt-auto">
                            <button class="btn add-to-cart-btn text-white" data-snack-id="${snack.id_snack}" data-snack-name="${snack.nome}" data-snack-price="${snack.preco}">
                                <i class="bi bi-cart-plus me-2"></i>Adicionar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-ativa os event listeners para os botões "Adicionar ao Carrinho"
        activateAddToCartButtons();
    }

    // Função auxiliar para ícones baseados no tipo
    function getCategoryIcon(type) {
        switch (type.toLowerCase()) {
            case 'lanche':
                return '<i class="bi bi-cup me-2"></i>';
            case 'bebida':
                return '<i class="bi bi-cup-straw me-2"></i>';
            case 'doce':
                return '<i class="bi bi-emoji-smile me-2"></i>';
            case 'combo':
                return '<i class="bi bi-box-seam me-2"></i>';
            default:
                return '';
        }
    }

    function activateAddToCartButtons() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', async (event) => {
                const userId = localStorage.getItem('userId');
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

                if (!isLoggedIn || !userId) {
                    alert('Você precisa estar logado para adicionar snacks ao carrinho.');
                    return;
                }

                const snackId = event.target.dataset.snackId;
                const snackName = event.target.dataset.snackName;
                const snackPrice = event.target.dataset.snackPrice;

                // Animação do botão
                const originalText = event.target.innerHTML;
                event.target.innerHTML = '<i class="bi bi-check2 me-2"></i>Adicionado!';
                event.target.classList.add('btn-success');
                event.target.classList.remove('add-to-cart-btn');
                event.target.disabled = true;

                try {
                    const response = await fetch(`${API_BASE_URL}/carrinho`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': userId,
                            'x-user-type': localStorage.getItem('tipo') || 'comum'
                        },
                        body: JSON.stringify({
                            tipo_item: 'snack',
                            id_referencia: snackId,
                            quantidade: 1,
                            preco_unitario: snackPrice
                        })
                    });

                    if (response.ok) {
                        // Não mostra mais o alert aqui, a animação já é suficiente
                        // alert(`"${snackName}" adicionado ao carrinho!`);
                    } else {
                        alert('Erro ao adicionar snack ao carrinho.');
                    }
                } catch (error) {
                    console.error('Erro ao adicionar snack ao carrinho:', error);
                    alert('Erro na comunicação com o servidor ao adicionar snack.');
                } finally {
                    // Reseta o botão após 2 segundos
                    setTimeout(() => {
                        event.target.innerHTML = originalText;
                        event.target.classList.remove('btn-success');
                        event.target.classList.add('add-to-cart-btn');
                        event.target.disabled = false;
                    }, 2000);
                }
            });
        });
    }


    // Lógica de Filtragem (movida do HTML)
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            filterSnacks(category);
        });
    });

    // Função para filtrar snacks por categoria
    function filterSnacks(category) {
        let filteredSnacks = [];
        let titleText = '';
        let iconHtml = '';

        // Lógica para filtrar os snacks
        if (category === 'todos') {
            filteredSnacks = allSnacks;
            titleText = 'Todos os Snacks';
            iconHtml = '<i class="bi bi-grid text-danger me-2"></i>';
        } else {
            filteredSnacks = allSnacks.filter(snack => snack.tipo.toLowerCase() === category);
            // Define o texto e ícone baseado na categoria
            switch (category) {
                case 'lanche':
                    titleText = 'Nossos Lanches';
                    iconHtml = '<i class="bi bi-cup text-danger me-2"></i>';
                    break;
                case 'bebida':
                    titleText = 'Nossas Bebidas';
                    iconHtml = '<i class="bi bi-cup-straw text-danger me-2"></i>';
                    break;
                case 'doce':
                    titleText = 'Nossos Doces';
                    iconHtml = '<i class="bi bi-emoji-smile text-danger me-2"></i>';
                    break;
                case 'combo':
                    titleText = 'Nossos Combos';
                    iconHtml = '<i class="bi bi-box-seam text-danger me-2"></i>';
                    break;
                default:
                    titleText = 'Snacks por Categoria'; // Fallback
                    iconHtml = '<i class="bi bi-grid text-danger me-2"></i>';
            }
        }

        // Atualiza o texto e o ícone do título da seção
        if (snacksSectionTitle) {
            snacksSectionTitle.innerHTML = `${iconHtml}${titleText}`;
        }

        renderSnacks(filteredSnacks); // Renderiza os snacks filtrados
    }

    carregarSnacks(); // Carrega os snacks ao carregar a página
});