document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    const userNav = document.getElementById('user-nav');
    const contentLogged = document.getElementById('content-logged');
    const contentNotLogged = document.getElementById('content-not-logged');

    const authHeaders = () => ({
        'x-user-id': localStorage.getItem('userId'),
        'x-user-type': localStorage.getItem('userType') || 'comum'
    })

    // Verifica autenticação
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');

    // Função para carregar e exibir as parcerias detalhadas
    async function carregarParceriasDetalhadas() {
        const container = document.getElementById('lista-parcerias-detalhadas');
        if (!container) return;

        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>
        `;

        try {
            const response = await fetch(`${API_BASE_URL}/parcerias`, {
                headers: authHeaders() 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const parcerias = await response.json();
            const container = document.getElementById('lista-parcerias-detalhadas');

            if (!container) {
                console.error("Elemento '#lista-parcerias-detalhadas' não encontrado.");
                return;
            }

            if (parcerias.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center text-muted">
                        <div class="empty-state-card">
                            <i class="bi bi-building display-1 text-danger mb-4"></i>
                            <h3 class="text-white mb-3">Nenhuma parceria disponível</h3>
                            <p class="text-light">Estamos trabalhando para trazer novas parcerias incríveis para você!</p>
                        </div>
                    </div>
                `;
                return;
            }

            container.innerHTML = parcerias.map((parceria, index) => `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="partnership-card h-100 shadow-lg" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="partnership-image-container">
                            <div class="partnership-overlay">
                                <div class="partnership-badges">
                                    <span class="badge bg-danger partnership-badge">
                                        <i class="bi bi-handshake me-1"></i>Parceiro
                                    </span>
                                </div>
                            </div>
                            <img src="${parceria.logo_url || '/assets/img/placeholder-partner.png'}" 
                                 class="partnership-image" 
                                 alt="${parceria.nome}"
                                 onerror="this.src='/assets/img/placeholder-partner.png'">
                            <div class="partnership-gradient"></div>
                        </div>
                        <div class="partnership-body">
                            <div class="partnership-header">
                                <h5 class="partnership-title">
                                    <i class="bi bi-building text-danger me-2"></i>
                                    ${parceria.nome}
                                </h5>
                                <div class="partnership-status">
                                    <span class="status-dot active"></span>
                                    <span class="status-text">Ativo</span>
                                </div>
                            </div>
                            
                            <p class="partnership-description">
                                ${parceria.descricao || 'Uma parceria estratégica que oferece benefícios exclusivos para nossos clientes.'}
                            </p>
                            
                            <div class="partnership-details">
                                <div class="detail-item">
                                    <i class="bi bi-telephone text-warning"></i>
                                    <span>${parceria.contato || 'Contato via site'}</span>
                                </div>
                                <div class="detail-item mt-2">
                                    <i class="bi bi-globe text-info"></i>
                                    <span>Site oficial disponível</span>
                                </div>
                            </div>
                            
                            <div class="partnership-benefits mt-3">
                                <h6 class="benefits-title">
                                    <i class="bi bi-gift text-success me-2"></i>Benefícios
                                </h6>
                                <div class="benefits-list">
                                    <span class="benefit-item">
                                        <i class="bi bi-check2 text-success"></i>Descontos exclusivos
                                    </span>
                                    <span class="benefit-item">
                                        <i class="bi bi-check2 text-success"></i>Acesso prioritário
                                    </span>
                                    <span class="benefit-item">
                                        <i class="bi bi-check2 text-success"></i>Ofertas especiais
                                    </span>
                                </div>
                            </div>
                            
                            <div class="partnership-actions mt-4">
                                <a href="${parceria.site_url || '#'}"
                                   class="btn partnership-btn-primary"
                                   target="_blank"
                                   ${!parceria.site_url ? 'onclick="return false;" style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                                    <i class="bi bi-box-arrow-up-right me-2"></i>
                                    Visitar Site
                                </a>
                                <button class="btn partnership-btn-secondary ms-2" 
                                        onclick="showPartnershipDetails('${parceria.nome}', '${parceria.descricao}')">
                                    <i class="bi bi-info-circle me-2"></i>
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Adiciona animações aos cards após carregamento
            setTimeout(() => {
                document.querySelectorAll('.partnership-card').forEach(card => {
                    card.classList.add('loaded');
                });
            }, 100);

        } catch (error) {
            console.error('Erro ao carregar parcerias:', error);
            const container = document.getElementById('lista-parcerias-detalhadas');
            if (container) {
                container.innerHTML = `
                    <div class="col-12">
                        <div class="error-state-card text-center">
                            <i class="bi bi-exclamation-triangle display-1 text-warning mb-4"></i>
                            <h3 class="text-white mb-3">Erro ao carregar parcerias</h3>
                            <p class="text-light mb-4">Tivemos um problema ao carregar as informações. Tente novamente.</p>
                            <button onclick="location.reload()" class="btn btn-danger btn-lg">
                                <i class="bi bi-arrow-clockwise me-2"></i>Recarregar Página
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Função para mostrar detalhes da parceria em modal
    window.showPartnershipDetails = function(nome, descricao) {
        // Criar e mostrar modal com detalhes
        const modalHtml = `
            <div class="modal fade" id="partnershipModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content bg-dark border-danger">
                        <div class="modal-header border-danger">
                            <h5 class="modal-title text-white">
                                <i class="bi bi-building text-danger me-2"></i>
                                ${nome}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-white">
                            <p>${descricao}</p>
                            <div class="partnership-modal-benefits mt-4">
                                <h6 class="text-danger">Benefícios desta parceria:</h6>
                                <ul class="list-unstyled">
                                    <li><i class="bi bi-check2 text-success me-2"></i>Descontos especiais em produtos e serviços</li>
                                    <li><i class="bi bi-check2 text-success me-2"></i>Acesso prioritário a eventos e lançamentos</li>
                                    <li><i class="bi bi-check2 text-success me-2"></i>Promoções exclusivas para clientes CineVille</li>
                                    <li><i class="bi bi-check2 text-success me-2"></i>Atendimento diferenciado</li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer border-danger">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove modal existente se houver
        const existingModal = document.getElementById('partnershipModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Adiciona novo modal
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Mostra o modal
        const modal = new bootstrap.Modal(document.getElementById('partnershipModal'));
        modal.show();
        
        // Remove modal do DOM quando fechado
        document.getElementById('partnershipModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    };

    // Sempre tenta carregar as parcerias detalhadas ao carregar a página
    carregarParceriasDetalhadas();
});