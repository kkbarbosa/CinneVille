document.addEventListener('DOMContentLoaded', function () {
    if (localStorage.getItem('userType') !== 'admin') {
        window.location.href = 'index.html';
    }

    // Elementos da interface
    const sidebarLinks = document.querySelectorAll('.nav-link');
    const dynamicContent = document.getElementById('dynamic-content');
    const dashboardContent = document.getElementById('dashboard-content');
    const pageTitle = document.getElementById('page-title');
    const logoutBtn = document.getElementById('logout-btn');

    // Configuração do modal
    const adminModal = new bootstrap.Modal(document.getElementById('adminModal'));
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalConfirm = document.getElementById('modalConfirm');
    const parceriaModal = new bootstrap.Modal(document.getElementById('parceriaModal'));
    const parceriaModalTitle = document.getElementById('parceriaModalLabel');
    const parceriaModalBody = document.getElementById('parceriaModalBody');
    const parceriaModalSubmitBtn = document.getElementById('parceriaModalSubmitBtn');

    const API_BASE_URL = 'http://localhost:5000/api';

    const mostrarAlerta = (type, message) => {
        const alertArea = document.getElementById('alertArea'); // Certifique-se de que este elemento existe no seu admin.html
        if (alertArea) {
            alertArea.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
            setTimeout(() => {
                const alertElement = alertArea.querySelector('.alert');
                if (alertElement) {
                    bootstrap.Alert.getInstance(alertElement)?.close();
                }
            }, 5000); // Alerta desaparece após 5 segundos
        } else {
            console.warn('Elemento #alertArea não encontrado para exibir alertas. Adicione <div id="alertArea"></div> no seu admin.html');
        }
    };

    // Event Listeners
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            loadSection(this.id.replace('-link', ''));
        });
    });

    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        window.location.href = 'index.html';
    });

    // Carrega a seção inicial
    loadSection('dashboard');

    // Funções principais
    function loadSection(section) {
        dashboardContent.style.display = 'none';
        dynamicContent.innerHTML = '';
        pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ');

        switch (section) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'filmes':
                loadFilmes();
                break;
            case 'votacao':
                loadVotacao();
                break;
            case 'snacks':
                loadSnacks();
                break;
            case 'promocoes':
                loadPromocoes();
                break;
            case 'parcerias':
                loadParcerias();
                break;
            case 'sessoes':
                loadSessoes();
                break;
            case 'contatos':
                loadContatos();
                break;
            case 'alugueis':
                loadAlugueis();
                break;
            case 'feedback':
                loadFeedbacks();
                break;
            case 'compras':
                loadCompras();
                break;
        }
    }

    // ==============================================
    // DASHBOARD
    // ==============================================

    function loadDashboard() {
        pageTitle.textContent = 'Dashboard';

        // HTML da dashboard melhorada
        dynamicContent.innerHTML = `
        <div class="container-fluid px-4">
            <!-- Header com botão de relatório -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="text-muted">Visão geral do sistema</h3>
                </div>
                <div>
                    <button type="button" class="btn btn-outline-primary" id="btn-download-relatorio">
                        <i class="bi bi-download me-2"></i>Baixar Relatório
                    </button>
                </div>
            </div>

            <!-- Cards de Métricas Principais -->
            <div class="row g-3 mb-4">
                <!-- Total de Vendas -->
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-primary text-white h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Total de Vendas</div>
                                    <div class="h4 mb-0" id="metric-total-vendas">R$ 0,00</div>
                                </div>
                                <div>
                                    <i class="bi bi-currency-dollar" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total de Usuários -->
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-success text-white h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Total de Usuários</div>
                                    <div class="h4 mb-0" id="metric-total-usuarios">0</div>
                                </div>
                                <div>
                                    <i class="bi bi-people" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filmes em Votação -->
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-info text-white h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Filmes em Votação</div>
                                    <div class="h4 mb-0" id="metric-filmes-votacao">0</div>
                                </div>
                                <div>
                                    <i class="bi bi-film" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total de Filmes -->
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-warning text-white h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Filmes Cadastrados</div>
                                    <div class="h4 mb-0" id="metric-total-filmes">0</div>
                                </div>
                                <div>
                                    <i class="bi bi-ticket-perforated" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Segunda linha de Cards -->
            <div class="row g-3 mb-4">
                <!-- Aluguéis Pendentes -->
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-secondary text-white h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Aluguéis Pendentes</div>
                                    <div class="h4 mb-0" id="metric-alugueis-pendentes">0</div>
                                </div>
                                <div>
                                    <i class="bi bi-clock-history" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contatos Pendentes -->
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-danger text-white h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Contatos Pendentes</div>
                                    <div class="h4 mb-0" id="metric-contatos-pendentes">0</div>
                                </div>
                                <div>
                                    <i class="bi bi-chat-dots" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Snacks Vendidos -->
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-dark text-white h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Snacks Vendidos</div>
                                    <div class="h4 mb-0" id="metric-snacks-vendidos">0</div>
                                </div>
                                <div>
                                    <i class="bi bi-cup-straw" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ticket Médio -->
                <div class="col-xl-3 col-md-6">
                    <div class="card bg-gradient text-white h-100" style="background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Ticket Médio</div>
                                    <div class="h4 mb-0" id="metric-ticket-medio">R$ 0,00</div>
                                </div>
                                <div>
                                    <i class="bi bi-receipt" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Terceira linha de Cards -->
            <div class="row g-3 mb-4">
                <!-- Filme Mais Popular -->
                <div class="col-xl-6 col-md-6">
                    <div class="card bg-gradient text-white h-100" style="background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="text-white-75 small">Filme Mais Popular</div>
                                    <div class="h4 mb-0"  id="metric-filme-popular">-</div>
                                </div>
                                <div>
                                    <i class="bi bi-star-fill" style="font-size: 2rem; opacity: 0.3;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Snack Mais Vendido -->
                <div class="col-xl-6 col-md-6">
                    <div class="card bg-gradient text-white h-100" style="background: linear-gradient(45deg, #ffecd2 0%, #fcb69f 100%); color: #333 !important;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="small" style="color: #666;">Snack Mais Vendido</div>
                                    <div class="h6 mb-0" id="metric-snack-popular" style="color: #333;">-</div>
                                    <small style="color: #666;" id="metric-snack-popular-qtd">0 vendidos</small>
                                </div>
                                <div>
                                    <i class="bi bi-award" style="font-size: 2rem; opacity: 0.3; color: #666;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Taxa de Ocupação Média -->
                <!-- <div class="col-xl-4 col-md-6">
                    <div class="card bg-gradient text-white h-100" style="background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%); color: #333 !important;">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div class="small" style="color: #666;">Taxa de Ocupação Média</div>
                                    <div class="h4 mb-0" id="metric-taxa-ocupacao" style="color: #333;">0%</div>
                                </div>
                                <div>
                                    <i class="bi bi-speedometer2" style="font-size: 2rem; opacity: 0.3; color: #666;"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> -->
            </div>

            <!-- Gráficos - Primeira linha -->
            <div class="row g-3 mb-4">
                <!-- Gráfico de Vendas -->
                <div class="col-lg-6">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-bar-chart me-2"></i>Vendas por Mês
                            </h5>
                        </div>
                        <div class="card-body">
                            <div style="position: relative; height: 300px;">
                                <canvas id="dashboard-chart-vendas"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráfico de Usuários -->
                <div class="col-lg-6">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-bar-chart-fill me-2"></i>Novos Usuários por Mês
                            </h5>
                        </div>
                        <div class="card-body">
                            <div style="position: relative; height: 300px;">
                                <canvas id="dashboard-chart-usuarios"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráficos - Segunda linha -->
            <div class="row g-3 mb-4">
                <!-- Gráfico Top Filmes -->
                <!-- <div class="col-lg-6">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-pie-chart me-2"></i>Top 5 Filmes mais populares
                            </h5>
                        </div>
                        <div class="card-body">
                            <div style="position: relative; height: 300px;">
                                <canvas id="dashboard-chart-filmes"></canvas>
                            </div>
                        </div>
                    </div>
                </div> -->

                <!-- Gráfico Aluguéis por Status -->
                <div class="col-lg-6">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-doughnut me-2"></i>Aluguéis por Status
                            </h5>
                        </div>
                        <div class="card-body">
                            <div style="position: relative; height: 300px;">
                                <canvas id="dashboard-chart-alugueis"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gráfico Top Snacks -->
                <div class="col-lg-6">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-bar-chart-fill me-2"></i>Top 5 Snacks Vendidos
                            </h5>
                        </div>
                        <div class="card-body">
                            <div style="position: relative; height: 300px;">
                                <canvas id="dashboard-chart-snacks"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráficos - Terceira linha -->
            <div class="row g-3">

                <!-- Gráfico Evolução de Vendas -->
                <div class="col-lg-6">
                    <div class="card h-100">
                        <div class="card-header bg-light">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-graph-up me-2"></i>Evolução Mensal - Comparativo
                            </h5>
                        </div>
                        <div class="card-body">
                            <div style="position: relative; height: 300px;">
                                <canvas id="dashboard-chart-evolucao"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Status de Loading -->
            <div id="dashboard-loading" class="text-center mt-4" style="display: none;">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-2">Carregando dados da dashboard...</p>
            </div>
        </div>
        `;

        // Mostra loading
        showDashboardLoading(true);

        // Carrega os dados
        loadDashboardData();

        // Adiciona evento do botão de relatório
        setupDownloadButton();
    }

    function showDashboardLoading(show) {
        const loadingElement = document.getElementById('dashboard-loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    function loadDashboardData() {
        fetch('/api/admin/dashboard', {
            headers: getAuthHeaders()
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('✅ Dados recebidos da dashboard:', data);

                // Atualiza as métricas principais
                updateDashboardMetric('metric-total-vendas', data.totalVendas, 'currency');
                updateDashboardMetric('metric-total-usuarios', data.totalUsuarios, 'number');
                updateDashboardMetric('metric-filmes-votacao', data.filmesVotacao, 'number');
                updateDashboardMetric('metric-total-filmes', data.totalFilmes, 'number');
                updateDashboardMetric('metric-alugueis-pendentes', data.alugueisPendentes, 'number');
                updateDashboardMetric('metric-contatos-pendentes', data.contatosPendentes, 'number');
                updateDashboardMetric('metric-snacks-vendidos', data.snacksVendidos, 'number');

                // Atualiza as novas métricas
                updateDashboardMetric('metric-ticket-medio', data.ticketMedio, 'currency');
                updateDashboardMetric('metric-taxa-ocupacao', data.taxaOcupacao, 'percentage');

                // Atualiza filme mais popular
                const filmePopularElement = document.getElementById('metric-filme-popular');
                // const filmeVotosElement = document.getElementById('metric-filme-popular-votos');
                // <small class="text-white-75" id="metric-filme-popular-votos">0 votos</small>
                if (data.filmeMaisPopular) {
                    filmePopularElement.textContent = data.filmeMaisPopular.titulo || '-';
                    // filmeVotosElement.textContent = `${data.filmeMaisPopular.votos || 0} votos`;
                } else {
                    filmePopularElement.textContent = '-';
                    // filmeVotosElement.textContent = '0 votos';
                }

                // Atualiza snack mais vendido
                const snackPopularElement = document.getElementById('metric-snack-popular');
                const snackQtdElement = document.getElementById('metric-snack-popular-qtd');
                if (data.snackMaisVendido) {
                    snackPopularElement.textContent = data.snackMaisVendido.nome || '-';
                    snackQtdElement.textContent = `${data.snackMaisVendido.quantidade || 0} vendidos`;
                } else {
                    snackPopularElement.textContent = '-';
                    snackQtdElement.textContent = '0 vendidos';
                }

                // Cria os gráficos principais
                createDashboardChart('dashboard-chart-vendas', 'bar', data.vendasPorMes, 'Vendas (R$)', 'total_vendas', '#0d6efd');
                createDashboardChart('dashboard-chart-usuarios', 'line', data.usuariosPorMes, 'Novos Usuários', 'total_usuarios', '#198754');

                // Cria os novos gráficos
                createPieChart('dashboard-chart-filmes', data.topFilmes, 'total_vendas');
                createBarChart('dashboard-chart-snacks', data.topSnacks, 'Quantidade');
                createDoughnutChart('dashboard-chart-alugueis', data.aluguelPorStatus);
                createMixedChart('dashboard-chart-evolucao', data.vendasPorMes, data.usuariosPorMes);

                // Esconde loading
                showDashboardLoading(false);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar dashboard:', error);
                showDashboardError(error.message);
                showDashboardLoading(false);
            });
    }

    function updateDashboardMetric(elementId, value, type) {
        const element = document.getElementById(elementId);

        if (!element) {
            console.warn(`⚠️ Elemento ${elementId} não encontrado`);
            return;
        }

        let formattedValue;
        const numValue = Number(value || 0);

        if (type === 'currency') {
            formattedValue = `R$ ${numValue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        } else if (type === 'percentage') {
            formattedValue = `${numValue.toFixed(1)}%`;
        } else {
            formattedValue = numValue.toLocaleString('pt-BR');
        }

        element.textContent = formattedValue;
        console.log(`✅ Atualizado ${elementId}: ${formattedValue}`);
    }

    function createDashboardChart(canvasId, type, data, label, dataKey, color) {
        const canvas = document.getElementById(canvasId);

        if (!canvas) {
            console.warn(`⚠️ Canvas ${canvasId} não encontrado`);
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destroi gráfico anterior se existir
        if (window[`chart_${canvasId}`]) {
            window[`chart_${canvasId}`].destroy();
        }

        // Verifica se há dados
        if (!data || data.length === 0) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#6c757d';
            ctx.fillText('Nenhum dado disponível', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Configura os dados do gráfico
        const chartData = {
            labels: data.map(item => item.mes_ano),
            datasets: [{
                label: label,
                data: data.map(item => Number(item[dataKey] || 0)),
                backgroundColor: type === 'line' ? color + '20' : color,
                borderColor: color,
                borderWidth: 2,
                fill: type === 'line',
                tension: type === 'line' ? 0.3 : undefined
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            if (dataKey === 'total_vendas') {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                            return value;
                        }
                    }
                }
            }
        };

        // Cria o gráfico
        window[`chart_${canvasId}`] = new Chart(ctx, {
            type: type,
            data: chartData,
            options: chartOptions
        });

        console.log(`✅ Gráfico ${canvasId} criado com ${data.length} pontos de dados`);
    }

    function createPieChart(canvasId, data, valueKey) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (window[`chart_${canvasId}`]) {
            window[`chart_${canvasId}`].destroy();
        }

        if (!data || data.length === 0) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#6c757d';
            ctx.fillText('Nenhum dado disponível', canvas.width / 2, canvas.height / 2);
            return;
        }

        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

        window[`chart_${canvasId}`] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(item => item.titulo),
                datasets: [{
                    data: data.map(item => Number(item.total_vendas || 0)),
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                    label: 'Vendas'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} vendas (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }


    function createBarChart(canvasId, data, valueKey) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (window[`chart_${canvasId}`]) {
            window[`chart_${canvasId}`].destroy();
        }

        if (!data || data.length === 0) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#6c757d';
            ctx.fillText('Nenhum dado disponível', canvas.width / 2, canvas.height / 2);
            return;
        }

        window[`chart_${canvasId}`] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.nome),
                datasets: [{
                    label: 'Quantidade Vendida',
                    data: data.map(item => Number(item[valueKey] || item.quantidade || 0)),
                    backgroundColor: '#FF9F43',
                    borderColor: '#FF7F00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createDoughnutChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (window[`chart_${canvasId}`]) {
            window[`chart_${canvasId}`].destroy();
        }

        if (!data || data.length === 0) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#6c757d';
            ctx.fillText('Nenhum dado disponível', canvas.width / 2, canvas.height / 2);
            return;
        }

        const colors = {
            'pendente': '#FFC107',
            'confirmado': '#28A745',
            'cancelado': '#DC3545',
            'concluido': '#6C757D'
        };

        window[`chart_${canvasId}`] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
                datasets: [{
                    data: data.map(item => Number(item.quantidade || 0)),
                    backgroundColor: data.map(item => colors[item.status] || '#6C757D'),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    function createMixedChart(canvasId, vendasData, usuariosData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (window[`chart_${canvasId}`]) {
            window[`chart_${canvasId}`].destroy();
        }

        if ((!vendasData || vendasData.length === 0) && (!usuariosData || usuariosData.length === 0)) {
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#6c757d';
            ctx.fillText('Nenhum dado disponível', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Combina os labels de ambos os datasets
        const allLabels = [...new Set([
            ...(vendasData || []).map(item => item.mes_ano),
            ...(usuariosData || []).map(item => item.mes_ano)
        ])].sort();

        window[`chart_${canvasId}`] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: allLabels,
                datasets: [
                    {
                        label: 'Vendas (R$)',
                        data: allLabels.map(label => {
                            const item = vendasData?.find(v => v.mes_ano === label);
                            return item ? Number(item.total_vendas || 0) : 0;
                        }),
                        borderColor: '#0d6efd',
                        backgroundColor: '#0d6efd20',
                        yAxisID: 'y',
                        tension: 0.3
                    },
                    {
                        label: 'Novos Usuários',
                        data: allLabels.map(label => {
                            const item = usuariosData?.find(u => u.mes_ano === label);
                            return item ? Number(item.total_usuarios || 0) : 0;
                        }),
                        borderColor: '#198754',
                        backgroundColor: '#19875420',
                        yAxisID: 'y1',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    function setupDownloadButton() {
        const btnDownload = document.getElementById('btn-download-relatorio');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                if (checkJsPDFLibrary()) {
                    downloadDashboardReport();
                }
            });
        }
    }

    // Função para baixar relatório melhorado
    function downloadDashboardReport() {
        const btnDownload = document.getElementById('btn-download-relatorio');

        // Mostra loading no botão
        const originalText = btnDownload.innerHTML;
        btnDownload.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Gerando...';
        btnDownload.disabled = true;

        try {
            // Cria nova instância do jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Configurações
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = margin;

            // === CABEÇALHO PROFISSIONAL ===
            // Cabeçalho com gradiente corporativo
            doc.setFillColor(52, 58, 64); // Cinza escuro profissional
            doc.rect(0, 0, pageWidth, 40, 'F');

            // Título principal
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text('RELATÓRIO EXECUTIVO AVANÇADO', pageWidth / 2, 18, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('Sistema de Gerenciamento de Cinema de Bairro', pageWidth / 2, 28, { align: 'center' });

            // Data e hora de geração
            const now = new Date();
            const dataFormatada = now.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const horaFormatada = now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            doc.setFontSize(9);
            doc.setTextColor(220, 220, 220);
            doc.text(`Emitido em ${dataFormatada} às ${horaFormatada}`, pageWidth - margin, 34, { align: 'right' });

            yPosition = 55;

            // === RESUMO EXECUTIVO ===
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RESUMO EXECUTIVO', margin, yPosition);
            yPosition += 12;

            // Linha separadora elegante
            doc.setDrawColor(52, 58, 64);
            doc.setLineWidth(1);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;

            // Coleta os dados das métricas principais
            const metricas = [
                {
                    categoria: 'Desempenho Financeiro',
                    items: [
                        {
                            label: 'Receita Total',
                            value: document.getElementById('metric-total-vendas')?.textContent || 'R$ 0,00'
                        },
                        {
                            label: 'Ticket Médio',
                            value: document.getElementById('metric-ticket-medio')?.textContent || 'R$ 0,00'
                        }
                    ]
                },
                {
                    categoria: 'Base de Usuários',
                    items: [
                        {
                            label: 'Usuários Cadastrados',
                            value: document.getElementById('metric-total-usuarios')?.textContent || '0'
                        },
                        // {
                        //     label: 'Taxa de Ocupação Média',
                        //     value: document.getElementById('metric-taxa-ocupacao')?.textContent || '0%'
                        // }
                    ]
                },
                {
                    categoria: 'Catálogo e Engajamento',
                    items: [
                        {
                            label: 'Filmes Cadastrados',
                            value: document.getElementById('metric-total-filmes')?.textContent || '0'
                        },
                        {
                            label: 'Filmes em Votação',
                            value: document.getElementById('metric-filmes-votacao')?.textContent || '0'
                        },
                        {
                            label: 'Filme Mais Popular',
                            value: document.getElementById('metric-filme-popular')?.textContent || '-'
                        }
                    ]
                },
                {
                    categoria: 'Operações e Vendas',
                    items: [
                        {
                            label: 'Aluguéis Pendentes',
                            value: document.getElementById('metric-alugueis-pendentes')?.textContent || '0'
                        },
                        {
                            label: 'Contatos Pendentes',
                            value: document.getElementById('metric-contatos-pendentes')?.textContent || '0'
                        },
                        {
                            label: 'Snacks Comercializados',
                            value: document.getElementById('metric-snacks-vendidos')?.textContent || '0'
                        },
                        {
                            label: 'Snack Mais Vendido',
                            value: document.getElementById('metric-snack-popular')?.textContent || '-'
                        }
                    ]
                }
            ];

            // Renderiza métricas por categoria
            doc.setFontSize(11);

            metricas.forEach((categoria, index) => {
                // Verifica se precisa de nova página
                if (yPosition > pageHeight - 80) {
                    doc.addPage();
                    yPosition = margin;
                }

                // Título da categoria
                doc.setFont('helvetica', 'bold');
                doc.setFillColor(248, 249, 250);
                doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 12, 'F');
                doc.setDrawColor(206, 212, 218);
                doc.rect(margin, yPosition - 3, pageWidth - 2 * margin, 12);

                doc.setTextColor(73, 80, 87);
                doc.text(categoria.categoria.toUpperCase(), margin + 5, yPosition + 5);
                yPosition += 18;

                // Items da categoria
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);

                categoria.items.forEach(item => {
                    doc.text(`${item.label}:`, margin + 10, yPosition);
                    doc.setFont('helvetica', 'bold');
                    doc.text(item.value, margin + 80, yPosition);
                    doc.setFont('helvetica', 'normal');
                    yPosition += 8;
                });

                yPosition += 8; // Espaço entre categorias
            });

            // === ANÁLISE ESTRATÉGICA AVANÇADA ===
            if (yPosition > pageHeight - 100) {
                doc.addPage();
                yPosition = margin;
            }

            yPosition += 10;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('ANÁLISE ESTRATÉGICA AVANÇADA', margin, yPosition);
            yPosition += 12;

            // Linha separadora
            doc.setDrawColor(52, 58, 64);
            doc.setLineWidth(1);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;

            // Análise baseada nos novos dados
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const totalVendas = parseFloat(document.getElementById('metric-total-vendas')?.textContent.replace(/[R$\s\.]/g, '').replace(',', '.') || '0');
            const totalUsuarios = parseInt(document.getElementById('metric-total-usuarios')?.textContent || '0');
            const ticketMedio = parseFloat(document.getElementById('metric-ticket-medio')?.textContent.replace(/[R$\s\.]/g, '').replace(',', '.') || '0');
            const taxaOcupacao = parseFloat(document.getElementById('metric-taxa-ocupacao')?.textContent.replace('%', '') || '0');
            const filmesVotacao = parseInt(document.getElementById('metric-filmes-votacao')?.textContent || '0');
            const filmesCadastrados = parseInt(document.getElementById('metric-total-filmes')?.textContent || '0');
            const aluguelPendente = parseInt(document.getElementById('metric-alugueis-pendentes')?.textContent || '0');
            const contatosPendentes = parseInt(document.getElementById('metric-contatos-pendentes')?.textContent || '0');
            const snacksVendidos = parseInt(document.getElementById('metric-snacks-vendidos')?.textContent || '0');

            const indicadores = [
                {
                    titulo: 'PERFORMANCE FINANCEIRA E COMERCIAL',
                    conteudo: [
                        `Receita total de ${metricas[0].items[0].value} com ticket médio de ${metricas[0].items[1].value}.`,
                        `${ticketMedio > 50 ? 'Excelente valor por transação' : ticketMedio > 25 ? 'Ticket médio satisfatório' : 'Oportunidade de aumentar ticket médio'}.`,
                        `${totalVendas > 0 ? 'Sistema apresentando atividade comercial consolidada' : 'Necessário implementar estratégias de vendas urgentes'}.`
                    ]
                },
                // {
                //     titulo: 'ENGAJAMENTO E SATISFAÇÃO DO CLIENTE',
                //     conteudo: [
                //         `Base de ${totalUsuarios} usuários com taxa de ocupação média de ${taxaOcupacao.toFixed(1)}%.`,
                //         `${taxaOcupacao > 70 ? 'Excelente aproveitamento da capacidade' : taxaOcupacao > 50 ? 'Boa utilização das salas' : 'Potencial de melhoria na ocupação'}.`,
                //         `Engajamento evidenciado por ${filmesVotacao} filmes em votação, demonstrando ${filmesVotacao > 5 ? 'alta' : filmesVotacao > 2 ? 'média' : 'baixa'} participação.`
                //     ]
                // },
                {
                    titulo: 'GESTÃO DE CATÁLOGO E PRODUTOS',
                    conteudo: [
                        `Catálogo diversificado com ${filmesCadastrados} títulos disponíveis.`,
                        `Filme mais popular: ${document.getElementById('metric-filme-popular')?.textContent || 'Não identificado'}.`,
                        `Vendas de snacks: ${snacksVendidos} unidades, produto líder: ${document.getElementById('metric-snack-popular')?.textContent || 'Não identificado'}.`,
                        `${snacksVendidos > 100 ? 'Forte performance em vendas complementares' : 'Oportunidade de aumentar vendas de produtos adicionais'}.`
                    ]
                },
                {
                    titulo: 'EFICIÊNCIA OPERACIONAL',
                    conteudo: [
                        `Gestão de pendências: ${aluguelPendente} aluguéis e ${contatosPendentes} contatos aguardando processamento.`,
                        `${(aluguelPendente + contatosPendentes) > 20 ? 'Requer atenção imediata na gestão de pendências' : (aluguelPendente + contatosPendentes) > 10 ? 'Acompanhamento regular necessário' : 'Operação eficiente'}.`,
                        `Indicadores sugerem ${(aluguelPendente + contatosPendentes) < 5 ? 'excelente' : (aluguelPendente + contatosPendentes) < 15 ? 'boa' : 'melhorável'} gestão operacional.`
                    ]
                }
            ];

            indicadores.forEach(indicador => {
                if (yPosition > pageHeight - 60) {
                    doc.addPage();
                    yPosition = margin;
                }

                // Título do indicador
                doc.setFont('helvetica', 'bold');
                doc.setFillColor(248, 249, 250);
                doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
                doc.text(indicador.titulo, margin + 3, yPosition + 3);
                yPosition += 12;

                // Conteúdo
                doc.setFont('helvetica', 'normal');
                indicador.conteudo.forEach(linha => {
                    const linhas = doc.splitTextToSize(linha, pageWidth - 2 * margin - 10);
                    linhas.forEach(sublinha => {
                        if (yPosition > pageHeight - 30) {
                            doc.addPage();
                            yPosition = margin;
                        }
                        doc.text(sublinha, margin + 5, yPosition);
                        yPosition += 5;
                    });
                });
                yPosition += 8;
            });

            // === RECOMENDAÇÕES ESTRATÉGICAS ===
            if (yPosition > pageHeight - 100) {
                doc.addPage();
                yPosition = margin;
            }

            yPosition += 10;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RECOMENDAÇÕES ESTRATÉGICAS', margin, yPosition);
            yPosition += 12;

            doc.setDrawColor(52, 58, 64);
            doc.setLineWidth(1);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;

            const recomendacoes = [
                {
                    categoria: 'CRESCIMENTO DE RECEITA',
                    items: [
                        'Implementar programas de fidelidade para aumentar frequência de visitas',
                        'Desenvolver pacotes promocionais combinando filmes e snacks',
                        'Criar campanhas sazonais baseadas nos filmes mais populares'
                    ]
                },
                {
                    categoria: 'OTIMIZAÇÃO OPERACIONAL',
                    items: [
                        'Automatizar processos de confirmação de aluguéis para reduzir pendências',
                        'Implementar sistema de notificações para contatos não respondidos',
                        'Otimizar horários de sessões baseado na taxa de ocupação atual'
                    ]
                },
                {
                    categoria: 'EXPERIÊNCIA DO CLIENTE',
                    items: [
                        'Expandir sistema de votação para incluir horários preferidos',
                        'Desenvolver app mobile para facilitar reservas e pedidos',
                        'Criar programa de recomendações personalizadas'
                    ]
                },
                {
                    categoria: 'ANÁLISE E MONITORAMENTO',
                    items: [
                        'Implementar dashboard em tempo real para acompanhamento diário',
                        'Estabelecer KPIs específicos por categoria de produto',
                        'Criar relatórios automáticos semanais para tomada de decisão ágil'
                    ]
                }
            ];

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            recomendacoes.forEach(secao => {
                if (yPosition > pageHeight - 80) {
                    doc.addPage();
                    yPosition = margin;
                }

                // Título da seção
                doc.setFont('helvetica', 'bold');
                doc.setFillColor(240, 248, 255);
                doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
                doc.text(secao.categoria, margin + 3, yPosition + 3);
                yPosition += 12;

                // Items da seção
                doc.setFont('helvetica', 'normal');
                secao.items.forEach((item, index) => {
                    if (yPosition > pageHeight - 30) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    const linhas = doc.splitTextToSize(`${index + 1}. ${item}`, pageWidth - 2 * margin - 10);
                    linhas.forEach(linha => {
                        doc.text(linha, margin + 5, yPosition);
                        yPosition += 5;
                    });
                    yPosition += 2;
                });
                yPosition += 8;
            });

            // === CONCLUSÃO ===
            if (yPosition > pageHeight - 80) {
                doc.addPage();
                yPosition = margin;
            }

            yPosition += 10;
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('CONCLUSÃO', margin, yPosition);
            yPosition += 12;

            doc.setDrawColor(52, 58, 64);
            doc.setLineWidth(1);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 15;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            const conclusao = [
                'O Sistema de Gerenciamento de Cinema de Bairro demonstra sólida base operacional com oportunidades claras de crescimento.',
                'Os indicadores financeiros e de engajamento evidenciam potencial para expansão e otimização de resultados.',
                'A implementação das recomendações estratégicas pode resultar em significativo aumento da receita e satisfação do cliente.',
                'Recomenda-se monitoramento contínuo dos KPIs estabelecidos para garantir sustentabilidade do crescimento.'
            ];

            conclusao.forEach(paragrafo => {
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = margin;
                }
                const linhas = doc.splitTextToSize(paragrafo, pageWidth - 2 * margin);
                linhas.forEach(linha => {
                    doc.text(linha, margin, yPosition);
                    yPosition += 5;
                });
                yPosition += 8;
            });

            // === RODAPÉ PROFISSIONAL ===
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);

                // Linha do rodapé
                doc.setDrawColor(206, 212, 218);
                doc.setLineWidth(0.5);
                doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

                // Informações do rodapé
                doc.setFontSize(8);
                doc.setTextColor(108, 117, 125);
                doc.setFont('helvetica', 'normal');
                doc.text('SGCB - Sistema de Gerenciamento de Cinema de Bairro', margin, pageHeight - 12);
                // doc.text('Relatório Confidencial - Uso Interno', pageWidth / 2, pageHeight - 12, { align: 'center' });
                doc.text(`${i}/${totalPages}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
            }

            // Salva o PDF
            const fileName = `relatorio-executivo-completo-${dataFormatada.replace(/\//g, '-')}.pdf`;
            doc.save(fileName);

            console.log('✅ Relatório executivo completo gerado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao gerar relatório:', error);
            alert('Erro ao gerar relatório: ' + error.message);
        } finally {
            // Restaura o botão
            btnDownload.innerHTML = originalText;
            btnDownload.disabled = false;
        }
    }

    // Função auxiliar para verificar se jsPDF está carregado
    function checkJsPDFLibrary() {
        if (typeof window.jspdf === 'undefined') {
            console.error('❌ Biblioteca jsPDF não encontrada');
            alert('Biblioteca jsPDF não carregada. Adicione o script:\n<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
            return false;
        }
        return true;
    }

    function showDashboardError(message) {
        // Atualiza todas as métricas com valores padrão
        updateDashboardMetric('metric-total-vendas', 0, 'currency');
        updateDashboardMetric('metric-total-usuarios', 0, 'number');
        updateDashboardMetric('metric-filmes-votacao', 0, 'number');
        updateDashboardMetric('metric-total-filmes', 0, 'number');
        updateDashboardMetric('metric-alugueis-pendentes', 0, 'number');
        updateDashboardMetric('metric-contatos-pendentes', 0, 'number');
        updateDashboardMetric('metric-snacks-vendidos', 0, 'number');
        updateDashboardMetric('metric-ticket-medio', 0, 'currency');
        updateDashboardMetric('metric-taxa-ocupacao', 0, 'percentage');

        // Mostra alerta
        if (typeof handleError === 'function') {
            handleError('Erro ao carregar dashboard')(new Error(message));
        } else {
            alert(`Erro ao carregar dashboard: ${message}`);
        }
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    }

    // ==============================================
    // FILMES
    // ==============================================
    function loadFilmes() {
        dynamicContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <h3>Filmes Cadastrados</h3> <button class="btn btn-primary" id="add-filme-btn">
                <i class="bi bi-plus"></i> Adicionar Filme
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Poster</th>
                        <th>Título</th>
                        <th>Gênero</th>
                        <th>Duração</th>
                        <th>Lançamento</th>
                        <th>Classificação</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="filmes-table">
                    <tr>
                        <td colspan="7" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

        fetch('/api/admin/filmes', {
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(filmes => {
                const tableBody = document.getElementById('filmes-table');

                if (filmes.length === 0) {
                    tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        Nenhum filme cadastrado
                    </td>
                </tr>
                `;
                    return;
                }

                tableBody.innerHTML = filmes.map(filme => {
                    // *** ADICIONE ESTA LINHA PARA DEPURAR ***
                    console.log(`Filme: ${filme.titulo}, em_cartaz: ${filme.em_cartaz}, typeof em_cartaz: ${typeof filme.em_cartaz}`);

                    return `
                <tr data-id="${filme.id_filme}">
                    <td>
                        <img src="${filme.poster_url || '/assets/img/placeholder-poster.jpg'}" 
                             alt="${filme.titulo}" 
                             style="height: 60px; width: 40px; object-fit: cover;">
                    </td>
                    <td>${filme.titulo}</td>
                    <td>${filme.genero || '-'}</td>
                    <td>${filme.duracao ? `${filme.duracao} min` : '-'}</td>
                    <td>${filme.data_lancamento ? new Date(filme.data_lancamento).toLocaleDateString() : '-'}</td>
                    <td>${filme.classificacao_indicativa || '-'}</td>
                    <td>
                        <span class="badge 
                            ${filme.em_cartaz == 1 ? 'bg-success' : // Alterado de === para ==
                            filme.em_cartaz == 3 ? 'bg-info' :    // Alterado de === para ==
                                'bg-secondary'}">
                            ${filme.em_cartaz == 1 ? 'Em cartaz' :  // Alterado de === para ==
                            filme.em_cartaz == 3 ? 'Em Breve' :   // Alterado de === para ==
                                'Fora de cartaz'}
                        </span>
                        <span class="badge ${filme.em_votacao ? 'bg-primary' : 'bg-secondary'}">
                            ${filme.em_votacao ? 'Em votação' : 'Não em votação'}
                        </span>
                    </td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary edit-filme" data-id="${filme.id_filme}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-filme" data-id="${filme.id_filme}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                `;
                }).join('');

                // Adiciona eventos
                document.querySelectorAll('.edit-filme').forEach(btn => {
                    btn.addEventListener('click', () => editFilme(btn.dataset.id));
                });

                document.querySelectorAll('.delete-filme').forEach(btn => {
                    btn.addEventListener('click', () => confirmDeleteFilme(btn.dataset.id));
                });

                // ATENÇÃO: A lógica para .toggle-cartaz também precisa ser ajustada para lidar com os novos status (1, 3, 0)
                // Atualmente, ela só alterna entre 'true' e 'false'.
                document.querySelectorAll('.toggle-cartaz').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Aqui você precisará de uma lógica mais complexa para definir o novo status
                        // Por exemplo: se o status atual for 1, mudar para 0; se for 0, mudar para 1.
                        // E adicionar uma opção para mudar para 3 (Em Breve).
                        // Isso pode exigir a abertura de um modal para seleção ou botões separados.
                        toggleFilmeCartaz(link.dataset.id, link.dataset.status === 'true'); // Esta linha precisará de revisão
                    });
                });

                document.querySelectorAll('.toggle-votacao').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        toggleFilmeVotacao(link.dataset.id, link.dataset.status === 'true');
                    });
                });

                document.getElementById('add-filme-btn').addEventListener('click', () => showFilmeForm());
            })
            .catch(handleError('Erro ao carregar filmes'));
    }

    function showFilmeForm(filme = null) {
        modalTitle.textContent = filme ? 'Editar Filme' : 'Adicionar Filme';

        modalBody.innerHTML = `
        <form id="filme-form" enctype="multipart/form-data">
            <input type="hidden" id="filme-id" value="${filme ? filme.id_filme : ''}">
            
            <div class="mb-3">
                <label for="titulo" class="form-label">Título*</label>
                <input type="text" class="form-control" id="titulo" 
                       value="${filme ? filme.titulo : ''}" required>
            </div>
            
             <div class="col-md-4 mb-3">
                <label for="data-lancamento" class="form-label">Data de Lançamento*</label>
                <input type="date" class="form-control" id="data-lancamento" 
                       value="${filme ? formatDateForInput(filme.data_lancamento) : ''}" required>
            </div>

            <div class="mb-3">
                <label for="sinopse" class="form-label">Sinopse</label>
                <textarea class="form-control" id="sinopse" rows="3">${filme ? filme.sinopse : ''}</textarea>
            </div>
            
            <div class="mb-3">
                <label for="genero" class="form-label">Gênero</label>
                <input type="text" class="form-control" id="genero" 
                       value="${filme ? filme.genero : ''}">
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="duracao" class="form-label">Duração (minutos)*</label>
                    <input type="number" class="form-control" id="duracao" 
                           value="${filme ? filme.duracao : ''}" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label for="classificacao" class="form-label">Classificação*</label>
                    <select class="form-select" id="classificacao" required>
                        <option value="">Selecione...</option>
                        <option value="Livre" ${filme?.classificacao_indicativa === 'Livre' ? 'selected' : ''}>Livre</option>
                        <option value="10" ${filme?.classificacao_indicativa === '10' ? 'selected' : ''}>10 anos</option>
                        <option value="12" ${filme?.classificacao_indicativa === '12' ? 'selected' : ''}>12 anos</option>
                        <option value="14" ${filme?.classificacao_indicativa === '14' ? 'selected' : ''}>14 anos</option>
                        <option value="16" ${filme?.classificacao_indicativa === '16' ? 'selected' : ''}>16 anos</option>
                        <option value="18" ${filme?.classificacao_indicativa === '18' ? 'selected' : ''}>18 anos</option>
                    </select>
                </div>
            </div>
            
            <div class="mb-3">
                <label for="trailer-url" class="form-label">URL do Trailer (YouTube)*</label>
                <input type="url" class="form-control" id="trailer-url" 
                       value="${filme ? filme.trailer_url : ''}" required
                       placeholder="https://www.youtube.com/watch?v=...">
            </div>
            
            <div class="mb-3">
                <label for="poster-file" class="form-label">Poster do Filme*</label>
                <input type="file" class="form-control" id="poster-file" accept="image/*">
                ${filme ? `<small class="text-muted">Deixe em branco para manter o poster atual: ${filme.poster_url}</small>` : ''}
            </div>
            
            <div class="row">
                <div class="col-md-6 mb-3 form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="em-cartaz" 
                           ${filme?.em_cartaz ? 'checked' : ''}>
                    <label class="form-check-label" for="em-cartaz">Em cartaz</label>
                </div>
                <div class="col-md-6 mb-3 form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="em-votacao" 
                           ${filme?.em_votacao ? 'checked' : ''}>
                    <label class="form-check-label" for="em-votacao">Em votação</label>
                </div>
            </div>
            
            <div id="preview-container" class="mb-3 text-center">
                ${filme ? `<img src="${filme.poster_url}" class="img-thumbnail" style="max-height: 200px;">` : ''}
            </div>
        </form>
    `;

        // Preview da imagem selecionada
        document.getElementById('poster-file').addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    document.getElementById('preview-container').innerHTML = `
                    <img src="${event.target.result}" class="img-thumbnail" style="max-height: 200px;">
                `;
                };
                reader.readAsDataURL(file);
            }
        });

        modalConfirm.textContent = filme ? 'Atualizar' : 'Adicionar';
        modalConfirm.onclick = () => saveFilme(filme);
        adminModal.show();
    }

    function saveFilme(filme = null) {
        const isEdit = !!filme;
        const filmeId = isEdit ? filme.id_filme : null;

        // Validação básica
        const titulo = document.getElementById('titulo').value;
        const duracao = document.getElementById('duracao').value;
        const classificacao = document.getElementById('classificacao').value;
        const trailerUrl = document.getElementById('trailer-url').value;
        const dataLancamento = document.getElementById('data-lancamento').value;
        const posterFile = document.getElementById('poster-file').files[0];

        if (!titulo || !duracao || !classificacao || !dataLancamento || !trailerUrl) {
            showToast('warning', 'Preencha todos os campos obrigatórios');
            return;
        }

        // Criar FormData para enviar arquivos
        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('sinopse', document.getElementById('sinopse').value);
        formData.append('genero', document.getElementById('genero').value);
        formData.append('duracao', duracao);
        formData.append('classificacao_indicativa', classificacao);
        formData.append('data_lancamento', dataLancamento);
        formData.append('trailer_url', trailerUrl);
        formData.append('em_cartaz', document.getElementById('em-cartaz').checked ? '1' : '0');
        formData.append('em_votacao', document.getElementById('em-votacao').checked ? '1' : '0');

        // Apenas para edição - manter poster existente se não for enviado novo
        if (isEdit && !posterFile) {
            formData.append('manter_poster', '1');
        } else if (posterFile) {
            formData.append('poster', posterFile);
        } else if (!isEdit) {
            showToast('warning', 'Selecione um poster para o filme');
            return;
        }

        const url = isEdit ? `/api/admin/filmes/${filmeId}` : '/api/admin/filmes';
        const method = isEdit ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: formData
        })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro na requisição');
                }
                return response.json();
            })
            .then(data => {
                adminModal.hide();
                showToast('success', data.message || (isEdit ? 'Filme atualizado!' : 'Filme adicionado!'));
                loadFilmes();
            })
            .catch(error => {
                console.error('Erro completo:', error);
                showToast('danger', error.message || 'Erro ao salvar filme');
            });
    }

    function editFilme(id) {
        fetch(`/api/filmes/${id}`, {
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(filme => {
                showFilmeForm(filme);
            })
            .catch(handleError('Erro ao carregar filme'));
    }

    function confirmDeleteFilme(id) {
        modalTitle.textContent = 'Confirmar Exclusão';
        modalBody.innerHTML = `
            <p>Tem certeza que deseja excluir este filme?</p>
            <p class="text-danger">Esta ação não pode ser desfeita.</p>
        `;
        modalConfirm.textContent = 'Excluir';
        modalConfirm.className = 'btn btn-danger';
        modalConfirm.onclick = () => deleteFilme(id);
        adminModal.show();
    }

    function deleteFilme(id) {
        fetch(`/api/admin/filmes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(data => {
                adminModal.hide();
                showToast('success', data.message || 'Filme excluído com sucesso!');
                loadFilmes();
            })
            .catch(handleError('Erro ao excluir filme'));
    }

    function toggleFilmeCartaz(id, currentStatus) {
        fetch(`/api/admin/filmes/${id}/cartaz`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                em_cartaz: !currentStatus
            })
        })
            .then(handleResponse)
            .then(data => {
                showToast('success', data.message);
                loadFilmes();
            })
            .catch(handleError('Erro ao atualizar status do cartaz'));
    }

    function toggleFilmeVotacao(id, currentStatus) {
        fetch(`/api/admin/filmes/${id}/votacao`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                em_votacao: !currentStatus
            })
        })
            .then(handleResponse)
            .then(data => {
                showToast('success', data.message || 'Status de votação atualizado!');
                loadFilmes();
                if (document.querySelector('.nav-link.active').id === 'votacao-link') {
                    loadVotacao();
                }
            })
            .catch(handleError('Erro ao atualizar votação'));
    }

    function formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ==============================================
    // VOTAÇÃO
    // ==============================================

    let currentVotingId = null; // Variável para armazenar o ID da votação atual
    const filmesVotacaoTableBody = document.getElementById('filmes-votacao-table'); // Definido aqui para ser acessível globalmente nesta seção

    function loadVotacao() {
        dynamicContent.innerHTML = `
        <div class="mb-4">
            <h3>Gerenciar Votação</h3>
            <div class="card mt-3">
                <div class="card-header">
                    Tema da Votação Atual
                </div>
                <div class="card-body">
                    <div class="input-group mb-3">
                        <input type="text" class="form-control" id="voting-theme-input" placeholder="Digite o tema da votação" aria-label="Tema da Votação">
                        <button class="btn btn-primary" type="button" id="save-voting-theme-btn">
                            <i class="bi bi-save"></i> Salvar Tema
                        </button>
                    </div>
                    <small class="form-text text-muted">Ex: "Votação para o melhor filme de terror de 2024"</small>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-3">
            <h4>Filmes em Votação</h4>
            <div>
                <button class="btn btn-primary me-2" id="add-filmes-votacao-btn">
                    <i class="bi bi-plus"></i> Adicionar Filmes à Votação
                </button>
                <button class="btn btn-danger" id="reset-votos-btn">
                    <i class="bi bi-arrow-counterclockwise"></i> Resetar Votos
                </button>
            </div>
        </div>

        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Gênero</th>
                        <th>Votos</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="filmes-votacao-table">
                    <tr>
                        <td colspan="5" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal fade" id="addFilmesToVotingModal" tabindex="-1" aria-labelledby="addFilmesToVotingModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="addFilmesToVotingModalLabel">Adicionar Filmes à Votação</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div id="available-filmes-list" class="list-group">
                            <p class="text-center text-muted">Carregando filmes...</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="save-selected-filmes-btn">Adicionar Selecionados</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        loadVotingTheme(); // Carrega o tema da votação ao iniciar a seção

        // Adiciona event listeners (depois que o HTML é carregado)
        document.getElementById('save-voting-theme-btn').addEventListener('click', saveVotingTheme);
        document.getElementById('add-filmes-votacao-btn').addEventListener('click', showAddFilmesToVotingModal);
        document.getElementById('reset-votos-btn').addEventListener('click', confirmResetVotingVotos);

        // Inicializa o modal de adicionar filmes
        const addFilmesToVotingBootstrapModal = new bootstrap.Modal(document.getElementById('addFilmesToVotingModal'));
        document.getElementById('save-selected-filmes-btn').addEventListener('click', addSelectedFilmesToVoting);
    }

    // Função para carregar o tema da votação atual
    async function loadVotingTheme() {
        try {
            const response = await fetch('/api/admin/votacao/tema', { headers: getAuthHeaders() });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao carregar tema da votação');
            }
            const data = await response.json();
            const votingThemeInput = document.getElementById('voting-theme-input');

            if (data.id_votacao) { // Verifica se existe uma votação ativa
                currentVotingId = data.id_votacao; // Armazena o ID da votação atual
                if (data.tema_votacao) {
                    votingThemeInput.value = data.tema_votacao;
                } else {
                    votingThemeInput.value = ''; // Limpa se não houver tema
                }
                loadFilmesEmVotacao(); // Carrega os filmes APÓS ter o currentVotingId
            } else {
                votingThemeInput.value = 'Nenhuma votação ativa. Crie uma para definir o tema.';
                votingThemeInput.disabled = true; // Desabilita o campo se não houver votação
                document.getElementById('save-voting-theme-btn').disabled = true;
                document.getElementById('add-filmes-votacao-btn').disabled = true; // Desabilita adicionar filmes
                document.getElementById('reset-votos-btn').disabled = true; // Desabilita resetar votos
                showToast('info', 'Nenhuma votação ativa encontrada. Crie uma votação para gerenciar o tema e os filmes.');
                // Limpa a tabela de filmes se não houver votação ativa
                document.getElementById('filmes-votacao-table').innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted">Nenhuma votação ativa para exibir filmes.</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar tema da votação:', error);
            showToast('danger', error.message || 'Erro ao carregar tema da votação.');
        }
    }

    // Função para salvar o tema da votação
    async function saveVotingTheme() {
        const votingTheme = document.getElementById('voting-theme-input').value.trim();

        if (!votingTheme) {
            showToast('warning', 'O tema da votação não pode ser vazio.');
            return;
        }

        if (!currentVotingId) {
            showToast('danger', 'Nenhuma votação ativa encontrada para atualizar o tema.');
            return;
        }

        try {
            const response = await fetch(`/api/admin/votacao/tema/${currentVotingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ tema_votacao: votingTheme })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao salvar tema da votação');
            }

            const data = await response.json();
            showToast('success', data.message || 'Tema da votação atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar tema da votação:', error);
            showToast('danger', error.message || 'Erro ao salvar tema da votação.');
        }
    }

    // Função para carregar filmes atualmente em votação
    async function loadFilmesEmVotacao() {
        const filmesVotacaoTableBody = document.getElementById('filmes-votacao-table');
        filmesVotacaoTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </td>
            </tr>
        `;

        if (!currentVotingId) {
            filmesVotacaoTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">Nenhuma votação ativa para exibir filmes.</td>
                </tr>
            `;
            return;
        }

        try {
            const response = await fetch(`/api/admin/votacao/${currentVotingId}/filmes`, { headers: getAuthHeaders() });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao carregar filmes em votação');
            }
            const filmes = await response.json();

            if (filmes.length === 0) {
                filmesVotacaoTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted">Nenhum filme adicionado a esta votação ainda.</td>
                    </tr>
                `;
                return;
            }

            filmesVotacaoTableBody.innerHTML = filmes.map(filme => `
                <tr data-filme-id="${filme.id_filme}">
                    <td>${filme.titulo}</td>
                    <td>${filme.genero || '-'}</td>
                    <td>${filme.votos}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger remove-filme-votacao" data-filme-id="${filme.id_filme}">
                            <i class="bi bi-trash"></i> Remover
                        </button>
                    </td>
                </tr>
            `).join('');

            // Adiciona event listeners para os botões de remover
            document.querySelectorAll('.remove-filme-votacao').forEach(btn => {
                btn.addEventListener('click', () => removeFilmeFromVoting(btn.dataset.filmeId));
            });

        } catch (error) {
            console.error('Erro ao carregar filmes em votação:', error);
            filmesVotacaoTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">Erro ao carregar filmes: ${error.message}</td>
                </tr>
            `;
            showToast('danger', error.message || 'Erro ao carregar filmes em votação.');
        }
    }

    // Função para exibir o modal de adicionar filmes à votação
    async function showAddFilmesToVotingModal() {
        if (!currentVotingId) {
            showToast('warning', 'Nenhuma votação ativa. Crie uma votação primeiro para adicionar filmes.');
            return;
        }

        const availableFilmesList = document.getElementById('available-filmes-list');
        availableFilmesList.innerHTML = '<p class="text-center text-muted">Carregando filmes...</p>';
        const addFilmesToVotingBootstrapModal = new bootstrap.Modal(document.getElementById('addFilmesToVotingModal'));

        try {
            const response = await fetch(`/api/admin/filmes/available-for-voting/${currentVotingId}`, { headers: getAuthHeaders() });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao carregar filmes disponíveis');
            }
            const filmes = await response.json();

            if (filmes.length === 0) {
                availableFilmesList.innerHTML = '<p class="text-center text-muted">Todos os filmes já estão na votação ou não há filmes cadastrados.</p>';
            } else {
                availableFilmesList.innerHTML = filmes.map(filme => `
                    <label class="list-group-item">
                        <input class="form-check-input me-1" type="checkbox" value="${filme.id_filme}">
                        ${filme.titulo} (${filme.data_lancamento || 'N/A'}) - ${filme.genero || 'N/A'}
                    </label>
                `).join('');
            }
            addFilmesToVotingBootstrapModal.show();
        } catch (error) {
            console.error('Erro ao carregar filmes disponíveis:', error);
            availableFilmesList.innerHTML = `<p class="text-center text-danger">Erro: ${error.message}</p>`;
            showToast('danger', error.message || 'Erro ao carregar filmes disponíveis.');
        }
    }

    // Função para adicionar filmes selecionados à votação
    async function addSelectedFilmesToVoting() {
        const selectedFilmeIds = Array.from(document.querySelectorAll('#available-filmes-list input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        if (selectedFilmeIds.length === 0) {
            showToast('warning', 'Selecione pelo menos um filme para adicionar.');
            return;
        }

        if (!currentVotingId) {
            showToast('danger', 'Erro: ID da votação não encontrado.');
            return;
        }

        try {
            const response = await fetch(`/api/admin/votacao/${currentVotingId}/add-filmes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ filmes_ids: selectedFilmeIds })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao adicionar filmes à votação');
            }

            const data = await response.json();
            showToast('success', data.message || 'Filmes adicionados à votação com sucesso!');
            const addFilmesToVotingBootstrapModal = bootstrap.Modal.getInstance(document.getElementById('addFilmesToVotingModal'));
            addFilmesToVotingBootstrapModal.hide(); // Fecha o modal
            loadFilmesEmVotacao(); // Recarrega a lista de filmes em votação
        } catch (error) {
            console.error('Erro ao adicionar filmes selecionados:', error);
            showToast('danger', error.message || 'Erro ao adicionar filmes à votação.');
        }
    }

    // Função para remover um filme da votação
    async function removeFilmeFromVoting(filmeId) {
        if (!confirm('Tem certeza que deseja remover este filme da votação?')) {
            return;
        }

        if (!currentVotingId) {
            showToast('danger', 'Erro: ID da votação não encontrado.');
            return;
        }

        try {
            const response = await fetch(`/api/admin/votacao/${currentVotingId}/filmes/${filmeId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao remover filme da votação');
            }

            const data = await response.json();
            showToast('success', data.message || 'Filme removido da votação com sucesso!');
            loadFilmesEmVotacao(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao remover filme da votação:', error);
            showToast('danger', error.message || 'Erro ao remover filme da votação.');
        }
    }

    // Funções para resetar votos
    function confirmResetVotingVotos() {
        if (!currentVotingId) {
            showToast('warning', 'Nenhuma votação ativa para resetar os votos.');
            return;
        }
        modalTitle.textContent = 'Confirmar Reset de Votos';
        modalBody.innerHTML = `
            <p>Tem certeza que deseja **resetar todos os votos** dos filmes nesta votação?</p>
            <p class="text-danger fw-bold">Esta ação é irreversível!</p>
        `;
        modalConfirm.style.display = 'block';
        modalConfirm.onclick = resetVotingVotos;
        adminModal.show();
    }

    async function resetVotingVotos() {
        if (!currentVotingId) {
            showToast('danger', 'Erro: ID da votação não encontrado.');
            adminModal.hide();
            return;
        }
        try {
            const response = await fetch(`/api/admin/votacao/${currentVotingId}/reset-votos`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao resetar votos');
            }

            const data = await response.json();
            showToast('success', data.message || 'Votos resetados com sucesso!');
            adminModal.hide();
            loadFilmesEmVotacao(); // Recarrega a lista
        } catch (error) {
            console.error('Erro ao resetar votos:', error);
            showToast('danger', error.message || 'Erro ao resetar votos.');
            adminModal.hide();
        }
    }

    // ==============================================
    // FUNÇÕES AUXILIARES
    // ==============================================
    function getAuthHeaders() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': localStorage.getItem('userId'),
            'x-user-type': localStorage.getItem('userType')
        };
    }

    function handleResponse(response) {
        if (!response.ok) {
            return response.text().then(text => {
                try {
                    const errorJson = JSON.parse(text);
                    throw new Error(errorJson.message || 'Erro da API');
                } catch {
                    // Se não for JSON, trate como um erro genérico
                    throw new Error(`Erro na rede ou servidor: ${response.status} ${response.statusText}`);
                }
            });
        }
        // Verifica se o Content-Type é JSON antes de tentar parsear
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            // Se a resposta for OK, mas não for JSON (ex: 204 No Content), retorne um objeto vazio
            return {};
        }
    }

    function handleError(context) {
        return function (error) {
            console.error(`${context}:`, error);
            showToast('danger', error.message || context);
            throw error;
        };
    }

    function showToast(type, message) {
        const toastContainer = document.getElementById('toast-container');
        const toastId = `toast-${Date.now()}`;

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0 show`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');

        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                        data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Remove o toast após 5 segundos
        setTimeout(() => {
            const bsToast = bootstrap.Toast.getOrCreateInstance(toast);
            bsToast.hide();
            toast.addEventListener('hidden.bs.toast', () => {
                toast.remove();
            });
        }, 5000);
    }

    // ==============================================
    // SNACKS
    // ==============================================
    function loadSnacks() {
        dynamicContent.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <h3>Snacks Cadastrados</h3>
                <button class="btn btn-primary" id="add-snack-btn">
                    <i class="bi bi-plus"></i> Adicionar Snack
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Imagem</th>
                            <th>Nome</th>
                            <th>Descrição</th>
                            <th>Tipo</th>
                            <th>Preço</th>
                            <th>Disponível</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="snacks-table">
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;

        fetch('/api/admin/snacks', { headers: getAuthHeaders() })
            .then(handleResponse)
            .then(snacks => {
                const tableBody = document.getElementById('snacks-table');
                if (snacks.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="6" class="text-center text-muted">Nenhum snack cadastrado</td>
                        </tr>
                    `;
                    return;
                }

                tableBody.innerHTML = snacks.map(snack => `
                        <tr data-id="${snack.id_snack}">
                            <td>
                                <img src="${snack.imagem_url || '/assets/img/placeholder-snack.jpg'}" 
                                    alt="${snack.nome}" 
                                    style="height: 60px; width: 60px; object-fit: cover; border-radius: 4px;">
                            </td>
                            <td>${snack.nome}</td>
                            <td>${snack.descricao}</td>
                            <td>${snack.tipo}</td> <!-- Nova coluna para o tipo -->
                            <td>R$ ${Number(snack.preco).toFixed(2).replace('.', ',')}</td>
                            <td>
                                <span class="badge ${snack.disponivel ? 'bg-success' : 'bg-danger'}">
                                    ${snack.disponivel ? 'Sim' : 'Não'}
                                </span>
                            </td>
                            <td>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-primary edit-snack" data-id="${snack.id_snack}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-snack" data-id="${snack.id_snack}">
                                    <i class="bi bi-trash"></i>
                                </button>
                                ${snack.disponivel ?
                        // Botão Desabilitar (disponivel = true, então oferece desabilitar)
                        `<button class="btn btn-sm btn-outline-danger toggle-snack-status" data-id="${snack.id_snack}" data-current-status="true" title="Desabilitar">
                                        <i class="bi bi-x-circle"></i>
                                    </button>`
                        :
                        // Botão Habilitar (disponivel = false, então oferece habilitar)
                        `<button class="btn btn-sm btn-outline-success toggle-snack-status" data-id="${snack.id_snack}" data-current-status="false" title="Habilitar">
                                        <i class="bi bi-check-circle"></i>
                                    </button>`
                    }
                            </div>
                        </td>
                    </tr>
                `).join('');

                // Adiciona eventos
                document.getElementById('add-snack-btn').addEventListener('click', () => showSnackForm());
                document.querySelectorAll('.edit-snack').forEach(btn => {
                    btn.addEventListener('click', () => editSnack(btn.dataset.id));
                });
                document.querySelectorAll('.delete-snack').forEach(btn => {
                    btn.addEventListener('click', () => confirmDeleteSnack(btn.dataset.id));
                });
                dynamicContent.querySelectorAll('.toggle-snack-status').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const id = e.currentTarget.dataset.id;
                        const currentStatus = e.currentTarget.dataset.currentStatus === 'true'; // Converte string para booleano
                        toggleSnackStatus(id, currentStatus);
                    });
                });
            })
            .catch(handleError('Erro ao carregar snacks'));
    }

    // ===============================================
    // Função para Ativar/Desativar Snacks
    // ===============================================
    async function toggleSnackStatus(snackId, currentStatus) {
        // Determine o novo status
        const newStatus = !currentStatus; // Se estava ativo (true), desativa (false), e vice-versa

        try {
            const response = await fetch(`${API_BASE_URL}/admin/snacks/${snackId}/status`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(), // Inclui o token de autenticação
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ disponivel: newStatus }) // Envia o novo status como 'disponivel'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erro HTTP: ${response.status}`);
            }

            mostrarAlerta('success', data.message);
            loadSnacks(); // Recarrega a lista de snacks para refletir a mudança
        } catch (error) {
            console.error('Erro ao alternar status do snack:', error);
            mostrarAlerta('danger', `Erro ao alternar status do snack: ${error.message}`);
        }
    }

    // Função para exibir o formulário de adicionar/editar snack
    function showSnackForm(snack = null) {
        modalTitle.textContent = snack ? 'Editar Snack' : 'Adicionar Snack';

        modalBody.innerHTML = `
        <form id="snack-form" enctype="multipart/form-data">
            <input type="hidden" id="snack-id" value="${snack ? snack.id_snack : ''}">
            
            <div class="mb-3">
                <label for="snack-nome" class="form-label">Nome*</label>
                <input type="text" class="form-control" id="snack-nome" 
                        value="${snack ? snack.nome : ''}" required>
            </div>
            
            <div class="mb-3">
                <label for="snack-descricao" class="form-label">Descrição</label>
                <textarea class="form-control" id="snack-descricao" rows="3">${snack ? snack.descricao : ''}</textarea>
            </div>
            
            <div class="mb-3">
                <label for="snack-preco" class="form-label">Preço*</label>
                <input type="number" step="0.01" class="form-control" id="snack-preco" 
                        value="${snack ? snack.preco : ''}" required>
            </div>

            <div class="mb-3">
                <label for="snack-tipo" class="form-label">Tipo*</label>
                <select class="form-select" id="snack-tipo" required>
                    <option value="lanche" ${snack?.tipo === 'lanche' ? 'selected' : ''}>Lanche</option>
                    <option value="bebida" ${snack?.tipo === 'bebida' ? 'selected' : ''}>Bebida</option>
                    <option value="doce" ${snack?.tipo === 'doce' ? 'selected' : ''}>Doce</option>
                    <option value="combo" ${snack?.tipo === 'combo' ? 'selected' : ''}>Combo</option>
                </select>
            </div>

            <div class="mb-3 form-check">
                <input type="checkbox" class="form-check-input" id="snack-disponivel" ${snack?.disponivel ? 'checked' : ''}>
                <label class="form-check-label" for="snack-disponivel">Disponível</label>
            </div>

            <div class="mb-3">
                <label for="snack-imagem" class="form-label">Imagem do Snack</label>
                <input type="file" class="form-control" id="snack-imagem" name="imagem" accept="image/*">
                ${snack?.imagem_url ?
                `<small class="text-muted">Deixe em branco para manter a imagem atual.</small>` : ''
            }
            </div>
            <div id="snack-image-preview-container" class="mb-3 text-center">
                ${snack?.imagem_url ?
                `<img src="${snack.imagem_url}" class="img-thumbnail" style="max-height: 150px;">` : ''
            }
            </div>
        </form>
        `;

        // Preview da imagem selecionada
        document.getElementById('snack-imagem').addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    document.getElementById('snack-image-preview-container').innerHTML = `
                        <img src="${event.target.result}" class="img-thumbnail" style="max-height: 150px;">
                    `;
                };
                reader.readAsDataURL(file);
            } else {
                // Se nenhum arquivo selecionado, volta para a imagem original (se houver) ou limpa
                document.getElementById('snack-image-preview-container').innerHTML = `
                    ${snack?.imagem_url ? `<img src="${snack.imagem_url}" class="img-thumbnail" style="max-height: 150px;">` : ''}
                `;
            }
        });

        modalConfirm.textContent = snack ? 'Atualizar' : 'Adicionar';
        modalConfirm.onclick = () => saveSnack(snack);
        adminModal.show();
    }

    // Função para salvar (adicionar ou editar) um snack
    async function saveSnack(snack = null) {
        const isEdit = !!snack;
        const snackId = isEdit ? snack.id_snack : null;

        const nome = document.getElementById('snack-nome').value;
        const descricao = document.getElementById('snack-descricao').value;
        const preco = document.getElementById('snack-preco').value;
        const disponivel = document.getElementById('snack-disponivel').checked;
        const imagemFile = document.getElementById('snack-imagem').files[0];
        const tipo = document.getElementById('snack-tipo').value;

        if (!nome || !preco) {
            showToast('warning', 'Nome e Preço são campos obrigatórios.');
            return;
        }

        // Criar FormData para enviar arquivos
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('descricao', descricao);
        formData.append('preco', preco);
        formData.append('tipo', tipo);
        formData.append('disponivel', disponivel ? '1' : '0');

        if (imagemFile) {
            formData.append('imagem', imagemFile); // 'imagem' é o nome do campo esperado pelo Multer no backend
        } else if (isEdit && snack.imagem_url) {
            // Se edição e nenhuma nova imagem selecionada, mas já existe uma imagem,
            // instrua o backend para manter a imagem existente.
            formData.append('manter_imagem', 'true');
        } else if (!isEdit && !imagemFile) {
            // Se cadastro e nenhuma imagem, permite continuar (imagem opcional para cadastro)
            // Caso queira tornar a imagem obrigatória no cadastro, descomente a linha abaixo:
            // showToast('warning', 'Selecione uma imagem para o snack.');
            // return;
        }

        const url = isEdit ? `/api/admin/snacks/${snackId}` : '/api/admin/snacks';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { ...getAuthHeaders() }, // Não inclua 'Content-Type' quando usar FormData, o browser faz isso
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro na requisição');
            }

            const data = await response.json();
            adminModal.hide();
            showToast('success', data.message || (isEdit ? 'Snack atualizado com sucesso!' : 'Snack adicionado com sucesso!'));
            loadSnacks(); // Recarrega a lista para mostrar as alterações
        } catch (error) {
            console.error('Erro ao salvar snack:', error);
            showToast('danger', error.message || 'Erro ao salvar snack.');
        }
    }

    // Função para carregar dados do snack para edição
    async function editSnack(id) {
        try {
            const response = await fetch(`/api/admin/snacks/${id}`, { headers: getAuthHeaders() });
            const snack = await handleResponse(response);
            showSnackForm(snack);
        } catch (error) {
            handleError('Erro ao carregar dados do snack para edição')(error);
        }
    }

    // Função para confirmar exclusão de snack
    function confirmDeleteSnack(id) {
        modalTitle.textContent = 'Confirmar Exclusão';
        modalBody.innerHTML = '<p>Tem certeza de que deseja excluir este snack?</p>';
        modalConfirm.textContent = 'Excluir';
        modalConfirm.className = 'btn btn-danger'; // Muda a cor para vermelho
        modalConfirm.onclick = () => deleteSnack(id);
        adminModal.show();
    }

    // Função para excluir snack
    async function deleteSnack(id) {
        try {
            const response = await fetch(`/api/admin/snacks/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro na requisição');
            }

            const data = await response.json();
            adminModal.hide();
            showToast('success', data.message || 'Snack excluído com sucesso!');
            loadSnacks();
        } catch (error) {
            console.error('Erro ao excluir snack:', error);
            showToast('danger', error.message || 'Erro ao excluir snack.');
        }
    }

    // Função para alternar o status de disponibilidade do snack
    async function toggleSnackStatus(id, currentStatus) {
        try {
            const newStatus = !currentStatus; // Inverte o status atual
            const response = await fetch(`/api/admin/snacks/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao alternar status do snack');
            }

            const data = await response.json();
            showToast('success', data.message || 'Status do snack atualizado!');
            loadSnacks(); // Recarrega a lista para refletir a mudança
        } catch (error) {
            console.error('Erro ao alternar status do snack:', error);
            showToast('danger', error.message || 'Erro ao alternar status do snack.');
        }
    }

    // ==============================================
    // PRMOÇÕES
    // ==============================================

    function loadPromocoes() {
        dynamicContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <h3>Promoções Cadastradas</h3>
            <button class="btn btn-primary" id="add-promocao-btn">
                <i class="bi bi-plus"></i> Adicionar Promoção
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Imagem</th>
                        <th>Título</th>
                        <th>Tipo</th>
                        <th>Período</th>
                        <th>Desconto</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="promocoes-table">
                    <tr>
                        <td colspan="7" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

        fetch('/api/admin/promocoes', { headers: getAuthHeaders() })
            .then(handleResponse)
            .then(promocoes => {
                const tableBody = document.getElementById('promocoes-table');

                if (promocoes.length === 0) {
                    tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted">
                            Nenhuma promoção cadastrada
                        </td>
                    </tr>
                `;
                    return;
                }

                tableBody.innerHTML = promocoes.map(promo => `
                <tr data-id="${promo.id_promocao}">
                    <td><img src="${promo.imagem_url || '/assets/img/placeholder.jpg'}" 
                        style="height: 50px; width: 50px; border-radius: 5px; object-fit: cover;"></td>
                    <td>${promo.titulo}</td>
                    <td>${promo.tipo_promocao}</td>
                    <td>${formatDate(promo.data_inicio)} a ${formatDate(promo.data_fim)}</td>
                    <td>${promo.valor_desconto ? `R$ ${promo.valor_desconto}` : promo.porcentagem_desconto ? `${promo.porcentagem_desconto}%` : '-'}</td>
                    <td>
                        <span class="badge ${promo.ativo ? 'bg-success' : 'bg-secondary'}">
                            ${promo.ativo ? 'Ativa' : 'Inativa'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-promocao" data-id="${promo.id_promocao}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-promocao" data-id="${promo.id_promocao}">
                            <i class="bi bi-trash"></i>
                        </button>
                        ${promo.ativo
                        ? `<button class="btn btn-sm btn-outline-danger toggle-status-promocao" data-id="${promo.id_promocao}" data-status="true" title="Desativar">
                    <i class="bi bi-x-circle"></i>
                    </button>`
                        : `<button class="btn btn-sm btn-outline-success toggle-status-promocao" data-id="${promo.id_promocao}" data-status="false" title="Ativar">
                            <i class="bi bi-check-circle"></i>
                    </button>`
                    }
                </td>
                </tr>
            `).join('');

                document.querySelectorAll('.edit-promocao').forEach(btn => {
                    btn.addEventListener('click', () => editPromocao(btn.dataset.id));
                });

                document.querySelectorAll('.delete-promocao').forEach(btn => {
                    btn.addEventListener('click', () => confirmDeletePromocao(btn.dataset.id));
                });

                document.querySelectorAll('.toggle-status-promocao').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.dataset.id;
                        const status = btn.dataset.status === 'true';
                        toggleStatusPromocao(id, status);
                    });
                });

                document.getElementById('add-promocao-btn').addEventListener('click', () => showPromocaoForm());
            })
            .catch(handleError('Erro ao carregar promoções'));
    }

    function editPromocao(id) {
        fetch(`/api/admin/promocoes`, { headers: getAuthHeaders() })
            .then(handleResponse)
            .then(promocoes => {
                const promocao = promocoes.find(p => p.id_promocao == id);
                if (!promocao) {
                    mostrarAlerta('danger', 'Promoção não encontrada.');
                    return;
                }
                showPromocaoForm(promocao);
            })
            .catch(handleError('Erro ao carregar dados da promoção'));
    }

    function showPromocaoForm(promocao = null) {
        modalTitle.textContent = promocao ? 'Editar Promoção' : 'Adicionar Promoção';
        modalBody.innerHTML = `
        <form id="promocao-form" enctype="multipart/form-data">
            <input type="hidden" id="promocao-id" value="${promocao ? promocao.id_promocao : ''}">
            
            <div class="mb-3">
                <label for="titulo" class="form-label">Título*</label>
                <input type="text" class="form-control" id="titulo" value="${promocao ? promocao.titulo : ''}" required>
            </div>
            
            <div class="mb-3">
                <label for="descricao" class="form-label">Descrição</label>
                <textarea class="form-control" id="descricao" rows="3">${promocao ? promocao.descricao : ''}</textarea>
            </div>
            
            <div class="mb-3">
                <label for="tipo-promocao" class="form-label">Tipo de Promoção*</label>
                <select class="form-select" id="tipo-promocao">
                    <option value="filme" ${promocao && promocao.tipo_promocao === 'filme' ? 'selected' : ''}>Filme</option>
                    <option value="snack" ${promocao && promocao.tipo_promocao === 'snack' ? 'selected' : ''}>Snack</option>
                    <option value="geral" ${promocao && promocao.tipo_promocao === 'geral' ? 'selected' : ''}>Geral</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label for="valor-desconto" class="form-label">Valor Desconto (R$)</label>
                <input type="number" class="form-control" id="valor-desconto" step="0.01" value="${promocao ? (promocao.valor_desconto || '') : ''}">
            </div>
            
            <div class="mb-3">
                <label for="porcentagem-desconto" class="form-label">Porcentagem Desconto (%)</label>
                <input type="number" class="form-control" id="porcentagem-desconto" step="0.01" value="${promocao ? (promocao.porcentagem_desconto || '') : ''}">
            </div>
            
            <div class="mb-3">
                <label for="data-inicio" class="form-label">Data Início*</label>
                <input type="date" class="form-control" id="data-inicio" value="${promocao ? formatDateForInput(promocao.data_inicio) : ''}" required>
            </div>
            
            <div class="mb-3">
                <label for="data-fim" class="form-label">Data Fim*</label>
                <input type="date" class="form-control" id="data-fim" value="${promocao ? formatDateForInput(promocao.data_fim) : ''}" required>
            </div>
            
            <div class="mb-3">
                <label for="imagem" class="form-label">Imagem</label>
                <input type="file" class="form-control" id="imagem" accept="image/*">
                ${promocao && promocao.imagem_url ? `<img src="${promocao.imagem_url}" class="mt-2" style="width: 100px;">` : ''}
            </div>
        </form>
    `;
        modalConfirm.onclick = () => savePromocao();
        adminModal.show();
    }

    function savePromocao() {
        const id = document.getElementById('promocao-id').value;
        const formData = new FormData();
        formData.append('titulo', document.getElementById('titulo').value);
        formData.append('descricao', document.getElementById('descricao').value);
        formData.append('tipo_promocao', document.getElementById('tipo-promocao').value);
        formData.append('valor_desconto', document.getElementById('valor-desconto').value);
        formData.append('porcentagem_desconto', document.getElementById('porcentagem-desconto').value);
        formData.append('data_inicio', document.getElementById('data-inicio').value);
        formData.append('data_fim', document.getElementById('data-fim').value);

        const imagem = document.getElementById('imagem').files[0];
        if (imagem) {
            formData.append('imagem', imagem);
            formData.append('manter_imagem', 'false');
        } else {
            formData.append('manter_imagem', 'true');
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/promocoes/${id}` : '/api/admin/promocoes';

        fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: formData
        })
            .then(handleResponse)
            .then(() => {
                adminModal.hide();
                mostrarAlerta('success', `Promoção ${id ? 'atualizada' : 'adicionada'} com sucesso!`);
                loadPromocoes();
            })
            .catch(handleError('Erro ao salvar promoção'));
    }

    function confirmDeletePromocao(id) {
        if (!confirm('Tem certeza que deseja excluir esta promoção?')) return;

        fetch(`/api/admin/promocoes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(() => {
                mostrarAlerta('success', 'Promoção excluída com sucesso!');
                loadPromocoes();
            })
            .catch(handleError('Erro ao excluir promoção'));
    }

    function toggleStatusPromocao(id, ativoAtual) {
        fetch(`/api/admin/promocoes/${id}/status`, {
            method: 'PATCH',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativo: !ativoAtual })
        })
            .then(handleResponse)
            .then(() => {
                mostrarAlerta('success', 'Status atualizado com sucesso!');
                loadPromocoes();
            })
            .catch(handleError('Erro ao alterar status da promoção'));
    }

    // ==============================================
    // PARCERIAS
    // ==============================================

    // Carrega e exibe a lista de parcerias
    async function loadParcerias() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/parcerias`, { headers: getAuthHeaders() });
            const parcerias = await response.json();

            if (!response.ok) {
                throw new Error(parcerias.message || `Erro HTTP: ${response.status}`);
            }

            let tableRows = '';
            if (parcerias.length === 0) {
                tableRows = '<tr><td colspan="8" class="text-center">Nenhuma parceria encontrada.</td></tr>';
            } else {
                tableRows = parcerias.map(parceria => `
                <tr>
                    <td>
                        ${parceria.logo_url ? `<img src="${parceria.logo_url}" alt="${parceria.nome}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">` : 'N/A'}
                    </td>
                    <td>${parceria.nome}</td>
                    <td>${parceria.descricao || 'N/A'}</td>
                    <td><a href="${parceria.site_url}" target="_blank">${parceria.site_url || 'N/A'}</a></td>
                    <td>${parceria.contato || 'N/A'}</td>
                    <td>${parceria.ativo ? '<span class="badge bg-success">Ativa</span>' : '<span class="badge bg-danger">Inativa</span>'}</td>
                    <td class="text-nowrap">
                        <button class="btn btn-sm btn-outline-primary me-1 edit-parceria-btn" data-id="${parceria.id_parceria}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-parceria-btn" data-id="${parceria.id_parceria}" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                        ${parceria.ativo ?
                        // Botão Desabilitar (ativo = true, então oferece desabilitar)
                        `<button class="btn btn-sm btn-outline-danger me-1 toggle-status-parceria-btn" data-id="${parceria.id_parceria}" data-current-status="true" title="Desabilitar">
                                <i class="bi bi-x-circle"></i>
                            </button>`
                        :
                        // Botão Habilitar (ativo = false, então oferece habilitar)
                        `<button class="btn btn-sm btn-outline-success me-1 toggle-status-parceria-btn" data-id="${parceria.id_parceria}" data-current-status="false" title="Habilitar">
                                <i class="bi bi-check-circle"></i>
                            </button>`
                    }
                    </td>
                </tr>
            `).join('');
            }

            dynamicContent.innerHTML = `
            <div class="card shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Gerenciar Parcerias</h5>
                    <button class="btn btn-primary" id="addParceriaBtn">
                        <i class="bi bi bi-plus"></i> Adicionar Parceria
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Logo</th>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th>Site</th>
                                    <th>Contato</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

            document.getElementById('addParceriaBtn').addEventListener('click', addParceria);

            dynamicContent.querySelectorAll('.edit-parceria-btn').forEach(button => {
                button.addEventListener('click', (e) => editParceria(e.currentTarget.dataset.id));
            });
            dynamicContent.querySelectorAll('.delete-parceria-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteParceria(e.currentTarget.dataset.id));
            });
            dynamicContent.querySelectorAll('.toggle-status-parceria-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const currentStatus = e.currentTarget.dataset.currentStatus === 'true';
                    toggleParceriaStatus(id, currentStatus);
                });
            });

        } catch (error) {
            console.error('Erro ao carregar parcerias:', error);
            dynamicContent.innerHTML = `<div class="alert alert-danger">Erro ao carregar parcerias: ${error.message}</div>`;
            mostrarAlerta('danger', `Erro ao carregar parcerias: ${error.message}`);
        }
    }

    // Nova função para habilitar/desabilitar parceria
    async function toggleParceriaStatus(parceriaId, currentStatus) {
        const newStatus = !currentStatus; // Inverte o status atual
        const actionText = newStatus ? 'habilitar' : 'desabilitar';

        if (!confirm(`Tem certeza que deseja ${actionText} esta parceria?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/parcerias/${parceriaId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ ativo: newStatus })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Erro ao ${actionText} parceria.`);
            }

            mostrarAlerta('success', data.message);
            loadParcerias(); // Recarrega a lista para refletir a mudança
        } catch (error) {
            console.error(`Erro ao ${actionText} parceria:`, error);
            mostrarAlerta('danger', `Erro ao ${actionText} parceria: ${error.message}`);
        }
    }

    // Função para atualizar o status da parceria (ativar/desativar)
    async function updateParceriaStatus(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/parcerias/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ status: status })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao atualizar status.');
            }

            mostrarAlerta('success', data.message);
            loadParcerias();

        } catch (error) {
            console.error('Erro ao atualizar status da parceria:', error);
            mostrarAlerta('danger', `Erro ao atualizar status: ${error.message}`);
            const toggle = document.getElementById(`parceriaSwitch_${id}`);
            if (toggle) toggle.checked = !status;
        }
    }

    // Abre o modal para adicionar uma nova parceria
    function addParceria() {
        parceriaModalTitle.textContent = 'Adicionar Nova Parceria';
        parceriaModalBody.innerHTML = `
        <form id="parceriaForm" enctype="multipart/form-data">
            <div class="mb-3">
                <label for="add_nome" class="form-label">Nome da Parceria:</label>
                <input type="text" class="form-control" id="add_nome" name="nome" required>
            </div>
            <div class="mb-3">
                <label for="add_descricao" class="form-label">Descrição:</label>
                <textarea class="form-control" id="add_descricao" name="descricao" rows="3"></textarea>
            </div>
            <div class="mb-3">
                <label for="add_logo_file" class="form-label">Logo da Parceria:</label>
                <input type="file" class="form-control" id="add_logo_file" name="logo_file" accept="image/*">
                <small class="form-text text-muted">Selecione uma imagem para a logo (JPG, PNG, GIF).</small>
            </div>
            <div class="mb-3">
                <label for="add_site_url" class="form-label">URL do Site:</label>
                <input type="url" class="form-control" id="add_site_url" name="site_url">
            </div>
            <div class="mb-3">
                <label for="add_contato" class="form-label">Contato:</label>
                <input type="text" class="form-control" id="add_contato" name="contato">
            </div>
            <div class="mb-3 form-check form-switch">
                <input class="form-check-input" type="checkbox" id="add_ativo" name="ativo" checked>
                <label class="form-check-label" for="add_ativo">Ativa</label>
            </div>
        </form>
    `;
        parceriaModal.show();

        // Limpa listeners antigos e adiciona o novo para adicionar
        parceriaModalSubmitBtn.removeEventListener('click', submitEditParceriaForm); // Remove de editar
        parceriaModalSubmitBtn.addEventListener('click', submitAddParceriaForm); // Adiciona para adicionar
    }

    // Função para enviar os dados do formulário de adição (NÃO É MAIS submitEditParceriaForm)
    async function submitAddParceriaForm(e) {
        if (e && e.preventDefault) e.preventDefault();

        const form = document.getElementById('parceriaForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        // Para 'ativo', o FormData já pega o valor do checkbox se o 'name' estiver definido.
        // Se o backend espera '1' ou '0' para booleano, precisamos ajustar o valor do FormData
        formData.set('ativo', document.getElementById('add_ativo').checked ? '1' : '0');

        // Não precisamos remover 'logo_file' se ele não foi selecionado,
        // pois o FormData(form) só inclui arquivos selecionados.

        try {
            const response = await fetch(`${API_BASE_URL}/admin/parcerias`, {
                method: 'POST',
                headers: getAuthHeaders(), // Importante: NÃO inclua 'Content-Type': 'multipart/form-data' aqui. O navegador faz isso automaticamente para FormData.
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao adicionar parceria.');
            }

            mostrarAlerta('success', data.message);
            parceriaModal.hide();
            loadParcerias();
        } catch (error) {
            console.error('Erro ao adicionar parceria:', error);
            mostrarAlerta('danger', `Erro ao adicionar parceria: ${error.message}`);
        }
    }

    // Função para editar uma parceria existente
    async function editParceria(parceriaId) {
        parceriaModalTitle.textContent = 'Editar Parceria';
        parceriaModalBody.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2">Carregando dados da parceria...</p>
        </div>
    `;
        parceriaModal.show();

        try {
            const response = await fetch(`${API_BASE_URL}/admin/parcerias/${parceriaId}`, {
                headers: getAuthHeaders()
            });

            const parceria = await response.json();

            if (!response.ok) {
                throw new Error(parceria.message || `Erro na rede ou servidor: ${response.status} ${response.statusText}`);
            }

            parceriaModalBody.innerHTML = `
            <form id="parceriaForm" enctype="multipart/form-data">
                <input type="hidden" id="edit_id_parceria" name="id_parceria" value="${parceria.id_parceria}">

                <div class="mb-3">
                    <label for="edit_nome" class="form-label">Nome da Parceria:</label>
                    <input type="text" class="form-control" id="edit_nome" name="nome" value="${parceria.nome || ''}" required>
                </div>

                <div class="mb-3">
                    <label for="edit_descricao" class="form-label">Descrição:</label>
                    <textarea class="form-control" id="edit_descricao" name="descricao" rows="3">${parceria.descricao || ''}</textarea>
                </div>

                <div class="mb-3">
                    <label for="edit_logo_file" class="form-label">Nova Logo da Parceria (opcional):</label>
                    <input type="file" class="form-control" id="edit_logo_file" name="logo_file" accept="image/*">
                    <small class="form-text text-muted">Selecione uma nova imagem para a logo (JPG, PNG, GIF). Deixe em branco para manter a atual.</small>
                    <input type="hidden" id="current_logo_url_input" name="current_logo_url" value="${parceria.logo_url || ''}">
                </div>

                <div class="mb-3">
                    <label for="edit_site_url" class="form-label">URL do Site:</label>
                    <input type="url" class="form-control" id="edit_site_url" name="site_url" value="${parceria.site_url || ''}">
                </div>

                <div class="mb-3">
                    <label for="edit_contato" class="form-label">Contato:</label>
                    <input type="text" class="form-control" id="edit_contato" name="contato" value="${parceria.contato || ''}">
                </div>

                <div class="mb-3 form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="edit_ativo" name="ativo" ${parceria.ativo ? 'checked' : ''}>
                    <label class="form-check-label" for="edit_ativo">Ativa</label>
                </div>
            </form>
        `;

            // Limpa listeners antigos e adiciona o novo para editar, passando o ID da parceria
            parceriaModalSubmitBtn.removeEventListener('click', submitAddParceriaForm); // Remove de adicionar
            parceriaModalSubmitBtn.removeEventListener('click', submitEditParceriaForm); // Remove de editar anterior
            parceriaModalSubmitBtn.addEventListener('click', submitEditParceriaForm); // Adiciona para editar


        } catch (error) {
            console.error('Erro ao carregar dados da parceria para edição:', error);
            parceriaModalBody.innerHTML = `<div class="alert alert-danger">Erro ao carregar dados: ${error.message}</div>`;
            mostrarAlerta('danger', `Erro ao carregar dados da parceria: ${error.message}`);
        }
    }

    // Função para enviar os dados do formulário de edição
    async function submitEditParceriaForm() {
        const form = document.getElementById('parceriaForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Pega o ID do campo hidden do formulário
        const parceriaId = document.getElementById('edit_id_parceria').value;

        const formData = new FormData(form);
        formData.set('ativo', document.getElementById('edit_ativo').checked ? '1' : '0');

        const currentLogoUrl = document.getElementById('current_logo_url_input')?.value;
        console.log('Current logo URL:', currentLogoUrl); // DEBUG
        if (currentLogoUrl) {
            formData.set('logo_url_existing', currentLogoUrl);
        }

        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/parcerias/${parceriaId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao salvar edição da parceria.');
            }

            mostrarAlerta('success', data.message);
            parceriaModal.hide();
            loadParcerias();
        } catch (error) {
            console.error('Erro ao salvar edição da parceria:', error);
            mostrarAlerta('danger', `Erro ao salvar edição: ${error.message}`);
        }
    }

    // Função para excluir uma parceria
    async function deleteParceria(parceriaId) {
        if (!confirm('Tem certeza que deseja excluir esta parceria?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/parcerias/${parceriaId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao excluir parceria.');
            }

            mostrarAlerta('success', data.message);
            loadParcerias();
        } catch (error) {
            console.error('Erro ao excluir parceria:', error);
            mostrarAlerta('danger', `Erro ao excluir parceria: ${error.message}`);
        }
    }


    // ==============================================
    // FEEDBACKS
    // ==============================================

    async function loadFeedbacks() {
        console.log('🚀 Iniciando loadFeedbacks...');

        try {
            console.log('🌐 Fazendo requisição para feedbacks...');

            // Pegar credenciais do localStorage
            const userId = localStorage.getItem('userId');
            const userType = localStorage.getItem('userType');

            console.log('Credenciais:', { userId, userType });

            if (!userId || userType !== 'admin') {
                throw new Error('Usuário não é administrador ou não está logado');
            }

            // Preparar headers com credenciais
            const headers = {
                'Content-Type': 'application/json',
                'x-user-id': userId,
                'x-user-type': userType
            };

            console.log('Headers enviados:', headers);

            const response = await fetch(`${API_BASE_URL}/admin/feedbacks`, {
                method: 'GET',
                headers: headers
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro na resposta:', errorText);
                throw new Error(`Erro na rede ou servidor: ${response.status} ${response.statusText}`);
            }

            const feedbacks = await response.json();
            console.log('✅ Feedbacks carregados:', feedbacks.length, 'itens');

            let feedbacksHtml = `
        <h2 class="mb-4">Gerenciar Feedbacks de Sessão</h2>
        <div class="table-responsive">
            <table class="table table-hover table-striped">
                <thead>
                    <tr>
                        <th>ID Feedback</th>
                        <th>Usuário</th>
                        <th>Filme</th>
                        <th>Tipo</th>
                        <th>Mensagem</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
    `;

            if (feedbacks.length === 0) {
                feedbacksHtml += `<tr><td colspan="8" class="text-center">Nenhum feedback encontrado.</td></tr>`;
            } else {
                feedbacks.forEach(feedback => {
                    const mensagemCurta = feedback.mensagem && feedback.mensagem.length > 50
                        ? feedback.mensagem.substring(0, 50) + '...'
                        : (feedback.mensagem || 'N/A');

                    feedbacksHtml += `
                <tr>
                    <td>${feedback.id_feedback}</td>
                    <td>${feedback.nome_usuario || 'N/A'}</td>
                    <td>${feedback.filme_titulo || 'N/A'}</td>
                    <td>${formatTipoProblema(feedback.tipo_problema)}</td>
                    <td>${mensagemCurta}</td>
                    <td>${new Date(feedback.data_hora).toLocaleDateString('pt-BR')}</td>
                    <td>
                        <span class="badge ${getFeedbackStatusBadgeClass(feedback.status_feedback)}">
                            ${formatStatusFeedback(feedback.status_feedback)}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-feedback-btn" data-id="${feedback.id_feedback}">
                            <i class="bi bi-eye"></i> Visualizar
                        </button>
                        <button class="btn btn-sm btn-outline-danger edit-feedback-status-btn" data-id="${feedback.id_feedback}" data-current-status="${feedback.status_feedback}">
                            <i class="bi bi-pencil-square"></i> Status
                        </button>
                    </td>
                </tr>
            `;
                });
            }

            feedbacksHtml += `
                </tbody>
            </table>
        </div>
    `;

            // Verificar se dynamicContent existe
            if (!dynamicContent) {
                console.error('❌ Elemento dynamicContent não encontrado!');
                return;
            }

            dynamicContent.innerHTML = feedbacksHtml;

            // Verificar se pageTitle existe
            if (pageTitle) {
                pageTitle.textContent = 'Gerenciar Feedbacks';
            } else {
                console.warn('⚠️ Elemento pageTitle não encontrado');
            }

            // Aguardar DOM ser atualizado antes de adicionar listeners
            setTimeout(() => {
                const viewButtons = document.querySelectorAll('.view-feedback-btn');
                const editButtons = document.querySelectorAll('.edit-feedback-status-btn');

                console.log('🔍 Adicionando listeners - View buttons:', viewButtons.length, 'Edit buttons:', editButtons.length);

                viewButtons.forEach(button => {
                    if (button && !button.hasAttribute('data-listener-added')) {
                        button.addEventListener('click', (e) => {
                            const feedbackId = e.currentTarget.dataset.id;
                            viewFeedbackDetails(feedbackId, feedbacks);
                        });
                        button.setAttribute('data-listener-added', 'true');
                    }
                });

                editButtons.forEach(button => {
                    if (button && !button.hasAttribute('data-listener-added')) {
                        button.addEventListener('click', (e) => {
                            const feedbackId = e.currentTarget.dataset.id;
                            const currentStatus = e.currentTarget.dataset.currentStatus;
                            editFeedbackStatus(feedbackId, currentStatus);
                        });
                        button.setAttribute('data-listener-added', 'true');
                    }
                });
            }, 100);

            console.log('✅ loadFeedbacks concluído com sucesso');

        } catch (error) {
            console.error('❌ Erro em loadFeedbacks:', error);

            // Verificar se dynamicContent existe antes de atualizar
            if (dynamicContent) {
                dynamicContent.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Erro ao carregar feedbacks</h4>
                <p>${error.message}</p>
                <hr>
                <button class="btn btn-outline-danger" onclick="loadFeedbacks()">
                    <i class="bi bi-arrow-clockwise"></i> Tentar novamente
                </button>
            </div>
        `;
            }

            // Chama handleError se existir
            if (typeof handleError === 'function') {
                handleError('Erro ao carregar feedbacks')(error);
            }
        }
    }

    // Função auxiliar para classes de badge dos feedbacks
    function getFeedbackStatusBadgeClass(status) {
        switch (status) {
            case 'aberto': return 'bg-danger';
            case 'em_progresso': return 'bg-warning';
            case 'resolvido': return 'bg-success';
            default: return 'bg-info';
        }
    }

    // Função auxiliar para formatar tipo de problema
    function formatTipoProblema(tipo) {
        const tipos = {
            'tecnico': 'Técnico',
            'atendimento': 'Atendimento',
            'sugestao': 'Sugestão',
            'outro': 'Outro'
        };
        return tipos[tipo] || tipo;
    }

    // Função auxiliar para formatar status do feedback
    function formatStatusFeedback(status) {
        const statuses = {
            'aberto': 'ABERTO',
            'em_progresso': 'EM PROGRESSO',
            'resolvido': 'RESOLVIDO'
        };
        return statuses[status] || status.toUpperCase();
    }

    // Função para exibir detalhes do feedback em um modal
    function viewFeedbackDetails(id, feedbacks) {
        console.log('👁️ Visualizando feedback:', id);

        const feedback = feedbacks.find(f => String(f.id_feedback) === String(id));
        if (!feedback) {
            console.error('❌ Feedback não encontrado:', id);
            if (typeof mostrarAlerta === 'function') {
                mostrarAlerta('danger', 'Detalhes do feedback não encontrados.');
            }
            return;
        }

        modalTitle.textContent = `Detalhes do Feedback #${feedback.id_feedback}`;
        modalBody.innerHTML = `
        <p><strong>Usuário:</strong> ${feedback.nome_usuario}</p>
        <p><strong>Email:</strong> ${feedback.email_usuario}</p>
        <p><strong>Filme:</strong> ${feedback.filme_titulo || 'N/A'}</p>
        <p><strong>Tipo do Problema:</strong> ${formatTipoProblema(feedback.tipo_problema)}</p>
        <p><strong>Data/Hora:</strong> ${new Date(feedback.data_hora).toLocaleString('pt-BR')}</p>
        <p><strong>Status:</strong> <span class="badge ${getFeedbackStatusBadgeClass(feedback.status_feedback)}">${formatStatusFeedback(feedback.status_feedback)}</span></p>
        <p><strong>Mensagem:</strong></p>
        <div class="p-3 bg-light rounded">${feedback.mensagem}</div>
    `;
        modalConfirm.style.display = 'none';
        adminModal.show();
    }

    // Função para exibir o modal de edição de status do feedback
    async function editFeedbackStatus(id, currentStatus) {
        console.log('✏️ Editando status do feedback:', id, 'Status atual:', currentStatus);

        modalTitle.textContent = `Atualizar Status do Feedback #${id}`;
        modalBody.innerHTML = `
        <p>Status atual: <span class="badge ${getFeedbackStatusBadgeClass(currentStatus)}">${formatStatusFeedback(currentStatus)}</span></p>
        <div class="mb-3">
            <label for="newStatus" class="form-label">Novo Status</label>
            <select class="form-select" id="newStatus">
                <option value="aberto" ${currentStatus === 'aberto' ? 'selected' : ''}>Aberto</option>
                <option value="em_progresso" ${currentStatus === 'em_progresso' ? 'selected' : ''}>Em Progresso</option>
                <option value="resolvido" ${currentStatus === 'resolvido' ? 'selected' : ''}>Resolvido</option>
            </select>
        </div>
        <div id="statusUpdateMessage" class="mt-3 text-center"></div>
    `;

        modalConfirm.style.display = 'inline-block';
        modalConfirm.textContent = 'Atualizar';
        modalConfirm.className = 'btn btn-primary';
        modalConfirm.onclick = async () => {
            const newStatus = document.getElementById('newStatus').value;
            const statusUpdateMessage = document.getElementById('statusUpdateMessage');
            statusUpdateMessage.textContent = '';

            try {
                console.log('🔄 Atualizando status para:', newStatus);

                // Pegar credenciais
                const userId = localStorage.getItem('userId');
                const userType = localStorage.getItem('userType');

                const response = await fetch(`${API_BASE_URL}/admin/feedbacks/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId,
                        'x-user-type': userType
                    },
                    body: JSON.stringify({ status_feedback: newStatus })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Falha ao atualizar status.');
                }

                console.log('✅ Status atualizado com sucesso');
                statusUpdateMessage.textContent = result.message;
                statusUpdateMessage.classList.remove('text-danger');
                statusUpdateMessage.classList.add('text-success');

                setTimeout(() => {
                    adminModal.hide();
                    loadFeedbacks();
                }, 1000);

            } catch (error) {
                console.error('❌ Erro ao atualizar status:', error);
                statusUpdateMessage.textContent = error.message || 'Erro desconhecido ao atualizar status.';
                statusUpdateMessage.classList.remove('text-success');
                statusUpdateMessage.classList.add('text-danger');
            }
        };

        adminModal.show();
    }

    // ===============================================
    // Função para Carregar Sessões
    // ===============================================
    function loadSessoes() {
        dynamicContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <h3>Sessões Cadastradas</h3>
            <button class="btn btn-primary" id="add-sessao-btn">
                <i class="bi bi-plus"></i> Adicionar Sessão
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Filme</th>
                        <th>Sala</th>
                        <th>Data/Hora</th>
                        <th>Tipo Exibição</th>
                        <th>Valor Ingresso</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="sessoes-table">
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

        // updateActiveLink('sessoes-link');

        fetch(`${API_BASE_URL}/admin/sessoes`, { headers: getAuthHeaders() })
            .then(handleResponse)
            .then(sessoes => {
                const tableBody = document.getElementById('sessoes-table');
                if (sessoes.length === 0) {
                    tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted">Nenhuma sessão cadastrada</td>
                    </tr>
                `;
                    return;
                }

                tableBody.innerHTML = sessoes.map(sessao => `
                <tr data-id="${sessao.id_sessao}">
                    <td>${sessao.filme_nome || '-'}</td>
                    <td>Sala ${sessao.id_sala}</td>
                    <td>${formatDateTime(sessao.data_hora)}</td>
                    <td>${sessao.tipo_exibicao}</td>
                    <td>R$ ${Number(sessao.valor_ingresso).toFixed(2).replace('.', ',')}</td>
                    <td>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary edit-sessao" data-id="${sessao.id_sessao}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-sessao" data-id="${sessao.id_sessao}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

                // Adiciona eventos
                document.getElementById('add-sessao-btn').addEventListener('click', () => showSessaoForm());
                document.querySelectorAll('.edit-sessao').forEach(btn => {
                    btn.addEventListener('click', () => editSessao(btn.dataset.id));
                });
                document.querySelectorAll('.delete-sessao').forEach(btn => {
                    btn.addEventListener('click', () => confirmDeleteSessao(btn.dataset.id));
                });
            })
            .catch(handleError('Erro ao carregar sessões'));
    }

    // ===============================================
    // Função para formatar data/hora
    // ===============================================
    function formatDateTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // ===============================================
    // Função para exibir o formulário de adicionar/editar sessão
    // ===============================================
    function showSessaoForm(sessao = null) {
        modalTitle.textContent = sessao ? 'Editar Sessão' : 'Adicionar Sessão';

        modalBody.innerHTML = `
        <form id="sessao-form">
            <input type="hidden" id="sessao-id" value="${sessao ? sessao.id_sessao : ''}">
            
            <div class="mb-3">
                <label for="sessao-filme" class="form-label">Filme*</label>
                <select class="form-select" id="sessao-filme" required>
                    <option value="">Carregando filmes...</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label for="sessao-sala" class="form-label">Sala*</label>
                <select class="form-select" id="sessao-sala" required>
                    <option value="">Selecione uma sala</option>
                    <option value="1" ${sessao?.id_sala === 1 ? 'selected' : ''}>Sala 1</option>
                    <option value="2" ${sessao?.id_sala === 2 ? 'selected' : ''}>Sala 2</option>
                    <option value="3" ${sessao?.id_sala === 3 ? 'selected' : ''}>Sala 3</option>
                    <option value="4" ${sessao?.id_sala === 4 ? 'selected' : ''}>Sala 4</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label for="sessao-data-hora" class="form-label">Data e Hora*</label>
                <input type="datetime-local" class="form-control" id="sessao-data-hora" 
                       value="${sessao ? formatDateTimeForInput(sessao.data_hora) : ''}" required>
            </div>
            
            <div class="mb-3">
                <label for="sessao-tipo-exibicao" class="form-label">Tipo de Exibição*</label>
                <select class="form-select" id="sessao-tipo-exibicao" required>
                    <option value="">Selecione o tipo</option>
                    <option value="2D Dublado" ${sessao?.tipo_exibicao === '2D Dublado' ? 'selected' : ''}>2D Dublado</option>
                    <option value="2D Legendado" ${sessao?.tipo_exibicao === '2D Legendado' ? 'selected' : ''}>2D Legendado</option>
                    <option value="3D Dublado" ${sessao?.tipo_exibicao === '3D Dublado' ? 'selected' : ''}>3D Dublado</option>
                    <option value="3D Legendado" ${sessao?.tipo_exibicao === '3D Legendado' ? 'selected' : ''}>3D Legendado</option>
                    <option value="IMAX Dublado" ${sessao?.tipo_exibicao === 'IMAX Dublado' ? 'selected' : ''}>IMAX Dublado</option>
                    <option value="IMAX Legendado" ${sessao?.tipo_exibicao === 'IMAX Legendado' ? 'selected' : ''}>IMAX Legendado</option>
                </select>
            </div>
            
            <div class="mb-3">
                <label for="sessao-valor-ingresso" class="form-label">Valor do Ingresso*</label>
                <input type="number" step="0.01" class="form-control" id="sessao-valor-ingresso" 
                       value="${sessao ? sessao.valor_ingresso : ''}" required>
            </div>
        </form>
    `;

        // Carregar filmes disponíveis
        loadFilmesForSelect(sessao?.id_filme);

        modalConfirm.textContent = sessao ? 'Atualizar' : 'Adicionar';
        modalConfirm.onclick = () => saveSessao(sessao);
        adminModal.show();
    }

    // ===============================================
    // Função para carregar filmes no select
    // ===============================================
    async function loadFilmesForSelect(selectedFilmeId = null) {
        try {
            const response = await fetch('/api/admin/filmes', { headers: getAuthHeaders() });
            const filmes = await handleResponse(response);

            const selectElement = document.getElementById('sessao-filme');
            selectElement.innerHTML = `
            <option value="">Selecione um filme</option>
            ${filmes.map(filme => `
                <option value="${filme.id_filme}" ${selectedFilmeId == filme.id_filme ? 'selected' : ''}>
                    ${filme.titulo}
                </option>
            `).join('')}
        `;
        } catch (error) {
            console.error('Erro ao carregar filmes:', error);
            const selectElement = document.getElementById('sessao-filme');
            selectElement.innerHTML = '<option value="">Erro ao carregar filmes</option>';
        }
    }

    // ===============================================
    // Função para formatar data/hora para input datetime-local
    // ===============================================
    function formatDateTimeForInput(dateTimeString) {
        const date = new Date(dateTimeString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // ===============================================
    // Função para salvar (adicionar ou editar) uma sessão
    // ===============================================
    async function saveSessao(sessao = null) {
        const isEdit = !!sessao;
        const sessaoId = isEdit ? sessao.id_sessao : null;

        const id_filme = document.getElementById('sessao-filme').value;
        const id_sala = document.getElementById('sessao-sala').value;
        const data_hora = document.getElementById('sessao-data-hora').value;
        const tipo_exibicao = document.getElementById('sessao-tipo-exibicao').value;
        const valor_ingresso = document.getElementById('sessao-valor-ingresso').value;

        if (!id_filme || !id_sala || !data_hora || !tipo_exibicao || !valor_ingresso) {
            showToast('warning', 'Todos os campos são obrigatórios.');
            return;
        }

        // Validar se a data não é no passado
        const selectedDate = new Date(data_hora);
        const now = new Date();
        if (selectedDate < now) {
            showToast('warning', 'A data e hora da sessão não pode ser no passado.');
            return;
        }

        const sessaoData = {
            id_filme: parseInt(id_filme),
            id_sala: parseInt(id_sala),
            data_hora: data_hora,
            tipo_exibicao: tipo_exibicao,
            valor_ingresso: parseFloat(valor_ingresso)
        };

        const url = isEdit ? `/api/admin/sessoes/${sessaoId}` : '/api/admin/sessoes';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(sessaoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro na requisição');
            }

            const data = await response.json();
            adminModal.hide();
            showToast('success', data.message || (isEdit ? 'Sessão atualizada com sucesso!' : 'Sessão adicionada com sucesso!'));
            loadSessoes(); // Recarrega a lista para mostrar as alterações
        } catch (error) {
            console.error('Erro ao salvar sessão:', error);
            showToast('danger', error.message || 'Erro ao salvar sessão.');
        }
    }

    // ===============================================
    // Função para carregar dados da sessão para edição
    // ===============================================
    async function editSessao(id) {
        try {
            const response = await fetch(`/api/admin/sessoes/${id}`, { headers: getAuthHeaders() });
            const sessao = await handleResponse(response);
            showSessaoForm(sessao);
        } catch (error) {
            handleError('Erro ao carregar dados da sessão para edição')(error);
        }
    }

    // ===============================================
    // Função para confirmar exclusão de sessão
    // ===============================================
    function confirmDeleteSessao(id) {
        modalTitle.textContent = 'Confirmar Exclusão';
        modalBody.innerHTML = '<p>Tem certeza de que deseja excluir esta sessão?</p>';
        modalConfirm.textContent = 'Excluir';
        modalConfirm.className = 'btn btn-danger'; // Muda a cor para vermelho
        modalConfirm.onclick = () => deleteSessao(id);
        adminModal.show();
    }

    // ===============================================
    // Função para excluir sessão
    // ===============================================
    async function deleteSessao(id) {
        try {
            const response = await fetch(`/api/admin/sessoes/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro na requisição');
            }

            const data = await response.json();
            adminModal.hide();
            showToast('success', data.message || 'Sessão excluída com sucesso!');
            loadSessoes();
        } catch (error) {
            console.error('Erro ao excluir sessão:', error);
            showToast('danger', error.message || 'Erro ao excluir sessão.');
        }
    }

    function updateActiveLink(sectionId) {
        const sidebarLinks = document.querySelectorAll('.nav-link');
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.getElementById(`${sectionId}-link`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }


    // ==============================================
    // CONTATOS
    // ==============================================

    function loadContatos() {
        dynamicContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <h3>Mensagens de Contato</h3>
            <div class="btn-group">
                <button class="btn btn-outline-secondary filter-contato" data-status="todos">Todos</button>
                <button class="btn btn-outline-primary filter-contato" data-status="pendente">Pendentes</button>
                <button class="btn btn-outline-warning filter-contato" data-status="em_progresso">Em Progresso</button>
                <button class="btn btn-outline-success filter-contato" data-status="resolvido">Resolvidos</button>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Assunto</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="contatos-table">
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

        fetch('/api/admin/contatos', {
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(contatos => {
                renderContatosTable(contatos);

                // Adicionar eventos de filtro
                document.querySelectorAll('.filter-contato').forEach(btn => {
                    btn.addEventListener('click', () => {
                        document.querySelectorAll('.filter-contato').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        filterContatos(contatos, btn.dataset.status);
                    });
                });

                // Ativar filtro "todos" por padrão
                document.querySelector('.filter-contato[data-status="todos"]').classList.add('active');
            })
            .catch(handleError('Erro ao carregar contatos'));
    }

    function renderContatosTable(contatos) {
        const tableBody = document.getElementById('contatos-table');

        if (contatos.length === 0) {
            tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    Nenhuma mensagem recebida
                </td>
            </tr>
        `;
            return;
        }

        tableBody.innerHTML = contatos.map(contato => `
        <tr data-id="${contato.id_contato}" data-status="${contato.status}">
            <td>${new Date(contato.data_envio).toLocaleDateString()}</td>
            <td>${contato.nome}</td>
            <td>${contato.email}</td>
            <td>${contato.assunto}</td>
            <td>
                <span class="badge ${contato.status === 'resolvido' ? 'bg-success' :
                contato.status === 'em_progresso' ? 'bg-warning' : 'bg-secondary'}">
                    ${contato.status === 'resolvido' ? 'Resolvido' :
                contato.status === 'em_progresso' ? 'Em progresso' : 'Pendente'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-contato" data-id="${contato.id_contato}">
                    <i class="bi bi-eye"></i> Ver
                </button>
                <button class="btn btn-sm btn-outline-danger delete-contato" data-id="${contato.id_contato}">
                    <i class="bi bi-trash"></i>
                </button>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-secondary ${contato.status === 'pendente' ? 'active' : ''} set-status" data-status="pendente" data-id="${contato.id_contato}">
                        Pendente
                    </button>
                    <button class="btn btn-sm btn-outline-warning ${contato.status === 'em_progresso' ? 'active' : ''} set-status" data-status="em_progresso" data-id="${contato.id_contato}">
                        Em Progresso
                    </button>
                    <button class="btn btn-sm btn-outline-success ${contato.status === 'resolvido' ? 'active' : ''} set-status" data-status="resolvido" data-id="${contato.id_contato}">
                        Resolvido
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

        // Adicionar eventos
        document.querySelectorAll('.view-contato').forEach(btn => {
            btn.addEventListener('click', () => viewContato(btn.dataset.id));
        });
        document.querySelectorAll('.delete-contato').forEach(btn => {
            btn.addEventListener('click', () => confirmDeleteContato(btn.dataset.id));
        });
        document.querySelectorAll('.set-status').forEach(btn => {
            btn.addEventListener('click', () => updateContatoStatus(btn.dataset.id, btn.dataset.status));
        });
    }

    function filterContatos(contatos, status) {
        const filtered = status === 'todos' ? contatos : contatos.filter(c => c.status === status);
        renderContatosTable(filtered);
    }

    function viewContato(id) {
        fetch(`/api/admin/contatos/${id}`, {
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(contato => {
                modalTitle.textContent = `Mensagem de ${contato.nome}`;
                modalBody.innerHTML = `
            <div class="mb-3">
                <strong>Data:</strong> ${new Date(contato.data_envio).toLocaleString()}
            </div>
            <div class="mb-3">
                <strong>Email:</strong> ${contato.email}
            </div>
            <div class="mb-3">
                <strong>Assunto:</strong> ${contato.assunto}
            </div>
            <div class="mb-3">
                <strong>Mensagem:</strong>
                <div class="border p-3 mt-2">${contato.mensagem}</div>
            </div>
            <div class="mb-3">
                <strong>Status:</strong>
                <span class="badge ${contato.status === 'resolvido' ? 'bg-success' :
                        contato.status === 'em_progresso' ? 'bg-warning' : 'bg-secondary'}">
                    ${contato.status === 'resolvido' ? 'Resolvido' :
                        contato.status === 'em_progresso' ? 'Em progresso' : 'Pendente'}
                </span>
            </div>
        `;
                modalConfirm.style.display = 'none';
                adminModal.show();
            })
            .catch(handleError('Erro ao carregar contato'));
    }

    function confirmDeleteContato(id) {
        modalTitle.textContent = 'Confirmar Exclusão';
        modalBody.innerHTML = `
        <p>Tem certeza que deseja excluir esta mensagem de contato?</p>
        <p class="text-danger">Esta ação não pode ser desfeita.</p>
    `;
        modalConfirm.textContent = 'Excluir';
        modalConfirm.className = 'btn btn-danger';
        modalConfirm.style.display = 'block';
        modalConfirm.onclick = () => deleteContato(id);
        adminModal.show();
    }

    function deleteContato(id) {
        fetch(`/api/admin/contatos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(data => {
                adminModal.hide();
                showToast('success', data.message || 'Mensagem excluída com sucesso!');
                loadContatos();
            })
            .catch(handleError('Erro ao excluir mensagem'));
    }

    function updateContatoStatus(id, status) {
        fetch(`/api/admin/contatos/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ status })
        })
            .then(handleResponse)
            .then(data => {
                showToast('success', data.message || 'Status atualizado com sucesso!');
                loadContatos();
            })
            .catch(handleError('Erro ao atualizar status'));
    }

    // ==============================================
    // ALUGUEIS
    // ==============================================

    async function loadAlugueis() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/admin/alugueis`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`Erro na rede ou servidor: ${response.status} ${response.statusText}`);
            }
            const alugueis = await response.json();
            console.log('Aluguéis carregados:', alugueis);

            let alugueisHtml = `
                <h2 class="mb-4">Gerenciar Solicitações de Aluguel de Sala</h2>
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead>
                            <tr>
                                <th>ID Aluguel</th>
                                <th>Sala</th>
                                <th>Usuário</th>
                                <th>Data Evento</th>
                                <th>Hora Início</th>
                                <th>Finalidade</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (alugueis.length === 0) {
                alugueisHtml += `<tr><td colspan="8" class="text-center">Nenhuma solicitação de aluguel encontrada.</td></tr>`;
            } else {
                alugueis.forEach(aluguel => {
                    alugueisHtml += `
                        <tr>
                            <td>${aluguel.id_aluguel}</td>
                            <td>${aluguel.nome_sala}</td>
                            <td>${aluguel.nome_usuario}</td>
                            <td>${new Date(aluguel.dia_aluguel).toLocaleDateString('pt-BR')}</td>
                            <td>${aluguel.horario_inicio.substring(0, 5)}</td>
                            <td>${aluguel.finalidade || 'N/A'}</td>
                            <td>
                                <span class="badge ${getStatusBadgeClass(aluguel.status_aluguel)}">
                                    ${aluguel.status_aluguel.toUpperCase()}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary view-aluguel-btn" data-id="${aluguel.id_aluguel}">
                                    <i class="bi bi-eye"></i> Visualizar
                                </button>
                                <button class="btn btn-sm btn-outline-danger edit-aluguel-status-btn" data-id="${aluguel.id_aluguel}" data-current-status="${aluguel.status_aluguel}">
                                    <i class="bi bi-pencil-square"></i> Status
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }

            alugueisHtml += `
                        </tbody>
                    </table>
                </div>
            `;
            dynamicContent.innerHTML = alugueisHtml;
            pageTitle.textContent = 'Gerenciar Aluguéis';

            // Adicionar event listeners para os botões de ação (Visualizar e Status)
            dynamicContent.querySelectorAll('.view-aluguel-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const aluguelId = e.currentTarget.dataset.id;
                    viewAluguelDetails(aluguelId, alugueis); // Passa a lista completa para encontrar o aluguel
                });
            });

            dynamicContent.querySelectorAll('.edit-aluguel-status-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const aluguelId = e.currentTarget.dataset.id;
                    const currentStatus = e.currentTarget.dataset.currentStatus;
                    editAluguelStatus(aluguelId, currentStatus);
                });
            });

        } catch (error) {
            handleError('Erro ao carregar aluguéis')(error);
        }
    }

    // Função auxiliar para classes de badge
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'pendente': return 'bg-secondary';
            case 'aprovado': return 'bg-success';
            case 'rejeitado': return 'bg-danger';
            case 'concluido': return 'bg-primary';
            default: return 'bg-info';
        }
    }

    // Função para exibir detalhes do aluguel em um modal
    async function viewAluguelDetails(id) {
        try {
            showLoading();

            // Buscar os detalhes específicos do aluguel na API
            const response = await fetch(`/api/admin/alugueis/${id}`);

            if (!response.ok) {
                throw new Error('Erro ao buscar detalhes do aluguel');
            }

            const aluguel = await response.json();

            modalTitle.textContent = `Detalhes da Solicitação de Aluguel #${aluguel.id_aluguel}`;
            modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Sala:</strong> ${aluguel.sala_nome || aluguel.nome_sala}</p>
                    <p><strong>Usuário:</strong> ${aluguel.usuario_nome || aluguel.nome_usuario}</p>
                    <p><strong>Data do Evento:</strong> ${new Date(aluguel.dia_aluguel).toLocaleDateString('pt-BR')}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Hora de Início:</strong> ${aluguel.horario_inicio.substring(0, 5)}</p>
                    <p><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(aluguel.status_aluguel)}">${aluguel.status_aluguel.toUpperCase()}</span></p>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-12">
                    <p><strong>Finalidade:</strong></p>
                    <p class="text-muted">${aluguel.finalidade || 'Não informada'}</p>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <p><strong>Mensagem Adicional:</strong></p>
                    <p class="text-muted">${aluguel.mensagem || 'Nenhuma mensagem adicional'}</p>
                </div>
            </div>
        `;

            modalConfirm.style.display = 'none';
            adminModal.show();

        } catch (error) {
            console.error('Erro ao carregar detalhes do aluguel:', error);
            mostrarAlerta('danger', 'Erro ao carregar detalhes do aluguel');
        } finally {
            hideLoading();
        }
    }

    // Função para exibir o modal de edição de status do aluguel
    async function editAluguelStatus(id, currentStatus) {
        modalTitle.textContent = `Atualizar Status do Aluguel #${id}`;
        modalBody.innerHTML = `
        <p>Status atual: <span class="badge ${getStatusBadgeClass(currentStatus)}">${currentStatus.toUpperCase()}</span></p>
        <div class="mb-3">
            <label for="newStatus" class="form-label">Novo Status</label>
            <select class="form-select" id="newStatus">
                <option value="pendente" ${currentStatus === 'pendente' ? 'selected' : ''}>Pendente</option>
                <option value="aprovado" ${currentStatus === 'aprovado' ? 'selected' : ''}>Aprovado</option>
                <option value="rejeitado" ${currentStatus === 'rejeitado' ? 'selected' : ''}>Rejeitado</option>
                <option value="concluido" ${currentStatus === 'concluido' ? 'selected' : ''}>Concluído</option>
            </select>
        </div>
        <div id="statusUpdateMessage" class="mt-3 text-center"></div>
    `;

        // Configura o botão padrão do modal (já presente no HTML)
        modalConfirm.style.display = 'inline-block';
        modalConfirm.textContent = 'Atualizar';
        modalConfirm.className = 'btn btn-primary';
        modalConfirm.onclick = async () => {
            const newStatus = document.getElementById('newStatus').value;
            const statusUpdateMessage = document.getElementById('statusUpdateMessage');
            statusUpdateMessage.textContent = '';

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/admin/alugueis/${id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status_aluguel: newStatus })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Falha ao atualizar status.');
                }

                statusUpdateMessage.textContent = result.message;
                statusUpdateMessage.classList.remove('text-danger');
                statusUpdateMessage.classList.add('text-success');

                setTimeout(() => {
                    adminModal.hide();
                    loadAlugueis();
                }, 1000);

            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                statusUpdateMessage.textContent = error.message || 'Erro desconhecido ao atualizar status.';
                statusUpdateMessage.classList.remove('text-success');
                statusUpdateMessage.classList.add('text-danger');
            }
        };

        adminModal.show();
    }

    // ==============================================
    // USUÁRIOS
    // ==============================================

    function loadUsuarios() {
        dynamicContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <h3>Gerenciar Usuários</h3>
            <div class="input-group" style="max-width: 300px;">
                <input type="text" class="form-control" id="search-usuario" placeholder="Buscar usuário...">
                <button class="btn btn-outline-secondary" type="button" id="btn-search-usuario">
                    <i class="bi bi-search"></i>
                </button>
            </div>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Tipo</th>
                        <th>Nível</th>
                        <th>Total Gasto</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="usuarios-table">
                    <tr>
                        <td colspan="7" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

        fetch('/api/admin/usuarios', {
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(usuarios => {
                renderUsuariosTable(usuarios);

                // Adicionar evento de busca
                document.getElementById('btn-search-usuario').addEventListener('click', () => {
                    const termo = document.getElementById('search-usuario').value.toLowerCase();
                    const filtrados = usuarios.filter(u =>
                        u.nome.toLowerCase().includes(termo) ||
                        u.email.toLowerCase().includes(termo) ||
                        u.tipo.toLowerCase().includes(termo)
                    );
                    renderUsuariosTable(filtrados);
                });
            })
            .catch(handleError('Erro ao carregar usuários'));
    }

    function renderUsuariosTable(usuarios) {
        const tableBody = document.getElementById('usuarios-table');

        if (usuarios.length === 0) {
            tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Nenhum usuário encontrado
                </td>
            </tr>
        `;
            return;
        }

        tableBody.innerHTML = usuarios.map(usuario => `
        <tr data-id="${usuario.id_usuario}">
            <td>${usuario.id_usuario}</td>
            <td>${usuario.nome}</td>
            <td>${usuario.email}</td>
            <td>
                <span class="badge ${usuario.tipo === 'admin' ? 'bg-danger' : 'bg-primary'}">
                    ${usuario.tipo === 'admin' ? 'Admin' : 'Comum'}
                </span>
            </td>
            <td>
                <span class="badge ${getNivelBadgeClass(usuario.nivel_fidelidade)}">
                    ${usuario.nivel_fidelidade || 'bronze'}
                </span>
            </td>
            <td>R$ ${(usuario.total_gasto || 0).toFixed(2).replace('.', ',')}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary view-usuario" data-id="${usuario.id_usuario}">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-usuario" data-id="${usuario.id_usuario}" ${usuario.tipo === 'admin' ? 'disabled' : ''}>
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

        // Adicionar eventos
        document.querySelectorAll('.view-usuario').forEach(btn => {
            btn.addEventListener('click', () => viewUsuario(btn.dataset.id));
        });
        document.querySelectorAll('.delete-usuario').forEach(btn => {
            if (!btn.disabled) {
                btn.addEventListener('click', () => confirmDeleteUsuario(btn.dataset.id));
            }
        });
    }

    function getNivelBadgeClass(nivel) {
        switch (nivel) {
            case 'bronze': return 'bg-brown';
            case 'prata': return 'bg-secondary';
            case 'ouro': return 'bg-warning';
            case 'diamante': return 'bg-info';
            default: return 'bg-brown';
        }
    }

    function viewUsuario(id) {
        fetch(`/api/admin/usuarios/${id}`, {
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(usuario => {
                modalTitle.textContent = `Detalhes do Usuário: ${usuario.nome}`;
                modalBody.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Nome:</strong> ${usuario.nome}
                </div>
                <div class="col-md-6">
                    <strong>Email:</strong> ${usuario.email}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-4">
                    <strong>Tipo:</strong>
                    <span class="badge ${usuario.tipo === 'admin' ? 'bg-danger' : 'bg-primary'}">
                        ${usuario.tipo === 'admin' ? 'Admin' : 'Comum'}
                    </span>
                </div>
                <div class="col-md-4">
                    <strong>Nível Fidelidade:</strong>
                    <span class="badge ${getNivelBadgeClass(usuario.nivel_fidelidade)}">
                        ${usuario.nivel_fidelidade || 'bronze'}
                    </span>
                </div>
                <div class="col-md-4">
                    <strong>Pontos:</strong> ${usuario.pontos_fidelidade || 0}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Total Gasto:</strong> R$ ${(usuario.total_gasto || 0).toFixed(2).replace('.', ',')}
                </div>
                <div class="col-md-6">
                    <strong>Data Cadastro:</strong> ${new Date(usuario.data_cadastro).toLocaleDateString()}
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header">
                    <h5>Histórico de Compras</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Data</th>
                                    <th>Valor</th>
                                    <th>Itens</th>
                                </tr>
                            </thead>
                            <tbody id="usuario-compras">
                                <tr>
                                    <td colspan="4" class="text-center">
                                        <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Carregando...</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
                modalConfirm.style.display = 'none';
                adminModal.show();

                // Carregar histórico de compras
                fetch(`/api/admin/usuarios/${id}/compras`, {
                    headers: getAuthHeaders()
                })
                    .then(handleResponse)
                    .then(compras => {
                        const comprasTable = document.getElementById('usuario-compras');
                        comprasTable.innerHTML = compras.map(compra => `
                <tr>
                    <td>${compra.id_compra}</td>
                    <td>${new Date(compra.data_compra).toLocaleDateString()}</td>
                    <td>R$ ${Number(compra.valor_total).toFixed(2).replace('.', ',')}</td>
                    <td>${compra.items.length} itens</td>
                </tr>
            `).join('') || `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        Nenhuma compra registrada
                    </td>
                </tr>
            `;
                    })
                    .catch(handleError('Erro ao carregar compras'));
            })
            .catch(handleError('Erro ao carregar usuário'));
    }

    function confirmDeleteUsuario(id) {
        modalTitle.textContent = 'Confirmar Exclusão';
        modalBody.innerHTML = `
        <p>Tem certeza que deseja excluir este usuário?</p>
        <p class="text-danger">Esta ação não pode ser desfeita e excluirá todos os dados associados ao usuário.</p>
    `;
        modalConfirm.textContent = 'Excluir';
        modalConfirm.className = 'btn btn-danger';
        modalConfirm.style.display = 'block';
        modalConfirm.onclick = () => deleteUsuario(id);
        adminModal.show();
    }

    function deleteUsuario(id) {
        fetch(`/api/admin/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(data => {
                adminModal.hide();
                showToast('success', data.message || 'Usuário excluído com sucesso!');
                loadUsuarios();
            })
            .catch(handleError('Erro ao excluir usuário'));
    }

    function loadCompras() {
        dynamicContent.innerHTML = `
        <div class="d-flex justify-content-between mb-3">
            <h3>Histórico de Compras</h3>
        </div>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Data</th>
                        <th>Usuário</th>
                        <th>Valor</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="compras-table">
                    <tr>
                        <td colspan="6" class="text-center">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Carregando...</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

        fetch('/api/purchases', {
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(compras => {
                const tableBody = document.getElementById('compras-table');

                if (compras.length === 0) {
                    tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        Nenhuma compra registrada
                    </td>
                </tr>
            `;
                    return;
                }

                tableBody.innerHTML = compras.map(compra => `
            <tr>
                <td>${compra.id_compra}</td>
                <td>${new Date(compra.data_compra).toLocaleDateString()}</td>
                <td>${compra.id_usuario}</td>
                <td>R$ ${Number(compra.valor_total).toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-compra" data-id="${compra.id_compra}">
                        <i class="bi bi-eye"></i> Detalhes
                    </button>
                </td>
            </tr>
        `).join('');

                // Adicionar eventos
                document.querySelectorAll('.view-compra').forEach(btn => {
                    btn.addEventListener('click', () => viewCompra(btn.dataset.id));
                });
            })
            .catch(handleError('Erro ao carregar compras'));
    }

    function viewCompra(id) {
        fetch(`/api/purchases/${id}`, {
            headers: getAuthHeaders()
        })
            .then(handleResponse)
            .then(compra => {
                modalTitle.textContent = `Detalhes da Compra #${compra.id_compra}`;
                modalBody.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>Data:</strong> ${new Date(compra.data_compra).toLocaleString()}
                </div>
                <div class="col-md-6">
                    <strong>Valor Total:</strong> R$ ${Number(compra.valor_total).toFixed(2).replace('.', ',')}
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header">
                    <h5>Itens da Compra</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Item</th>
                                    <th>Quantidade</th>
                                    <th>Preço Unitário</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${compra.items.map(item => `
                                    <tr>
                                        <td>${item.tipo_item}</td>
                                        <td>${item.nome_item || 'N/A'}</td>
                                        <td>${item.quantidade}</td>
                                        <td>R$ ${Number(item.preco_unitario).toFixed(2).replace('.', ',')}</td>
                                        <td>R$ ${Number(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
                modalConfirm.style.display = 'none';
                adminModal.show();
            })
            .catch(handleError('Erro ao carregar detalhes da compra'));
    }

    // As outras funções (loadSnacks, loadParcerias, etc.) seguem o mesmo padrão
    // Implemente conforme necessário seguindo a mesma estrutura
});