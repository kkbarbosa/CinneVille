document.addEventListener('DOMContentLoaded', () => {
  const API = 'http://localhost:5000/api';
  const candidatosRow = document.getElementById('candidatosRow');
  const resultadoLista = document.getElementById('resultadoLista');
  const alertArea = document.getElementById('alertArea');
  const votingThemeTitle = document.getElementById('votingThemeTitle');

  let currentVotingId = null;
  let hasVoted = false;
  let votedMovieId = null;
  let totalVotes = 0;

  const authHeaders = () => ({
    'x-user-id': localStorage.getItem('userId'),
    'x-user-type': localStorage.getItem('tipo') || 'comum'
  });

  // Função para salvar estado do voto
  function saveVoteState() {
    if (hasVoted && votedMovieId && currentVotingId) {
      const voteData = {
        votingId: currentVotingId,
        movieId: votedMovieId,
        hasVoted: true,
        timestamp: Date.now()
      };
      localStorage.setItem('voteState', JSON.stringify(voteData));
    }
  }

  // Função para carregar estado do voto
  function loadVoteState() {
    try {
      const voteData = localStorage.getItem('voteState');
      if (voteData) {
        const parsed = JSON.parse(voteData);
        // Verifica se é da mesma votação
        if (parsed.votingId === currentVotingId) {
          hasVoted = parsed.hasVoted;
          votedMovieId = parsed.movieId;
        }
      }
    } catch (error) {
      console.log('Erro ao carregar estado do voto:', error);
    }
  }

  // Cinema-themed loading animations
  function showCinemaLoading(container, message = 'Carregando...') {
    container.innerHTML = `
      <div class="cinema-loading-wrapper">
        <div class="film-projector">
          <div class="projector-body">
            <div class="projector-lens"></div>
            <div class="film-strip-loader">
              <div class="film-hole"></div>
              <div class="film-hole"></div>
              <div class="film-hole"></div>
            </div>
          </div>
          <div class="projector-beam"></div>
        </div>
        <h4 class="loading-message">${message}</h4>
        <div class="cinema-dots">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
  }

  // Enhanced alert system with cinema theme
  function mostrarAlerta(type, msg, duration = 5000) {
    // Remove existing alerts
    const existingAlerts = alertArea.querySelectorAll('.cinema-voting-alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertElement = document.createElement('div');
    alertElement.className = `cinema-voting-alert alert-${type}`;
    
    const icons = {
      success: 'check-circle-fill',
      warning: 'exclamation-triangle-fill',
      danger: 'x-circle-fill',
      info: 'info-circle-fill'
    };

    const colors = {
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8'
    };

    alertElement.innerHTML = `
      <div class="alert-inner">
        <div class="alert-icon" style="color: ${colors[type]}">
          <i class="bi bi-${icons[type]}"></i>
        </div>
        <div class="alert-content">
          <div class="alert-message">${msg}</div>
          <div class="alert-progress"></div>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;

    alertArea.appendChild(alertElement);

    // Auto-remove with progress bar
    const progressBar = alertElement.querySelector('.alert-progress');
    progressBar.style.animationDuration = `${duration}ms`;
    
    setTimeout(() => {
      if (alertElement.parentElement) {
        alertElement.classList.add('fade-out');
        setTimeout(() => alertElement.remove(), 500);
      }
    }, duration);

    // Add entrance animation
    setTimeout(() => alertElement.classList.add('show'), 10);
  }

  // Enhanced movie card creation with cinema effects (sem estrelas)
  function createMovieCard(filme, index) {
    const isVoted = hasVoted && votedMovieId === filme.id_filme;
    const cardClass = isVoted ? 'movie-vote-card voted-card' : 'movie-vote-card';
    
    return `
      <div class="col" data-movie-index="${index}">
        <div class="${cardClass}" data-movie-id="${filme.id_filme}">
          <div class="movie-poster-container">
            <div class="poster-overlay"></div>
            <div class="voting-badges">
              <span class="candidate-badge">CANDIDATO</span>
              ${isVoted ? '<span class="voted-badge"><i class="bi bi-check-circle"></i> SEU VOTO</span>' : ''}
            </div>
            <img src="${filme.poster_url || '/assets/img/placeholder.jpg'}" 
                 class="movie-poster" 
                 alt="${filme.titulo}"
                 loading="lazy">
            <div class="movie-info-overlay">
              <h5 class="movie-title">${filme.titulo}</h5>
              <p class="movie-meta">
                <i class="bi bi-tag-fill"></i> ${filme.genero || 'N/A'}
                ${filme.data_lancamento ? ` • <i class="bi bi-calendar"></i> ${filme.data_lancamento.split('-')[0]}` : ''}
              </p>
            </div>
          </div>
          <div class="movie-card-body">
            <div class="movie-description">
              <p class="movie-synopsis">${filme.sinopse || 'Uma experiência cinematográfica única aguarda você.'}</p>
            </div>
            <div class="vote-section">
              <div class="vote-stats" id="vote-stats-${filme.id_filme}">
                <div class="vote-bar">
                  <div class="vote-progress" style="width: 0%"></div>
                </div>
              </div>
              <button class="btn vote-btn ${isVoted ? 'btn-voted' : ''}" 
                      data-filme-id="${filme.id_filme}"
                      ${hasVoted ? 'disabled' : ''}>
                <div class="btn-content">
                  <i class="bi bi-${isVoted ? 'check-circle' : 'heart'}"></i>
                  <span>${isVoted ? 'Votado!' : 'Votar'}</span>
                </div>
                <div class="btn-glow"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Enhanced results display with cinema ranking
  function createRankingItem(item, position) {
    const percentage = totalVotes > 0 ? Math.round((item.votos / totalVotes) * 100) : 0;
    
    const rankingClasses = {
      1: 'ranking-first',
      2: 'ranking-second', 
      3: 'ranking-third'
    };

    const rankingIcons = {
      1: 'trophy-fill',
      2: 'award-fill',
      3: 'award-fill'
    };

    const trophyColors = {
      1: '#ffd700',
      2: '#c0c0c0',
      3: '#cd7f32'
    };

    return `
      <li class="ranking-item ${rankingClasses[position] || 'ranking-other'}" 
          data-position="${position}" 
          style="animation-delay: ${position * 100}ms">
        <div class="ranking-content">
          <div class="ranking-position">
            <div class="position-icon" style="color: ${trophyColors[position] || '#e50914'}">
              <i class="bi bi-${rankingIcons[position] || 'circle-fill'}"></i>
            </div>
            <span class="position-number">${position}º</span>
          </div>
          <div class="movie-details">
            <h6 class="movie-name">${item.titulo}</h6>
            <div class="movie-stats">
              <span class="vote-count">${item.votos} votos</span>
              <span class="vote-percentage">${percentage}% do total</span>
            </div>
            <div class="popularity-bar">
              <div class="popularity-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
          <div class="ranking-badge">
            ${position <= 3 ? '<i class="bi bi-fire"></i>' : ''}
          </div>
        </div>
      </li>
    `;
  }

  // Load voting theme with cinema entrance (sem timeout)
  async function carregarTemaVotacao() {
    try {
      // Chama a rota pública do tema da votação
      const r = await fetch(`${API}/votacao/tema`);
      const data = await r.json();

      if (data.id_votacao) {
        currentVotingId = data.id_votacao;
        votingThemeTitle.textContent = data.tema_votacao || 'Votação do Mês';
        
        // Carrega estado do voto após obter o ID da votação
        loadVoteState();
        
        // Carrega os candidatos e resultados
        carregarCandidatos();
        carregarResultado();
      } else {
        votingThemeTitle.textContent = 'Nenhuma votação ativa no momento.';
        candidatosRow.innerHTML = '<p class="text-center col-12 text-muted">Aguarde a próxima votação!</p>';
        resultadoLista.innerHTML = '<li class="list-group-item bg-dark text-white">Nenhum resultado disponível.</li>';
      }
    } catch (err) {
      console.error('Erro ao carregar tema da votação:', err);
      votingThemeTitle.textContent = 'Erro ao carregar tema da votação.';
      mostrarAlerta('danger', 'Erro ao carregar a votação. Tente novamente mais tarde.');
    }
  }

  // Load candidates with staggered animation (sem timeout demorado)
  async function carregarCandidatos() {
    showCinemaLoading(candidatosRow, 'Preparando os filmes candidatos...');

    if (!currentVotingId) {
      candidatosRow.innerHTML = `
        <div class="col-12">
          <div class="no-candidates-message">
            <i class="bi bi-camera-reels"></i>
            <p>Nenhum filme disponível para votação.</p>
          </div>
        </div>
      `;
      return;
    }

    try {
      const r = await fetch(`${API}/votacao/${currentVotingId}/filmes`);
      const filmes = await r.json();

      // Reduzido o timeout de 2000ms para 500ms
      setTimeout(() => {
        if (!filmes.length) {
          candidatosRow.innerHTML = `
            <div class="col-12">
              <div class="empty-candidates">
                <i class="bi bi-camera-reels display-1"></i>
                <h4>Nenhum filme em votação</h4>
                <p>Os filmes candidatos serão adicionados em breve!</p>
              </div>
            </div>
          `;
          return;
        }

        candidatosRow.innerHTML = filmes.map((filme, index) => 
          createMovieCard(filme, index)
        ).join('');

        // Staggered entrance animation (mais rápida)
        const movieCards = candidatosRow.querySelectorAll('.movie-vote-card');
        movieCards.forEach((card, index) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(50px) rotateX(10deg)';
          
          setTimeout(() => {
            card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) rotateX(0)';
            card.classList.add('card-revealed');
          }, index * 100); // Reduzido de 200ms para 100ms
        });

        // Add voting event listeners
        document.querySelectorAll('.vote-btn').forEach(btn => {
          if (!btn.disabled) {
            btn.addEventListener('click', (e) => {
              const filmeId = parseInt(e.currentTarget.dataset.filmeId);
              votar(filmeId);
            });
          }
        });

        // Add hover effects
        movieCards.forEach(card => {
          card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('voted-card')) {
              card.querySelector('.poster-overlay').style.opacity = '1';
            }
          });
          
          card.addEventListener('mouseleave', () => {
            card.querySelector('.poster-overlay').style.opacity = '0';
          });
        });

      }, 500); // Reduzido de 2000ms para 500ms

    } catch (err) {
      console.error('Erro ao carregar candidatos:', err);
      candidatosRow.innerHTML = `
        <div class="col-12">
          <div class="error-loading">
            <i class="bi bi-exclamation-triangle"></i>
            <h4>Erro ao carregar filmes</h4>
            <p>Tente recarregar a página</p>
          </div>
        </div>
      `;
      mostrarAlerta('danger', 'Erro ao carregar os filmes. Tente novamente mais tarde.');
    }
  }

  // Enhanced voting function with cinematic feedback
  async function votar(filmeId) {
    if (!localStorage.getItem('userId')) {
      mostrarAlerta('warning', 'Você precisa estar logado para votar. Faça login e participe!');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    if (hasVoted) {
      mostrarAlerta('info', 'Você já participou desta votação! Obrigado pela participação.');
      return;
    }

    if (!currentVotingId) {
      mostrarAlerta('danger', 'Nenhuma votação ativa para votar.');
      return;
    }

    // Show voting animation
    const votingCard = document.querySelector(`[data-movie-id="${filmeId}"]`);
    const voteBtn = votingCard.querySelector('.vote-btn');
    
    // Disable button and show loading
    voteBtn.disabled = true;
    voteBtn.innerHTML = `
      <div class="btn-content">
        <div class="voting-spinner"></div>
        <span>Votando...</span>
      </div>
    `;

    try {
      const r = await fetch(`${API}/votacao/votar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ id_votacao: currentVotingId, id_filme: filmeId })
      });
      const data = await r.json();

      if (r.ok) {
        // Success animation
        hasVoted = true;
        votedMovieId = filmeId;
        
        // Salva o estado do voto
        saveVoteState();
        
        // Update voted card
        votingCard.classList.add('voted-card');
        votingCard.querySelector('.voting-badges').innerHTML += `
          <span class="voted-badge animate-in">
            <i class="bi bi-check-circle"></i> SEU VOTO
          </span>
        `;

        voteBtn.classList.add('btn-voted');
        voteBtn.innerHTML = `
          <div class="btn-content">
            <i class="bi bi-check-circle"></i>
            <span>Votado!</span>
          </div>
          <div class="success-particles"></div>
        `;

        // Disable all other buttons
        document.querySelectorAll('.vote-btn').forEach(btn => {
          if (btn !== voteBtn) {
            btn.disabled = true;
            btn.classList.add('btn-disabled');
            btn.innerHTML = `
              <div class="btn-content">
                <i class="bi bi-lock"></i>
                <span>Votação Encerrada</span>
              </div>
            `;
          }
        });

        // Show success message
        mostrarAlerta('success', data.message || 'Voto registrado com sucesso! Obrigado pela participação.');
        
        // Update results
        setTimeout(() => {
          carregarResultado();
        }, 1000);

        // Confetti effect
        createConfettiEffect();
        
      } else {
        // Reset button on error
        voteBtn.disabled = false;
        voteBtn.innerHTML = `
          <div class="btn-content">
            <i class="bi bi-heart"></i>
            <span>Votar</span>
          </div>
        `;
        mostrarAlerta('warning', data.message || 'Erro ao votar. Você já votou nesta votação ou houve um problema.');
      }
    } catch (err) {
      console.error('Erro na requisição de voto:', err);
      voteBtn.disabled = false;
      voteBtn.innerHTML = `
        <div class="btn-content">
          <i class="bi bi-heart"></i>
          <span>Votar</span>
        </div>
      `;
      mostrarAlerta('danger', 'Falha na conexão. Verifique sua internet e tente novamente.');
    }
  }

  // Enhanced results loading with real-time updates (timeout reduzido)
  async function carregarResultado() {
    const loadingHTML = `
      <li class="ranking-loading">
        <div class="ranking-loader">
          <div class="film-counter">
            <div class="counter-reel"></div>
            <span>Contando votos...</span>
          </div>
        </div>
      </li>
    `;
    
    resultadoLista.innerHTML = loadingHTML;

    if (!currentVotingId) {
      resultadoLista.innerHTML = `
        <li class="no-results">
          <div class="empty-results">
            <i class="bi bi-bar-chart"></i>
            <span>Nenhum resultado disponível.</span>
          </div>
        </li>
      `;
      return;
    }

    try {
      const r = await fetch(`${API}/votacao/resultado/${currentVotingId}`, { headers: authHeaders() });
      const rows = await r.json();

      // Reduzido o timeout de 1500ms para 300ms
      setTimeout(() => {
        if (!rows.length) {
          resultadoLista.innerHTML = `
            <li class="no-votes">
              <div class="waiting-votes">
                <i class="bi bi-hourglass-split"></i>
                <span>Aguardando os primeiros votos...</span>
              </div>
            </li>
          `;
          return;
        }

        // Calculate total votes
        totalVotes = rows.reduce((sum, item) => sum + item.votos, 0);

        // Create ranking with animations
        resultadoLista.innerHTML = rows
          .map((item, index) => createRankingItem(item, index + 1))
          .join('');

        // Animate ranking items
        setTimeout(() => {
          const rankingItems = resultadoLista.querySelectorAll('.ranking-item');
          rankingItems.forEach(item => {
            item.classList.add('item-revealed');
          });
        }, 100);

        // Update vote stats in movie cards
        rows.forEach(item => {
          const statsElement = document.getElementById(`vote-stats-${item.id_filme}`);
          if (statsElement) {
            const percentage = Math.round((item.votos / totalVotes) * 100);
            const voteCountElement = statsElement.querySelector('.vote-count');
            const voteProgressElement = statsElement.querySelector('.vote-progress');
            
            if (voteCountElement) {
              voteCountElement.textContent = `${item.votos} votos`;
            }
            if (voteProgressElement) {
              voteProgressElement.style.width = `${percentage}%`;
            }
          }
        });

      }, 300); // Reduzido de 1500ms para 300ms

    } catch (err) {
      console.error('Erro ao carregar resultados:', err);
      resultadoLista.innerHTML = `
        <li class="error-results">
          <div class="results-error">
            <i class="bi bi-exclamation-triangle"></i>
            <span>Erro ao carregar resultados.</span>
          </div>
        </li>
      `;
      mostrarAlerta('danger', 'Erro ao carregar a parcial de votos.');
    }
  }

  // Confetti effect for successful vote
  function createConfettiEffect() {
    const colors = ['#e50914', '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'];
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer);
      }
    }, 5000);
  }

  // Initialize (removido timeout desnecessário)
  carregarTemaVotacao();

  // Add dynamic styles for enhanced cinema experience
  const cinematicStyles = document.createElement('style');
  cinematicStyles.textContent = `
    .cinema-loading-wrapper {
      text-align: center;
      padding: 60px 20px;
      color: white;
    }

    .film-projector {
      position: relative;
      display: inline-block;
      margin-bottom: 30px;
    }

    .projector-body {
      width: 80px;
      height: 50px;
      background: linear-gradient(135deg, #2c2c2c, #4a4a4a);
      border-radius: 10px;
      position: relative;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }

    .projector-lens {
      position: absolute;
      right: -10px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, #fff, #ddd);
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(229,9,20,0.8);
      animation: lensGlow 2s ease-in-out infinite alternate;
    }

    .film-strip-loader {
      position: absolute;
      top: -15px;
      left: 10px;
      display: flex;
      gap: 5px;
    }

    .film-hole {
      width: 8px;
      height: 8px;
      background: #000;
      border-radius: 50%;
      animation: filmMove 1s linear infinite;
    }

    .film-hole:nth-child(2) { animation-delay: 0.3s; }
    .film-hole:nth-child(3) { animation-delay: 0.6s; }

    .projector-beam {
      position: absolute;
      top: 50%;
      right: -20px;
      width: 0;
      height: 0;
      border-left: 30px solid rgba(255,255,255,0.4);
      border-top: 15px solid transparent;
      border-bottom: 15px solid transparent;
      transform: translateY(-50%);
      animation: beamFlicker 2s ease-in-out infinite;
    }

    .loading-message {
      color: #e50914;
      font-weight: bold;
      margin-bottom: 20px;
      animation: pulse 2s infinite;
    }

    .cinema-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .cinema-dots span {
      width: 12px;
      height: 12px;
      background: #e50914;
      border-radius: 50%;
      animation: dotWave 1.5s ease-in-out infinite;
    }

    .cinema-dots span:nth-child(1) { animation-delay: 0s; }
    .cinema-dots span:nth-child(2) { animation-delay: 0.2s; }
    .cinema-dots span:nth-child(3) { animation-delay: 0.4s; }
    .cinema-dots span:nth-child(4) { animation-delay: 0.6s; }

    .cinema-voting-alert {
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border: 2px solid #e50914;
      border-radius: 15px;
      padding: 0;
      margin-bottom: 20px;
      opacity: 0;
      transform: translateY(-20px) scale(0.9);
      transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      overflow: hidden;
      position: relative;
    }

    .cinema-voting-alert.show {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .cinema-voting-alert.fade-out {
      opacity: 0;
      transform: translateY(-20px) scale(0.9);
    }

    .alert-inner {
      display: flex;
      align-items: center;
      padding: 20px;
      position: relative;
      z-index: 2;
    }

    .alert-icon {
      font-size: 1.5rem;
      margin-right: 15px;
      animation: iconPulse 2s ease-in-out infinite;
    }

    .alert-content {
      flex: 1;
    }

    .alert-message {
      color: white;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .alert-progress {
      height: 3px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    }

    .alert-progress::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background: #e50914;
      transform: translateX(-100%);
      animation: progressShrink linear;
    }

    .alert-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .alert-close:hover {
      background: rgba(255,255,255,0.1);
      transform: rotate(90deg);
    }

    .movie-vote-card {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      border: 2px solid rgba(229,9,20,0.3);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      height: 100%;
    }

    .movie-vote-card:hover {
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 25px 50px rgba(229,9,20,0.4);
      border-color: #e50914;
    }

    .movie-vote-card.voted-card {
      border-color: #28a745;
      box-shadow: 0 15px 35px rgba(40,167,69,0.3);
    }

    .movie-vote-card.voted-card:hover {
      box-shadow: 0 20px 40px rgba(40,167,69,0.4);
    }

    .movie-poster-container {
      position: relative;
      height: 600px;
      overflow: hidden;
    }

    .poster-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(229,9,20,0.3), rgba(229,9,20,0.1));
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 2;
    }

    .voting-badges {
      position: absolute;
      top: 15px;
      left: 15px;
      z-index: 3;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .candidate-badge {
      background: linear-gradient(135deg, #e50914, #b8070f);
      color: white;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
      text-transform: uppercase;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    }

    .voted-badge {
      background: linear-gradient(135deg, #28a745, #1e7e34);
      color: white;
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    }

    .voted-badge.animate-in {
      animation: badgeSlideIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .movie-poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .movie-vote-card:hover .movie-poster {
      transform: scale(1.1);
    }

    .movie-info-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
      color: white;
      padding: 20px;
      z-index: 3;
    }

    .movie-title {
      font-size: 1.3rem;
      font-weight: bold;
      margin-bottom: 8px;
      color: white;
    }

    .movie-meta {
      font-size: 0.9rem;
      color: #ccc;
      margin-bottom: 10px;
    }

    .movie-meta i {
      margin-right: 5px;
      color: #e50914;
    }

    .movie-card-body {
      padding: 25px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .movie-synopsis {
      color: #ccc;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 20px;
      flex-grow: 1;
    }

    .vote-section {
      margin-top: auto;
    }

    .vote-stats {
      margin-bottom: 15px;
      text-align: center;
    }

    .vote-count {
      color: #e50914;
      font-weight: bold;
      font-size: 0.9rem;
    }

    .vote-bar {
      background: rgba(255,255,255,0.1);
      height: 6px;
      border-radius: 3px;
      margin-top: 8px;
      overflow: hidden;
    }

    .vote-progress {
      height: 100%;
      background: linear-gradient(90deg, #e50914, #ff6b6b);
      border-radius: 3px;
      transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 10px rgba(229,9,20,0.5);
    }

    .vote-btn {
      width: 100%;
      background: linear-gradient(135deg, #e50914, #b8070f);
      border: none;
      border-radius: 25px;
      padding: 15px 25px;
      color: white;
      font-weight: bold;
      font-size: 1rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }

    .vote-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(229,9,20,0.4);
    }

    .vote-btn:active:not(:disabled) {
      transform: translateY(-1px);
    }

    .vote-btn.btn-voted {
      background: linear-gradient(135deg, #28a745, #1e7e34);
      cursor: default;
    }

    .vote-btn.btn-voted:hover {
      transform: none;
      box-shadow: 0 8px 25px rgba(40,167,69,0.3);
    }

    .vote-btn.btn-disabled {
      background: linear-gradient(135deg, #6c757d, #545b62);
      cursor: not-allowed;
      opacity: 0.7;
    }

    .vote-btn.btn-disabled:hover {
      transform: none;
      box-shadow: none;
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      position: relative;
      z-index: 2;
    }

    .btn-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.6s ease;
    }

    .vote-btn:hover .btn-glow {
      left: 100%;
    }

    .voting-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .success-particles {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    .success-particles::after {
      content: '✨';
      position: absolute;
      animation: particleFloat 2s ease-out;
    }

    .ranking-item {
      background: linear-gradient(135deg, rgba(229,9,20,0.1), rgba(229,9,20,0.05));
      border: 1px solid rgba(229,9,20,0.2);
      border-radius: 15px;
      padding: 20px;
      margin-bottom: 15px;
      opacity: 0;
      transform: translateX(-50px);
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ranking-item.item-revealed {
      opacity: 1;
      transform: translateX(0);
    }

    .ranking-item:hover {
      background: linear-gradient(135deg, rgba(229,9,20,0.2), rgba(229,9,20,0.1));
      border-color: rgba(229,9,20,0.4);
      transform: translateX(5px) scale(1.02);
    }

    .ranking-first {
      background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,215,0,0.05)) !important;
      border-color: rgba(255,215,0,0.4) !important;
      box-shadow: 0 5px 20px rgba(255,215,0,0.2);
    }

    .ranking-second {
      background: linear-gradient(135deg, rgba(192,192,192,0.2), rgba(192,192,192,0.05)) !important;
      border-color: rgba(192,192,192,0.4) !important;
      box-shadow: 0 5px 20px rgba(192,192,192,0.1);
    }

    .ranking-third {
      background: linear-gradient(135deg, rgba(205,127,50,0.2), rgba(205,127,50,0.05)) !important;
      border-color: rgba(205,127,50,0.4) !important;
      box-shadow: 0 5px 20px rgba(205,127,50,0.1);
    }

    .ranking-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .ranking-position {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 80px;
    }

    .position-icon {
      font-size: 1.8rem;
      animation: iconBounce 2s ease-in-out infinite;
    }

    .position-number {
      font-size: 1.2rem;
      font-weight: bold;
      color: white;
    }

    .movie-details {
      flex: 1;
    }

    .movie-name {
      color: white;
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 1.1rem;
    }

    .movie-stats {
      display: flex;
      gap: 15px;
      margin-bottom: 10px;
    }

    .vote-count {
      color: #e50914;
      font-weight: bold;
    }

    .vote-percentage {
      color: #ccc;
      font-size: 0.9rem;
    }

    .popularity-bar {
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .popularity-fill {
      height: 100%;
      background: linear-gradient(90deg, #e50914, #ff6b6b);
      border-radius: 3px;
      transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 8px rgba(229,9,20,0.5);
    }

    .ranking-badge {
      font-size: 1.5rem;
      color: #ff6b6b;
      animation: flameFlicker 2s ease-in-out infinite;
    }

    .no-voting-message,
    .empty-voting-state,
    .no-candidates-message,
    .empty-candidates,
    .error-loading,
    .no-results,
    .no-votes,
    .error-results {
      text-align: center;
      padding: 60px 40px;
      color: #ccc;
    }

    .empty-voting-state,
    .empty-candidates {
      background: linear-gradient(135deg, rgba(229,9,20,0.1), rgba(229,9,20,0.05));
      border: 2px dashed rgba(229,9,20,0.3);
      border-radius: 20px;
    }

    .empty-voting-state i,
    .empty-candidates i {
      font-size: 4rem;
      color: #e50914;
      margin-bottom: 20px;
      opacity: 0.7;
      animation: float 3s ease-in-out infinite;
    }

    .empty-voting-state h4,
    .empty-candidates h4 {
      color: white;
      margin-bottom: 15px;
    }

    .ranking-loading {
      text-align: center;
      padding: 40px;
    }

    .film-counter {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      color: #e50914;
    }

    .counter-reel {
      width: 30px;
      height: 30px;
      border: 3px solid #e50914;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .theme-revealed {
      animation: titleReveal 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    }

    .confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      animation: confettiFall linear;
    }

    /* Keyframe Animations */
    @keyframes lensGlow {
      0% { box-shadow: 0 0 20px rgba(229,9,20,0.8); }
      100% { box-shadow: 0 0 30px rgba(229,9,20,1), 0 0 40px rgba(229,9,20,0.5); }
    }

    @keyframes filmMove {
      0% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
      100% { transform: translateY(0); }
    }

    @keyframes beamFlicker {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }

    @keyframes dotWave {
      0%, 60%, 100% { transform: scale(1); }
      30% { transform: scale(1.5); }
    }

    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    @keyframes progressShrink {
      from { transform: translateX(-100%); }
      to { transform: translateX(0%); }
    }

    @keyframes badgeSlideIn {
      0% {
        opacity: 0;
        transform: translateX(-20px) scale(0.8);
      }
      100% {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes particleFloat {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -70px) scale(1.5);
      }
    }

    @keyframes iconBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes flameFlicker {
      0%, 100% { transform: scale(1) rotate(0deg); }
      25% { transform: scale(1.1) rotate(-2deg); }
      75% { transform: scale(1.05) rotate(2deg); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }

    @keyframes titleReveal {
      0% {
        opacity: 0;
        transform: translateY(-30px) scale(0.8);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes confettiFall {
      0% {
        transform: translateY(-100vh) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .movie-poster-container {
        height: 300px;
      }

      .movie-card-body {
        padding: 20px;
      }

      .ranking-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .ranking-position {
        min-width: auto;
      }

      .movie-stats {
        flex-direction: column;
        gap: 5px;
      }

      .cinema-voting-alert {
        margin: 0 10px 20px;
      }

      .alert-inner {
        padding: 15px;
      }
    }

    @media (max-width: 576px) {
      .movie-poster-container {
        height: 250px;
      }

      .voting-badges {
        top: 10px;
        left: 10px;
      }

      .candidate-badge,
      .voted-badge {
        font-size: 0.7rem;
        padding: 4px 8px;
      }

      .empty-voting-state,
      .empty-candidates {
        padding: 40px 20px;
      }

      .empty-voting-state i,
      .empty-candidates i {
        font-size: 3rem;
      }
    }
  `;

  document.head.appendChild(cinematicStyles);
});