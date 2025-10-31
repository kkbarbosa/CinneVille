// historico.js - Interface melhorada com tema cinematográfico

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  const userId = localStorage.getItem('userId');
  const tipo = localStorage.getItem('tipo');
  const isAdmin = tipo === 'admin';

  const purchaseHistoryList = document.getElementById('purchaseHistoryList');
  const noPurchasesMessage = document.getElementById('noPurchasesMessage');
  const errorMessage = document.getElementById('errorMessage');

  const totalComprasElement = document.getElementById('totalCompras');
  const totalGastoElement = document.getElementById('totalGasto');
  const totalPontosElement = document.getElementById('totalPontos');
  const totalFilmesElement = document.getElementById('totalFilmes');

  async function loadPurchaseHistory() {
    try {
      // Mostrar loading elegante
      if (purchaseHistoryList) {
        purchaseHistoryList.innerHTML = `
          <div class="col-12">
            <div class="purchase-card text-center py-5">
              <div class="loading-cinema mb-4">
                <i class="bi bi-film display-1 text-danger mb-3 loading-icon"></i>
                <div class="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <h4 class="text-white mb-2">Carregando seu histórico...</h4>
              <p class="text-white">Buscando suas experiências cinematográficas</p>
            </div>
          </div>
        `;
      }

      const endpoint = isAdmin
        ? `${API_BASE_URL}/purchases`
        : `${API_BASE_URL}/usuarios/${userId}/compras`;

      const response = await fetch(endpoint, {
        headers: {
          'x-user-id': userId,
          'x-user-type': tipo
        }
      });

      if (!response.ok) throw new Error('Erro ao carregar histórico');

      const purchases = await response.json();

      if (!purchases.length) {
        mostrarHistoricoVazio();
        return;
      }

      if (noPurchasesMessage) noPurchasesMessage.style.display = 'none';
      await renderizarHistorico(purchases);

    } catch (error) {
      console.error('Erro:', error);
      mostrarErro(error.message);
    }
  }

  function mostrarHistoricoVazio() {
    if (noPurchasesMessage) noPurchasesMessage.style.display = 'block';
    if (purchaseHistoryList) purchaseHistoryList.innerHTML = '';
  }

  function mostrarErro(mensagem) {
    if (errorMessage) {
      errorMessage.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="bi bi-exclamation-triangle fs-3 me-3"></i>
          <div>
            <strong>Ops! Algo deu errado</strong>
            <p class="mb-0">${mensagem}</p>
          </div>
        </div>
      `;
      errorMessage.style.display = 'block';
    }
    if (noPurchasesMessage) noPurchasesMessage.style.display = 'none';
    if (purchaseHistoryList) purchaseHistoryList.innerHTML = '';
  }

  async function renderizarHistorico(purchases) {
    if (!purchaseHistoryList) return;

    purchaseHistoryList.innerHTML = '';
    const ordenadas = purchases.slice().sort((a, b) => new Date(b.data_compra) - new Date(a.data_compra));

    for (const [index, purchase] of ordenadas.entries()) {
      const purchaseDate = new Date(purchase.data_compra).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const valorTotal = parseFloat(purchase.valor_total || 0).toFixed(2).replace('.', ',');
      const pontos = purchase.pontos_gerados || Math.floor(purchase.valor_total || 0);

      // Buscar os itens da compra
      let itens = [];
      try {
        const itemsResp = await fetch(`${API_BASE_URL}/compras/${purchase.id_compra}/itens`, {
          headers: {
            'x-user-id': userId,
            'x-user-type': tipo
          }
        });
        if (itemsResp.ok) {
          itens = await itemsResp.json();
        }
      } catch (err) {
        console.warn('Erro ao carregar itens da compra:', err);
      }

      // Classificar itens
      const ingressos = itens.filter(item => item.tipo_item === 'ingresso');
      const snacks = itens.filter(item => item.tipo_item === 'snack');

      const card = document.createElement('div');
      card.className = 'col-lg-10 mb-4';
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      
      card.innerHTML = `
        <div class="purchase-card shadow-lg">
          <div class="purchase-header mb-4">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h5 class="mb-2">
                  <i class="bi bi-receipt-cutoff text-danger me-2"></i>
                  Histórico de compra
                  <span class="badge bg-success ms-2">
                    <i class="bi bi-check-circle me-1"></i>Concluída
                  </span>
                </h5>
                <p class="text-white mb-0">
                  <i class="bi bi-calendar-event me-2"></i>${purchaseDate}
                </p>
              </div>
              <div class="col-md-4 text-md-end">
                <div class="purchase-total">
                  <h4 class="text-danger fw-bold mb-1">R$ ${valorTotal}</h4>
                  <p class="text-warning mb-0">
                    <i class="bi bi-star-fill me-1"></i>${pontos} pontos gerados
                  </p>
                </div>
              </div>
            </div>
          </div>

          ${ingressos.length > 0 ? `
            <div class="purchase-section mb-4">
              <h6 class="section-title">
                <i class="bi bi-film text-danger me-2"></i>
                Ingressos (${ingressos.length})
              </h6>
              <div class="items-grid">
                ${ingressos.map(item => `
                  <div class="item-card ingresso-item">
                    <div class="item-icon">
                      <i class="bi bi-ticket-perforated fs-4"></i>
                    </div>
                    <div class="item-details">
                      <h6 class="item-name">${item.nome_item}</h6>
                      <div class="item-meta">
                        <span class="quantity">Qtd: ${item.quantidade}</span>
                        <span class="price">R$ ${parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${snacks.length > 0 ? `
            <div class="purchase-section mb-4">
              <h6 class="section-title">
                <i class="bi bi-cup-straw text-warning me-2"></i>
                Snacks (${snacks.length})
              </h6>
              <div class="items-grid">
                ${snacks.map(item => `
                  <div class="item-card snack-item">
                    <div class="item-icon">
                      <i class="bi bi-cup-hot fs-4"></i>
                    </div>
                    <div class="item-details">
                      <h6 class="item-name">${item.nome_item}</h6>
                      <div class="item-meta">
                        <span class="quantity">Qtd: ${item.quantidade}</span>
                        <span class="price">R$ ${parseFloat(item.preco_unitario).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${itens.length === 0 ? `
            <div class="text-center py-4">
              <i class="bi bi-inbox text-white display-4 mb-3"></i>
              <p class="text-white">Nenhum item encontrado para esta compra</p>
            </div>
          ` : ''}

          <div class="purchase-footer">
            <div class="row align-items-center">
              <div class="col-md-6">
                <small class="text-white">
                  <i class="bi bi-info-circle me-1"></i>
                  Total de ${itens.length} item${itens.length !== 1 ? 's' : ''} adquirido${itens.length !== 1 ? 's' : ''}
                </small>
              </div>
              <div class="col-md-6 text-md-end">
                <div class="purchase-badges">
                  ${ingressos.length > 0 ? `<span class="badge bg-primary me-1">${ingressos.length} ingresso${ingressos.length > 1 ? 's' : ''}</span>` : ''}
                  ${snacks.length > 0 ? `<span class="badge bg-warning text-dark">${snacks.length} snack${snacks.length > 1 ? 's' : ''}</span>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      purchaseHistoryList.appendChild(card);

      // Animação de entrada
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 150);
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  async function carregarDadosHistorico() {
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isLoggedIn || !userId) {
      console.warn('Usuário não logado ou ID de usuário não encontrado.');
      // Animar contadores para 0
      animarContador(totalComprasElement, 0);
      animarContador(totalGastoElement, '0,00', true);
      animarContador(totalPontosElement, 0);
      animarContador(totalFilmesElement, 0);
      return;
    }

    try {
      // Buscar dados de Fidelidade
      const fidelidadeResponse = await fetch(`${API_BASE_URL}/usuarios/${userId}/fidelidade`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-type': localStorage.getItem('tipo') || 'comum'
        }
      });

      if (!fidelidadeResponse.ok) {
        const errorData = await fidelidadeResponse.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(`Erro ao carregar dados de fidelidade: ${fidelidadeResponse.status} - ${errorData.message}`);
      }

      const fidelidadeData = await fidelidadeResponse.json();

      // Buscar Histórico de Compras
      const comprasResponse = await fetch(`${API_BASE_URL}/usuarios/${userId}/compras`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-type': localStorage.getItem('tipo') || 'comum'
        }
      });

      if (!comprasResponse.ok) {
        const errorData = await comprasResponse.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(`Erro ao carregar histórico de compras: ${comprasResponse.status} - ${errorData.message}`);
      }

      const comprasData = await comprasResponse.json();

      // Animar contadores com os dados reais
      const totalCompras = comprasData.length;
      const totalGasto = formatCurrency(fidelidadeData.total_gasto || 0);
      const totalPontos = fidelidadeData.pontos || 0;
      const totalFilmesAssistidos = comprasData.reduce((sum, compra) => sum + (compra.ingressos || 0), 0);

      // Animações dos contadores
      setTimeout(() => animarContador(totalComprasElement, totalCompras), 200);
      setTimeout(() => animarContador(totalGastoElement, totalGasto, true), 400);
      setTimeout(() => animarContador(totalPontosElement, totalPontos), 600);
      setTimeout(() => animarContador(totalFilmesElement, totalFilmesAssistidos), 800);

    } catch (error) {
      console.error('Falha ao carregar dados do histórico:', error);
      // Mostrar erro nos contadores
      [totalComprasElement, totalGastoElement, totalPontosElement, totalFilmesElement].forEach(el => {
        if (el) el.textContent = '⚠️';
      });
    }
  }

  function animarContador(elemento, valorFinal, isMonetario = false) {
    if (!elemento) return;

    const valorInicial = 0;
    const duracao = 1500;
    const frameRate = 60;
    const totalFrames = duracao / (1000 / frameRate);
    
    let frameAtual = 0;

    function atualizarContador() {
      frameAtual++;
      const progresso = frameAtual / totalFrames;
      const valorAtual = Math.round(valorInicial + (parseFloat(valorFinal) - valorInicial) * easeOutCubic(progresso));

      if (isMonetario) {
        elemento.textContent = formatCurrency(valorAtual);
      } else {
        elemento.textContent = valorAtual;
      }

      if (frameAtual < totalFrames) {
        requestAnimationFrame(atualizarContador);
      } else {
        // Garantir valor final exato
        if (isMonetario) {
          elemento.textContent = typeof valorFinal === 'string' ? valorFinal : formatCurrency(valorFinal);
        } else {
          elemento.textContent = valorFinal;
        }
      }
    }

    atualizarContador();
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // CSS para animações e melhorias visuais
  const style = document.createElement('style');
  style.textContent = `
    .loading-cinema .loading-icon {
      animation: filmRoll 2s linear infinite;
    }
    
    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 5px;
      margin-top: 20px;
    }
    
    .loading-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e50914;
      animation: loadingDots 1.4s infinite ease-in-out both;
    }
    
    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    .loading-dots span:nth-child(3) { animation-delay: 0s; }
    
    @keyframes filmRoll {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes loadingDots {
      0%, 80%, 100% { 
        transform: scale(0);
        opacity: 0.5;
      } 
      40% { 
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .purchase-card {
      position: relative;
      overflow: hidden;
    }
    
    .purchase-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(229, 9, 20, 0.1), transparent);
      transition: left 0.6s ease;
    }
    
    .purchase-card:hover::after {
      left: 100%;
    }
    
    .purchase-header {
      border-bottom: 1px solid rgba(229, 9, 20, 0.2);
      padding-bottom: 15px;
    }
    
    .section-title {
      color: #ffffff;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 15px;
      padding: 10px 15px;
      background: rgba(229, 9, 20, 0.1);
      border-radius: 8px;
      border-left: 4px solid #e50914;
    }
    
    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 15px;
      margin: 15px 0;
    }
    
    .item-card {
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.8));
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 15px;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .item-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #e50914, transparent);
      transform: translateX(-100%);
      transition: transform 0.5s ease;
    }
    
    .item-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(229, 9, 20, 0.15);
      border-color: rgba(229, 9, 20, 0.3);
    }
    
    .item-card:hover::before {
      transform: translateX(0);
    }
    
    .item-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .ingresso-item .item-icon {
      background: linear-gradient(135deg, rgba(229, 9, 20, 0.2), rgba(229, 9, 20, 0.1));
      color: #e50914;
    }
    
    .snack-item .item-icon {
      background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 193, 7, 0.1));
      color: #ffc107;
    }
    
    .item-details {
      flex: 1;
    }
    
    .item-name {
      color: #ffffff;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 5px;
      line-height: 1.3;
    }
    
    .item-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
    }
    
    .quantity {
      color: #b3b3b3;
    }
    
    .price {
      color: #28a745;
      font-weight: 600;
    }
    
    .purchase-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 15px;
      margin-top: 20px;
    }
    
    .purchase-badges .badge {
      font-size: 0.75rem;
      padding: 4px 8px;
    }
    
    .purchase-total h4 {
      font-size: 1.5rem;
      margin-bottom: 5px;
    }
    
    .stats-card {
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .stats-card:hover {
      transform: translateY(-5px) scale(1.02);
    }
    
    .stats-card h3 {
      font-size: 2.2rem;
      font-weight: 700;
    }
    
    @media (max-width: 768px) {
      .items-grid {
        grid-template-columns: 1fr;
      }
      
      .item-card {
        padding: 12px;
        gap: 12px;
      }
      
      .item-icon {
        width: 40px;
        height: 40px;
      }
      
      .purchase-header .row > div {
        text-align: center;
        margin-bottom: 15px;
      }
      
      .purchase-total h4 {
        font-size: 1.3rem;
      }
    }
  `;
  document.head.appendChild(style);

  loadPurchaseHistory();
  carregarDadosHistorico();
});