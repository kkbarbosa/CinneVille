# CinneVille
O CineVille é um sistema web completo para gerenciamento de um cinema local, com painel de administrador e interface para usuários.
O projeto foi desenvolvido com foco em usabilidade, interatividade e design moderno, inspirado em plataformas reais de cinema.

Sobre o Projeto

O CineVille tem duas interfaces principais: uma voltada para o público (usuário comum) e outra para o administrador do cinema.
O sistema permite a compra de ingressos, seleção de assentos, acompanhamento de histórico, uso de pontos de fidelidade e gestão completa de filmes, sessões e promoções.

Funcionalidades do Usuário

Visualizar filmes em cartaz e em breve.

Selecionar assentos em um modal interativo.

Adicionar ingressos e snacks ao carrinho de compras.

Finalizar a compra com registro de histórico e acúmulo de pontos de fidelidade.

Consultar histórico de compras e pontos.

Enviar feedback sobre as sessões.

Participar de programas de fidelidade com benefícios e recompensas.

Editar informações na página "Minha Conta".

Funcionalidades do Administrador

Painel de controle com dashboard interativa.

Gerenciamento de filmes, sessões e promoções.

Controle de aluguéis de salas e feedbacks de usuários.

Visualização de relatórios e dados de desempenho.

Edição de lançamentos, promoções e agenda de filmes.

Geração e download de relatórios em PDF (histórico, fidelidade e dados administrativos).

Tecnologias Utilizadas

Frontend:

HTML5 e CSS3 (com variáveis e responsividade)

JavaScript (ES6+)

Bootstrap 5

Bootstrap Icons para ícones

Backend:

Node.js com Express.js

Banco de dados MySQL

Biblioteca bcrypt para criptografia de senhas

Validação com reCAPTCHA e verificações de segurança

Geração de QR Code para ingressos digitais

Criação e download de relatórios em PDF

Outras ferramentas:

Axios para requisições HTTP

Chart.js para gráficos no painel admin

NoScript para usuários sem JavaScript habilitado

Principais Páginas do Sistema

index.html — Página inicial com filmes em cartaz e em breve
snacks.html — Loja de snacks e bebidas
carrinho.html — Exibição e gerenciamento do carrinho
minhaConta.html — Perfil e fidelidade do usuário
historico.html — Histórico de compras e ingressos
admin.html — Painel administrativo completo
login.html e cadastro.html — Autenticação de usuários
aluguel_sala.html — Sistema de aluguel de salas
parcerias.html e promocoes.html — Seções informativas e comerciais

Como Executar o Projeto

Clonar o repositório:
git clone https://github.com/seu-usuario/cineville.git

cd cineville

Instalar dependências:
npm install

Criar o banco de dados MySQL com o nome cineville_db e configurar o arquivo .env com:
DB_HOST=localhost
DB_USER=root
DB_PASS=admin
DB_NAME=db_cine
PORT=3000

Executar o servidor:
node server.js
ou com nodemon: npm run dev

O servidor estará disponível em: http://localhost:3000

Design e Experiência

O layout do CineVille foi projetado para oferecer uma experiência moderna e intuitiva.
A paleta de cores segue tons de vermelho, preto e cinza, transmitindo a atmosfera de cinema.
Todos os elementos possuem feedback visual, animações suaves e compatibilidade total com dispositivos móveis.

Exportações e Relatórios

O CineVille permite que administradores e usuários baixem informações diretamente em PDF, incluindo:

Relatórios de compras e fidelidade

Histórico de sessões e reservas

Dados consolidados de vendas e promoções

Contato

Desenvolvido por Arthur Correa.
Projeto acadêmico (TCC) com foco em desenvolvimento full-stack e experiência do usuário.
“A magia do cinema começa com uma boa experiência digital.”
