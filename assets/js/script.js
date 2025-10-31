document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:5000/api';

  let filmeSelecionado = null;
  let horarioSelecionado = null;
  let assentosSelecionados = new Set();

  const authHeaders = () => ({
    'x-user-id': localStorage.getItem('userId'),
    'x-user-type': localStorage.getItem('tipo') || 'comum'
  });

  const real = v => Number(v || 0).toFixed(2).replace('.', ',');

  async function carregarFilmes() {
    try {
      const r = await fetch(`${API_BASE_URL}/filmes`);
      const filmes = await r.json();
      const lista = document.getElementById('lista-filmes');

      if (!filmes.length) {
        lista.innerHTML = '<p class="text-center">Nenhum filme em cartaz no momento.</p>';
        return;
      }

      lista.innerHTML = filmes.map(f => `
        <div class="filme-item">
          <img src="${f.poster_url || 'assets/img/placeholder.jpg'}"
               alt="${f.titulo}"
               class="img-fluid rounded shadow-sm cursor-pointer filme-poster"
               data-filme-id="${f.id_filme}"
               data-filme-titulo="${f.titulo}"
               data-filme-poster="${f.poster_url}"
               data-filme-sinopse="${f.sinopse}"
               data-filme-duracao="${f.duracao}"
               data-filme-genero="${f.genero}"
               data-filme-classificacao="${f.classificacao_indicativa}"
               data-filme-trailer="${f.trailer_url || ''}">
        </div>`).join('');

      document.querySelectorAll('.filme-poster')
        .forEach(el => el.addEventListener('click', abrirModalFilme));
    } catch (err) {
      console.error('Erro ao carregar filmes:', err);
    }
  }

  async function carregarFilmesEmBreve() {
    try {
      const r = await fetch(`${API_BASE_URL}/filmes/em-breve`);
      const filmes = await r.json();
      const lista = document.getElementById('lista-filmes-em-breve');

      if (!filmes.length) {
        lista.innerHTML = '<p class="text-center col-12">Nenhum filme em breve no momento.</p>';
        return;
      }

      lista.innerHTML = filmes.map(f => `
        <div class="filme-item">
          <img src="${f.poster_url || 'assets/img/placeholder.jpg'}"
              alt="${f.titulo}"
               class="img-fluid rounded shadow-sm cursor-pointer filme-poster"
               data-filme-id="${f.id_filme}"
               data-filme-titulo="${f.titulo}"
               data-filme-poster="${f.poster_url}"
               data-filme-sinopse="${f.sinopse}"
               data-filme-duracao="${f.duracao}"
               data-filme-genero="${f.genero}"
               data-filme-classificacao="${f.classificacao_indicativa}"
               data-filme-trailer="${f.trailer_url || ''}">
        </div>`).join('');

      document.querySelectorAll('#lista-filmes-em-breve .filme-poster')
        .forEach(el => el.addEventListener('click', abrirModalFilmeBreve));
    } catch (err) {
      console.error('Erro ao carregar filmes em breve:', err);
    }
  }

  function abrirModalFilmeBreve(e) {
    const d = e.currentTarget.dataset;
    document.getElementById('filmeModalBreveTitulo').textContent = d.filmeTitulo;
    document.getElementById('filmeModalBrevePoster').src = d.filmePoster;
    document.getElementById('filmeModalBreveSinopse').textContent = d.filmeSinopse;
    document.getElementById('filmeModalBreveDuracao').textContent = `${d.filmeDuracao} min`;
    document.getElementById('filmeModalBreveGenero').textContent = d.filmeGenero;
    document.getElementById('filmeModalBreveClassificacao').textContent = d.filmeClassificacao;
    const trailer = document.getElementById('filmeModalBreveTrailer');
    trailer.src = d.filmeTrailer && d.filmeTrailer.includes('youtube')
      ? d.filmeTrailer.replace('watch?v=', 'embed/')
      : '';
    new bootstrap.Modal(document.getElementById('filmeModalBreve')).show();
  }

  function abrirModalFilme(e) {
    const d = e.currentTarget.dataset;
    filmeSelecionado = {
      id: d.filmeId,
      titulo: d.filmeTitulo,
      poster: d.filmePoster
    };

    document.getElementById('filmeModalTitulo').textContent = d.filmeTitulo;
    document.getElementById('filmeModalPoster').src = d.filmePoster;
    document.getElementById('filmeModalSinopse').textContent = d.filmeSinopse;
    document.getElementById('filmeModalDuracao').textContent = `${d.filmeDuracao} min`;
    document.getElementById('filmeModalGenero').textContent = d.filmeGenero;
    document.getElementById('filmeModalClassificacao').textContent = d.filmeClassificacao;

    const trailer = document.getElementById('filmeModalTrailer');
    trailer.src = d.filmeTrailer.includes('youtube') ? d.filmeTrailer.replace('watch?v=', 'embed/') : '';

    document.getElementById('prosseguirBtn').onclick = () => {
      abrirModalHorarios(filmeSelecionado.id, filmeSelecionado.titulo, filmeSelecionado.poster);
      bootstrap.Modal.getInstance(document.getElementById('filmeModal')).hide();
    };

    new bootstrap.Modal(document.getElementById('filmeModal')).show();
  }

  function abrirModalHorarios(filmeId, titulo, posterUrl) {
    horarioSelecionado = null;

    document.getElementById('modalFilmeTitulo').textContent = titulo;
    document.getElementById('modalFilmePoster').src = posterUrl;
    document.getElementById('modalFilmePoster').alt = `Pôster de ${titulo}`;

    const horarios = ['10:00', '14:30', '18:00', '21:45'];
    const container = document.getElementById('horariosDisponiveis');
    container.innerHTML = '';

    horarios.forEach(hor => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-group-item list-group-item-action bg-secondary text-white border-0 mb-2';
      btn.dataset.horario = hor;
      btn.textContent = hor;
      btn.onclick = () => {
        horarioSelecionado = hor;
        abrirModalAssentos(filmeId, titulo);
        bootstrap.Modal.getInstance(document.getElementById('horarioModal')).hide();
      };
      container.appendChild(btn);
    });

    new bootstrap.Modal(document.getElementById('horarioModal')).show();
  }

  function abrirModalAssentos(filmeId, titulo) {
    assentosSelecionados.clear();
    document.getElementById('selectedSeatsDisplay').textContent = 'Nenhum';

    const seatingChart = document.getElementById('seatingChart');
    seatingChart.innerHTML = ''; // Limpa o conteúdo anterior

    // Assentos ocupados (exemplo)
    const ocupados = ['A2', 'A3', 'B5', 'C1', 'E10'];
    const rows = 5; // Número de fileiras (A, B, C, D, E)
    const seatsPerRow = 10; // Número de assentos por fileira
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // Para as letras das fileiras

    // Cria um contêiner para a grade de assentos
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    // Define as colunas: uma para a letra da fileira e `seatsPerRow` para os assentos
    gridContainer.style.gridTemplateColumns = `auto repeat(${seatsPerRow}, 40px)`;
    gridContainer.style.gap = '5px';
    gridContainer.style.justifyContent = 'center'; // Centraliza a grade
    gridContainer.style.margin = '20px auto'; // Adiciona margem para centralizar melhor
    gridContainer.style.maxWidth = `${(seatsPerRow + 1) * 45}px`; // Ajusta a largura máxima para a grade

    // Adiciona cabeçalhos de coluna (números dos assentos)
    // Célula vazia para a coluna da letra
    const emptyHeader = document.createElement('div');
    emptyHeader.classList.add('seat-label', 'text-secondary');
    gridContainer.appendChild(emptyHeader);
    for (let c = 1; c <= seatsPerRow; c++) {
        const header = document.createElement('div');
        header.classList.add('seat-label', 'text-secondary');
        header.textContent = c;
        gridContainer.appendChild(header);
    }

    // Loop para criar as fileiras e assentos
    for (let r = 0; r < rows; r++) {
        const rowLetter = alphabet[r]; // Pega a letra da fileira (A, B, C...)

        // Adiciona a letra da fileira
        const rowLabel = document.createElement('div');
        rowLabel.classList.add('seat-label', 'text-secondary');
        rowLabel.textContent = rowLetter;
        gridContainer.appendChild(rowLabel);

        for (let s = 1; s <= seatsPerRow; s++) {
            const id = `${rowLetter}${s}`; // Ex: A1, B5
            const div = document.createElement('div');
            div.className = `seat ${ocupados.includes(id) ? 'occupied' : 'available'}`;
            div.textContent = s; // Mostra apenas o número do assento no visual
            div.dataset.seatId = id; // Armazena o ID completo (ex: A1)

            if (!ocupados.includes(id)) {
                div.onclick = () => toggleSeat(div, id);
            }
            gridContainer.appendChild(div);
        }
    }
    seatingChart.appendChild(gridContainer); // Adiciona a grade completa ao seatingChart

    // Mantenha apenas o botão de adicionar ao carrinho
    document.getElementById('addToCartBtn').onclick = async () => {
      if (!filmeSelecionado || !horarioSelecionado || assentosSelecionados.size === 0) {
        alert('Selecione o horário e pelo menos um assento.');
        return;
      }

      const userId = localStorage.getItem('userId');
      if (!userId) return alert('Você precisa estar logado para comprar.');

      try {
        const r = await fetch(`${API_BASE_URL}/carrinho`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({
            tipo_item: 'ingresso',
            id_referencia: filmeSelecionado.id,
            quantidade: assentosSelecionados.size,
            preco_unitario: 25.00,
            nome_item: filmeSelecionado.titulo,
            detalhes: {
              filmeId: filmeSelecionado.id,
              horario: horarioSelecionado,
              assentos: Array.from(assentosSelecionados)
            }
          })
        });

        if (!r.ok) throw new Error();
        alert('Ingressos adicionados ao carrinho!');
        bootstrap.Modal.getInstance(document.getElementById('assentoModal')).hide();
      } catch {
        alert('Erro ao adicionar ao carrinho. Tente novamente.');
      }
    };

    new bootstrap.Modal(document.getElementById('assentoModal')).show();
  }

  function toggleSeat(div, id) {
    if (assentosSelecionados.has(id)) {
      assentosSelecionados.delete(id);
      div.classList.remove('selected');
      div.classList.add('available');
    } else {
      assentosSelecionados.add(id);
      div.classList.remove('available');
      div.classList.add('selected');
    }

    document.getElementById('selectedSeatsDisplay').textContent =
      assentosSelecionados.size ? Array.from(assentosSelecionados).sort().join(', ') : 'Nenhum';
  }

  carregarFilmes();
  carregarFilmesEmBreve();
});