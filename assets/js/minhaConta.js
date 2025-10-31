document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('tipo') || 'comum';
  const isAdmin = userType === 'admin';

  if (!userId) {
    window.location.href = 'login.html';
    return;
  }

  const authHeaders = {
    'x-user-id': userId,
    'x-user-type': userType
  };

  const realToStr = v => Number(v || 0).toFixed(2).replace('.', ',');

  const badgeColors = {
    bronze: 'secondary',
    prata: 'light text-dark',
    ouro: 'warning',
    diamante: 'primary'
  };

  const niveisFidelidade = {
    bronze: { min: 0, nextMin: 100 },
    prata: { min: 100, nextMin: 250 },
    ouro: { min: 250, nextMin: 500 },
    diamante: { min: 500, nextMin: 500 }
  };

  const beneficiosFixos = {
    bronze: ['Acesso ao programa de fidelidade', '1 ponto para cada R$1 gasto'],
    prata: ['10% de desconto em ingressos', '5% de desconto em snacks'],
    ouro: ['20% de desconto em ingressos', '10% de desconto em snacks'],
    diamante: ['25% de desconto em ingressos', '15% de desconto em snacks']
  };

  const calcularPercentual = (nivel, pontos) => {
    if (nivel === 'diamante') return 100;
    const { min, nextMin } = niveisFidelidade[nivel] || niveisFidelidade.bronze;
    if (pontos < min) return 0;
    return Math.min(100, Math.round(((pontos - min) / (nextMin - min)) * 100));
  };

  async function fetchJson(url, opt = {}) {
    const r = await fetch(url, {
      ...opt,
      headers: { ...authHeaders, ...opt.headers }
    });
    if (!r.ok) throw new Error(`Erro na requisição: ${url}`);
    return r.json();
  }

  const fetchUser = id => fetchJson(`${API_BASE_URL}/usuarios/${id}`);
  const fetchFidelidade = id => fetchJson(`${API_BASE_URL}/usuarios/${id}/fidelidade`);
  const fetchHistoricoCompras = id => fetchJson(`${API_BASE_URL}/usuarios/${id}/compras`);
  const fetchHistoricoPontos = id => fetchJson(`${API_BASE_URL}/usuarios/${id}/historico-pontos`);

  function preencherDadosBasicos({ nome, email }) {
    document.getElementById('userName').textContent = nome || 'N/A';
    document.getElementById('userEmail').textContent = email || 'N/A';
  }

  function preencherFidelidade({ nivel = 'bronze', pontos = 0, totalGasto = 0 }) {
    const nivelBadge = document.getElementById('nivelBadge');
    if (nivelBadge) {
      nivelBadge.textContent = nivel.toUpperCase();
      nivelBadge.className = `badge bg-${badgeColors[nivel] || 'secondary'}`;
    }

    const percentual = calcularPercentual(nivel, pontos);
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${percentual}%`;
      progressBar.setAttribute('aria-valuenow', percentual);
    }

    document.getElementById('progressText').textContent = `${pontos} pontos`;
    document.getElementById('totalGasto').textContent = `R$ ${realToStr(totalGasto)}`;

    const nextLevelEl = document.getElementById('nextLevel');
    if (nextLevelEl) {
      if (nivel === 'diamante') {
        nextLevelEl.textContent = 'Nível máximo alcançado!';
      } else {
        const nextLevel = nivel === 'bronze' ? 'Prata' : nivel === 'prata' ? 'Ouro' : 'Diamante';
        const pontosRestantes = niveisFidelidade[nivel].nextMin - pontos;
        nextLevelEl.textContent = `Faltam ${pontosRestantes} pontos para ${nextLevel}`;
      }
    }
  }

  function atualizarBeneficios(nivel) {
    const container = document.getElementById('beneficiosContainer');
    if (!container) return;

    container.innerHTML = '';

    // Benefícios do nível atual
    const currentBenefits = document.createElement('div');
    currentBenefits.className = 'mb-4';
    currentBenefits.innerHTML = `<h5 class="text-white">Seus Benefícios (${nivel.toUpperCase()})</h5>`;
    container.appendChild(currentBenefits);

    (beneficiosFixos[nivel] || []).forEach(texto => {
      const item = document.createElement('div');
      item.className = 'list-group-item bg-dark text-white border-secondary d-flex align-items-center';
      item.innerHTML = `
      <i class="bi bi-check-circle-fill text-success me-2"></i>
      <span>${texto}</span>
    `;
      container.appendChild(item);
    });

    // Próximos benefícios (se não for diamante)
    if (nivel !== 'diamante') {
      const nextLevel = nivel === 'bronze' ? 'prata' : nivel === 'prata' ? 'ouro' : 'diamante';

      const nextBenefits = document.createElement('div');
      nextBenefits.className = 'mt-4';
      nextBenefits.innerHTML = `<h5 class="text-white">Próximos Benefícios (${nextLevel.toUpperCase()})</h5>`;
      container.appendChild(nextBenefits);

      (beneficiosFixos[nextLevel] || []).forEach(texto => {
        const item = document.createElement('div');
        item.className = 'list-group-item bg-secondary text-dark border-light d-flex align-items-center';
        item.innerHTML = `
        <i class="bi bi-lock-fill text-muted me-2"></i>
        <span>${texto}</span>
      `;
        container.appendChild(item);
      });
    }
  }


  function atualizarHistoricoCompras(compras = []) {
    const tabela = document.getElementById('historicoTable');
    if (!tabela) return;

    const tbody = tabela.querySelector('tbody');
    tbody.innerHTML = '';

    const ordenadas = compras
      .slice()
      .sort((a, b) => new Date(b.data_compra) - new Date(a.data_compra))
      .slice(0, 5);

    ordenadas.forEach(c => {
      const row = document.createElement('tr');
      row.className = 'text-white';
      row.innerHTML = `
      <td>${new Date(c.data_compra).toLocaleDateString('pt-BR')}</td>
      <td>R$ ${realToStr(c.valor_total)}</td>
      <td>${Math.floor(c.valor_total || 0)} pts</td>
      <td><a href="historico.html?id=${c.id_compra}" class="btn btn-outline-light btn-sm">Ver Detalhes</a></td>
    `;
      tbody.appendChild(row);
    });

    const verMais = document.getElementById('verMaisHistorico');
    if (verMais && compras.length > 5) {
      verMais.style.display = 'block';
    }
  }

  async function carregarTudo() {
    try {
      const [usuario, fidelidade, historicoCompras] = await Promise.all([
        fetchUser(userId),
        fetchFidelidade(userId),
        fetchHistoricoCompras(userId)
      ]);

      preencherDadosBasicos(usuario);
      const totalGastoCalculado = historicoCompras.reduce((acc, c) => acc + (c.valor_total || 0), 0);
      const fidelidadeCorrigida = { ...fidelidade, totalGasto: totalGastoCalculado };
      preencherFidelidade(fidelidadeCorrigida);
      atualizarBeneficios(fidelidade.nivel);
      atualizarHistoricoCompras(historicoCompras);

      // Se houver tabela de fidelidade com pontos detalhados
      const pontosTable = document.querySelector('#tabelaHistorico tbody');
      if (pontosTable) {
        const historicoPontos = await fetchHistoricoPontos(userId);
        pontosTable.innerHTML = '';

        historicoPontos.forEach(p => {
          const linha = document.createElement('tr');
          linha.innerHTML = `
            <td>${p.data}</td>
            <td>${p.descricao}</td>
            <td>+${p.pontos}</td>
          `;
          pontosTable.appendChild(linha);
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados da conta:', err);
    }
  }

  // Evento de logout
  document.getElementById('logoutButton')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

  document.getElementById('logoutSidebar')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });


  carregarTudo();
});
