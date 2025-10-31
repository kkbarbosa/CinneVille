document.addEventListener('DOMContentLoaded', () => {
  const API = 'http://localhost:5000/api';
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('tipo') || 'comum';

  if (!userId) {
    window.location.href = 'login.html';
    return;
  }

  // Elementos do DOM
  const carrinhoEl = document.getElementById('carrinho-container');
  const emptyCartEl = document.getElementById('empty-cart');
  const totalEl = document.getElementById('total-carrinho');
  const pontosEl = document.getElementById('points-earned');
  const btnCheckout = document.getElementById('btnCheckout');

  async function carregarCarrinho() {
    try {
      // Mostrar loading
      if (carrinhoEl) {
        carrinhoEl.innerHTML = `
          <div class="text-center py-5">
            <div class="spinner-border text-danger mb-3" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="text-white">Carregando seus itens...</p>
          </div>
        `;
      }

      const response = await fetch(`${API}/carrinho/${userId}`, {
        headers: { 'x-user-id': userId, 'x-user-type': userType }
      });

      if (!response.ok) throw new Error('Falha ao carregar carrinho');

      const itens = await response.json();

      if (!itens.length) {
        mostrarCarrinhoVazio();
        return;
      }

      // Ocultar mensagem de carrinho vazio
      if (emptyCartEl) emptyCartEl.style.display = 'none';
      if (carrinhoEl) carrinhoEl.style.display = 'block';

      renderizarItens(itens);

    } catch (error) {
      console.error('Erro:', error);
      mostrarErro(error.message);
    }
  }

  function mostrarCarrinhoVazio() {
    if (carrinhoEl) carrinhoEl.style.display = 'none';
    if (emptyCartEl) emptyCartEl.style.display = 'block';
    if (totalEl) totalEl.textContent = 'R$ 0,00';
    if (pontosEl) pontosEl.textContent = '0';

    // Desabilitar botão de checkout
    if (btnCheckout) {
      btnCheckout.disabled = true;
      btnCheckout.innerHTML = `
        <i class="bi bi-cart-x me-2"></i>
        Carrinho Vazio
      `;
    }
  }

  function mostrarErro(mensagem) {
    if (carrinhoEl) {
      carrinhoEl.innerHTML = `
        <div class="cart-card p-5 text-center">
          <i class="bi bi-exclamation-triangle display-1 text-warning mb-4"></i>
          <h4 class="text-white mb-3">Ops! Algo deu errado</h4>
          <p class="text-white mb-4">${mensagem}</p>
          <button class="btn btn-danger" onclick="location.reload()">
            <i class="bi bi-arrow-clockwise me-2"></i>Tentar Novamente
          </button>
        </div>
      `;
    }
  }

  function renderizarItens(itens) {
    if (carrinhoEl) carrinhoEl.innerHTML = '';
    let total = 0;

    itens.forEach(item => {
      const precoUnitario = parseFloat(item.preco_unitario) || 0;
      const quantidade = parseInt(item.quantidade) || 1;
      const subtotal = precoUnitario * quantidade;
      total += subtotal;

      const isIngresso = item.tipo_item === 'ingresso';
      const nomeItem = item.nome_item || (isIngresso ? 'Ingresso de Cinema' : 'Snack');

      const itemEl = document.createElement('div');
      itemEl.className = 'cart-card mb-3 animate__animated animate__fadeInUp';
      itemEl.style.animationDelay = `${itens.indexOf(item) * 0.1}s`;

      itemEl.innerHTML = `
        <div class="p-4">
          <div class="row align-items-center">
            <div class="col-md-2">
              <div class="item-image-placeholder bg-dark rounded d-flex align-items-center justify-content-center" 
                   style="width: 80px; height: 80px;">
                <i class="bi ${isIngresso ? 'bi-ticket-perforated' : 'bi-cup-straw'} fs-2 text-danger"></i>
              </div>
            </div>
            <div class="col-md-4">
              <h6 class="text-white fw-bold mb-2">
                <i class="bi ${isIngresso ? 'bi-film' : 'bi-cup-hot'} text-danger me-2"></i>
                ${nomeItem}
              </h6>
              ${isIngresso ? `
                <div class="mb-1">
                  <small class="text-warning">
                    <i class="bi bi-calendar-event me-1"></i>
                    Sessão disponível
                  </small>
                </div>
                <div class="mb-1">
                  <small class="text-info">
                    <i class="bi bi-geo-alt me-1"></i>
                    Sala Premium
                  </small>
                </div>
              ` : `
                <small class="text-white">
                  <i class="bi bi-shop me-1"></i>
                  Disponível na lanchonete
                </small>
              `}
            </div>
            <div class="col-md-2">
              <div class="qty-control d-flex align-items-center">
                ${item.tipo_item === 'snack' ? `
                  <button class="qty-btn btn-quantidade" data-action="decrease" data-id="${item.id_carrinho}">
                    <i class="bi bi-dash"></i>
                  </button>
                  <span class="text-white fw-bold mx-3">${quantidade}</span>
                  <button class="qty-btn btn-quantidade" data-action="increase" data-id="${item.id_carrinho}">
                    <i class="bi bi-plus"></i>
                  </button>
                ` : `
                  <span class="text-white fw-bold mx-auto">${quantidade}</span>
                `}
              </div>
            </div>
            <div class="col-md-2 text-center">
              <div class="item-total mb-1">R$ ${subtotal.toFixed(2).replace('.', ',')}</div>
              <small class="text-white">R$ ${precoUnitario.toFixed(2).replace('.', ',')} cada</small>
            </div>
            <div class="col-md-2 text-end">
              <button class="remove-btn btn-remover" data-id="${item.id_carrinho}" 
                      title="Remover item">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;

      if (carrinhoEl) carrinhoEl.appendChild(itemEl);
    });

    // Atualizar totais
    if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (pontosEl) pontosEl.textContent = Math.floor(total);

    // Habilitar botão de checkout
    if (btnCheckout) {
      btnCheckout.disabled = false;
      btnCheckout.innerHTML = `
        <i class="bi bi-credit-card me-2"></i>
        Finalizar Compra
      `;
    }

    // Adicionar animação suave
    setTimeout(() => {
      document.querySelectorAll('.cart-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 50);
  }

  // Eventos para quantidade e remoção
  if (carrinhoEl) {
    carrinhoEl.addEventListener('click', async (e) => {
      // REMOVER ITEM DO CARRINHO
      if (e.target.classList.contains('btn-remover') || e.target.closest('.btn-remover')) {
        const button = e.target.closest('.btn-remover');
        const itemId = button.dataset.id;

        // Animação de remoção
        const card = button.closest('.cart-card');
        card.style.transform = 'translateX(100%)';
        card.style.opacity = '0';

        setTimeout(async () => {
          try {
            const response = await fetch(`${API}/carrinho/${itemId}`, {
              method: 'DELETE',
              headers: { 'x-user-id': userId, 'x-user-type': userType }
            });

            if (!response.ok) throw new Error('Falha ao remover item');

            await carregarCarrinho();
            mostrarToast('Item removido com sucesso!', 'success');
          } catch (error) {
            console.error('Erro ao remover item:', error);
            mostrarToast('Erro ao remover item', 'error');
            card.style.transform = 'translateX(0)';
            card.style.opacity = '1';
          }
        }, 300);
      }

      // AUMENTAR / DIMINUIR QUANTIDADE
      else if (e.target.closest('.btn-quantidade')) {
        const button = e.target.closest('.btn-quantidade');
        const action = button.dataset.action; // "increase" ou "decrease"
        const itemId = button.dataset.id;

        try {
          const response = await fetch(`${API}/carrinho/${itemId}/${action}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId,
              'x-user-type': userType
            }
          });

          if (!response.ok) throw new Error('Erro ao atualizar quantidade');

          await carregarCarrinho();
        } catch (error) {
          console.error('Erro ao alterar quantidade:', error);
          mostrarToast('Erro ao atualizar item', 'error');
        }
      }
    });
  }

  // Evento para finalizar compra
  if (btnCheckout) {
    btnCheckout.addEventListener('click', async () => {
      try {
        // Animação do botão
        btnCheckout.disabled = true;
        btnCheckout.innerHTML = `
          <div class="spinner-border spinner-border-sm me-2"></div>
          Processando compra...
        `;

        const response = await fetch(`${API}/carrinho/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
            'x-user-type': userType
          }
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Erro ao finalizar compra');

        // Sucesso - mostrar modal
        mostrarModalSucesso(data);

      } catch (error) {
        console.error('Erro no checkout:', error);
        mostrarToast(`Erro: ${error.message}`, 'error');

        // Restaurar botão
        if (btnCheckout) {
          btnCheckout.disabled = false;
          btnCheckout.innerHTML = `
            <i class="bi bi-credit-card me-2"></i>
            Finalizar Compra
          `;
        }
      }
    });
  }

  function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${tipo}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="bi ${tipo === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>
        ${mensagem}
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function mostrarModalSucesso(data) {
    const modalHtml = `
      <div class="modal fade" id="sucessoModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark text-white border-0">
            <div class="modal-body text-center p-5">
              <div class="success-animation mb-4">
                <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
              </div>
              <h3 class="text-white fw-bold mb-3">🎬 Compra Realizada!</h3>
              <p class="text-white mb-3">
                Compra #${data.id_compra} finalizada com sucesso!
              </p>
              <p class="text-white mb-4">
                <strong>Valor Total:</strong> R$ ${data.valor_total.toFixed(2).replace('.', ',')}
              </p>
              <div class="d-flex gap-3 justify-content-center">
                <a href="historico.html" class="btn btn-danger btn-lg">
                  <i class="bi bi-clock-history me-2"></i>Ver Histórico
                </a>
                <a href="index.html" class="btn btn-outline-light btn-lg">
                  <i class="bi bi-house me-2"></i>Voltar ao Início
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('sucessoModal'));
    modal.show();

    // Limpar carrinho após mostrar modal
    setTimeout(() => carregarCarrinho(), 1000);
  }

  // CSS para animações
  const style = document.createElement('style');
  style.textContent = `
    .toast-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      border: 1px solid #333;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 9999;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }
    
    .toast-notification.show {
      transform: translateX(0);
    }
    
    .toast-notification.success {
      border-left: 4px solid #28a745;
    }
    
    .toast-notification.error {
      border-left: 4px solid #dc3545;
    }
    
    .success-animation i {
      animation: successPulse 0.6s ease-out;
    }
    
    @keyframes successPulse {
      0% { transform: scale(0); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .cart-card {
      transition: all 0.3s ease;
    }
    
    .cart-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(229, 9, 20, 0.2);
    }
  `;
  document.head.appendChild(style);

  // Carregar carrinho inicial
  carregarCarrinho();
});