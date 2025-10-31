# 🎬 CineVille — O Cinema do Seu Bairro!

O **CineVille** é um sistema web completo para gerenciamento de um cinema local, com **painel de administrador** e **interface para usuários**.  
O projeto foi desenvolvido com foco em **usabilidade**, **interatividade** e **design moderno**, inspirado em plataformas reais de cinema.

---

## 🧩 Sobre o Projeto

O CineVille possui duas interfaces principais: uma voltada para o **público (usuário comum)** e outra para o **administrador do cinema**.  
O sistema permite a compra de ingressos, seleção de assentos, acompanhamento de histórico, uso de pontos de fidelidade e **gestão completa de filmes, sessões e promoções**.

---

## 👥 Funcionalidades do Usuário

- Visualizar filmes em cartaz e em breve  
- Selecionar assentos em um modal interativo  
- Adicionar ingressos e snacks ao carrinho de compras  
- Finalizar a compra com registro no histórico e acúmulo de pontos  
- Consultar histórico e pontos de fidelidade  
- Enviar feedback sobre as sessões  
- Participar de programas de fidelidade com benefícios  
- Editar informações na página “Minha Conta”

---

## 🛠️ Funcionalidades do Administrador

- Painel de controle com dashboard interativa  
- Gerenciamento de filmes, sessões e promoções  
- Controle de aluguéis de salas e feedbacks  
- Visualização de relatórios e dados de desempenho  
- Edição de lançamentos e agenda de filmes  
- **Geração e download de relatórios em PDF** (histórico, fidelidade e dados administrativos)

---

## 💻 Tecnologias Utilizadas

### Frontend
- HTML5 e CSS3 (com variáveis e responsividade)  
- JavaScript (ES6+)  
- Bootstrap 5  
- Bootstrap Icons  

### Backend
- Node.js com Express.js  
- Banco de dados MySQL  
- Biblioteca **bcrypt** para criptografia de senhas  
- **reCAPTCHA** e validações de segurança  
- **QRCode** para ingressos digitais  
- **Geração de relatórios em PDF**  

### Outras Ferramentas
- Axios para requisições HTTP  
- Chart.js para gráficos no painel admin  
- NoScript para usuários sem JavaScript habilitado  

---

## 📄 Principais Páginas do Sistema

| Página | Descrição |
|--------|------------|
| **index.html** | Página inicial com filmes em cartaz e em breve |
| **snacks.html** | Loja de snacks e bebidas |
| **carrinho.html** | Exibição e gerenciamento do carrinho |
| **minhaConta.html** | Perfil e fidelidade do usuário |
| **historico.html** | Histórico de compras e ingressos |
| **admin.html** | Painel administrativo completo |
| **login.html / cadastro.html** | Autenticação de usuários |
| **aluguel_sala.html** | Sistema de aluguel de salas |
| **parcerias.html / promocoes.html** | Seções informativas e comerciais |

---

## ⚙️ Como Executar o Projeto

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/cineville.git
   cd cineville
2. Instalar dependências:

npm install

3. Criar o banco de dados MySQL (db_cine):

sever.js:

DB_HOST=localhost
DB_USER=root
DB_PASS=admin
DB_NAME=db_cine
PORT=3000

4. Executar o servidor:

node server.js

## 🎨 Design e Experiência

O layout do **CineVille** foi projetado para oferecer uma experiência **moderna, fluida e responsiva**.  
A paleta de cores segue tons de **vermelho, preto e cinza**, transmitindo a atmosfera de cinema.  
Todos os elementos possuem **feedback visual**, **animações suaves** e **compatibilidade com dispositivos móveis**.

---

## 📑 Exportações e Relatórios

O **CineVille** permite que administradores e usuários baixem informações diretamente em **PDF**, incluindo:

- Relatórios de **compras e fidelidade**  
- **Histórico de sessões** e reservas  
- Dados consolidados de **vendas e promoções**

---

## 👨‍💻 Autor

Desenvolvido por **Arthur Correa**  
Projeto acadêmico (**TCC**) com foco em **desenvolvimento full-stack** e **experiência do usuário**.  

> 🎥 “A magia do cinema começa com uma boa experiência digital.”
