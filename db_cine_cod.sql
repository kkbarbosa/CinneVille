use db_cine;

select * from usuario;

-- Adicionar colunas na tabela usuario para o programa de fidelidade
ALTER TABLE `usuario` 
ADD COLUMN `pontos_fidelidade` INT DEFAULT 0,
ADD COLUMN `nivel_fidelidade` ENUM('bronze', 'prata', 'ouro', 'diamante') DEFAULT 'bronze',
ADD COLUMN `data_adesao_programa` DATE,
ADD COLUMN `total_gasto` DECIMAL(10,2) DEFAULT 0.00;

-- Criar tabela de benefícios por nível
CREATE TABLE `beneficios_fidelidade` (
  `id_beneficio` INT NOT NULL AUTO_INCREMENT,
  `nivel` ENUM('bronze', 'prata', 'ouro', 'diamante') NOT NULL,
  `desconto_ingresso` DECIMAL(5,2) DEFAULT 0.00,
  `desconto_snacks` DECIMAL(5,2) DEFAULT 0.00,
  `snack_gratis` VARCHAR(100) DEFAULT NULL,
  `min_pontos` INT NOT NULL,
  PRIMARY KEY (`id_beneficio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Inserir benefícios padrão
INSERT INTO `beneficios_fidelidade` (`nivel`, `desconto_ingresso`, `desconto_snacks`, `snack_gratis`, `min_pontos`) VALUES
('bronze', 0.00, 0.00, NULL, 0),
('prata', 10.00, 5.00, 'Pipoca Pequena', 100),
('ouro', 20.00, 10.00, 'Pipoca Média + Refri', 250),
('diamante', 25.00, 15.00, 'Combo Grande', 500);

-- Criar tabela de histórico de pontos
CREATE TABLE `historico_pontos` (
  `id_historico` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `pontos` INT NOT NULL,
  `data` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `origem` ENUM('compra', 'promocao', 'bonus', 'outro') NOT NULL,
  `descricao` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_historico`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `historico_pontos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Use o banco de dados db_cine
USE db_cine;

drop table filme;

-- Inserindo dados na tabela 'filme'
INSERT INTO filme (titulo, sinopse, genero, duracao, classificacao, poster_url, trailer_url, em_cartaz) VALUES
('Duna: Parte Dois', 'Paul Atreides se une a Chani e os Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Enfrentando uma escolha entre o amor de sua vida e o destino do universo conhecido, ele se esforça para evitar um futuro terrível que só ele pode prever.', 'Ficção Científica', 166, '14', 'assets/img/posters/duna-2.jpg', 'https://www.youtube.com/watch?v=VN40qQy2S_8', TRUE),
('Divertida Mente 2', 'Riley, agora uma adolescente, lida com novas emoções como Ansiedade, Inveja, Tédio e Vergonha, enquanto Alegria, Tristeza, Raiva, Medo e Nojinho tentam manter a ordem em sua mente.', 'Animação', 96, 'Livre', 'assets/img/posters/divertidamente-2.jpg', 'https://www.youtube.com/watch?v=LEiBw4G6-Bw', TRUE),
('Deadpool & Wolverine', 'Wolverine se recupera de seus ferimentos quando cruza com o tagarela Deadpool. Eles se unem para derrotar um inimigo em comum.', 'Ação', 127, '16', 'assets/img/posters/deadpool-wolverine.jpg', 'https://www.youtube.com/watch?v=FwT6850d53c', TRUE),
('Planeta dos Macacos: O Reinado', 'Muitas gerações após o reinado de César, os macacos são a espécie dominante no planeta, vivendo em harmonia, e os humanos são selvagens. À medida que um novo líder símio tirânico constrói seu império, um jovem macaco empreende uma jornada que o levará a questionar tudo o que sabe sobre o passado e a fazer escolhas que definirão o futuro de macacos e humanos.', 'Ficção Científica', 145, '12', 'assets/img/posters/planeta-macacos.jpg', 'https://www.youtube.com/watch?v=zJ4xG9r-N3g', TRUE),
('Furiosa: Uma Saga Mad Max', 'Enquanto o mundo caía, a jovem Furiosa é sequestrada do Green Place das Muitas Mães e cai nas mãos de uma grande Horda de Motoqueiros liderada pelo Senhor da Guerra Dementus. Atravessando o deserto, eles se deparam com a Cidadela, presidida por Immortan Joe. Enquanto os dois tiranos guerreiam pelo domínio, Furiosa deve sobreviver a muitos desafios para encontrar o caminho de casa.', 'Ação', 148, '16', 'assets/img/posters/furiosa.jpg', 'https://www.youtube.com/watch?v=aG04w_D3bLg', TRUE),
('Godzilla e Kong: O Novo Império', 'O poderoso Kong e o temível Godzilla se unem contra uma colossal ameaça desconhecida escondida em nosso mundo, que poderá colocar em risco a existência de ambos — e a nossa própria.', 'Ação', 115, '12', 'assets/img/posters/godzilla-kong.jpg', 'https://www.youtube.com/watch?v=h0-i-t22T6w', TRUE),
('Ghostbusters: Apocalipse de Gelo', 'A família Spengler retorna ao local onde tudo começou – a icônica estação de bombeiros de Nova York – para se unir aos Caça-Fantasmas originais, que desenvolveram um laboratório de pesquisa secreto para levar a caça aos fantasmas ao próximo nível.', 'Comédia', 115, '12', 'assets/img/posters/ghostbusters.jpg', 'https://www.youtube.com/watch?v=UqQ-sQG4Xk0', TRUE),
('O Dublê', 'Um dublê, quase aposentado e machucado, precisa encontrar uma estrela de cinema desaparecida, resolver uma conspiração e tentar reconquistar o amor de sua vida, enquanto continua a fazer seu trabalho diário de dublê.', 'Ação', 126, '14', 'assets/img/posters/o-duble.jpg', 'https://www.youtube.com/watch?v=D-P_W2n427M', TRUE),
('Rivais', 'Tashi, uma ex-prodígio do tênis que virou treinadora, transforma seu marido Art em um campeão de Grand Slam. Para tirá-lo de uma recente maré de derrotas, ela o inscreve em um evento "challenger", onde ele deve enfrentar Patrick, seu ex-melhor amigo e ex-namorado de Tashi.', 'Drama', 131, '16', 'assets/img/posters/rivais.jpg', 'https://www.youtube.com/watch?v=u1j-4j8z_6s', TRUE);


-- Inserindo dados na tabela 'sala'
INSERT INTO sala (nome_sala, capacidade_total) VALUES
('Sala 1 - IMAX', 250),
('Sala 2 - VIP', 100),
('Sala 3 - Padrão', 180),
('Sala 4 - Padrão', 180);

-- Inserindo dados na tabela 'sessao'
INSERT INTO sessao (id_filme, id_sala, horario, idioma, tipo_exibicao, valor_ingresso) VALUES
(1, 1, '2025-06-27 19:00:00', 'Dublado', '3D', 45.00),
(1, 1, '2025-06-27 22:00:00', 'Legendado', '3D', 45.00),
(2, 3, '2025-06-27 15:30:00', 'Dublado', '2D', 30.00),
(2, 3, '2025-06-27 17:30:00', 'Dublado', '2D', 30.00),
(3, 2, '2025-06-27 20:00:00', 'Legendado', '2D', 40.00),
(4, 4, '2025-06-27 18:00:00', 'Dublado', '2D', 30.00),
(5, 3, '2025-06-27 21:00:00', 'Legendado', '2D', 30.00),
(6, 1, '2025-06-28 17:00:00', 'Dublado', '3D', 45.00),
(7, 2, '2025-06-28 19:30:00', 'Dublado', '2D', 40.00),
(8, 4, '2025-06-28 21:30:00', 'Legendado', '2D', 30.00),
(9, 3, '2025-06-28 18:00:00', 'Legendado', '2D', 30.00);

-- Inserindo dados na tabela 'assento' (Exemplo para Sala 1 - IMAX, 250 lugares)
-- Para uma sala de 250 lugares, você precisaria de muitos INSERTs.
-- Aqui, vou inserir apenas alguns para demonstrar. Você precisaria de um script gerador para todos os assentos.
INSERT INTO assento (id_sala, fila, numero, status) VALUES
(1, 'A', 1, 'livre'), (1, 'A', 2, 'livre'), (1, 'A', 3, 'livre'),
(1, 'B', 1, 'livre'), (1, 'B', 2, 'livre'), (1, 'B', 3, 'livre'),
(2, 'A', 1, 'livre'), (2, 'A', 2, 'livre'), (2, 'A', 3, 'livre'),
(2, 'B', 1, 'livre'), (2, 'B', 2, 'livre'), (2, 'B', 3, 'livre');
-- ... você continuaria inserindo todos os 250 assentos para Sala 1, 100 para Sala 2, etc.

ALTER TABLE snack ADD COLUMN quantidade_estoque INT;

drop table snack;

CREATE TABLE `snack` (
  `id_snack` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `descricao` text,
  `preco` decimal(10,2) NOT NULL,
  `quantidade_estoque` int DEFAULT '0',
  `imagem_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_snack`)
);

-- Inserindo dados na tabela 'snack'
INSERT INTO snack (nome, descricao, preco, imagem_url) VALUES
(1,'Pipoca Grande','Pipoca doce caramelizada',25.00,200,'pipoca.jpg'),
(2,'Refrigerante','Lata 350ml',10.00,150,'refrigerante.jpg'),
(3,'Nachos','Com queijo derretido',32.00,90,'nachos.jpg'),
(4,'Chocolate','Barra de chocolate',8.00,180,'chocolate.jpg');

/*
('Pipoca Grande', 'Deliciosa pipoca fresca, salgada ou doce.', 25.00, 'assets/img/snacks/pipoca-grande.jpg'),
('Refrigerante 500ml', 'Diversos sabores de refrigerante gelado.', 10.00, 'assets/img/snacks/refrigerante.jpg'),
('Combo Família', 'Pipoca Grande + 2 Refrigerantes Grandes + 1 Chocolate.', 60.00, 'assets/img/snacks/combo-familia.jpg'),
('Chocolate Barra', 'Barra de chocolate ao leite ou meio amargo.', 12.00, 'assets/img/snacks/chocolate.jpg'),
('Água Mineral', 'Água mineral sem gás.', 6.00, 'assets/img/snacks/agua.jpg'),
('Nachos com Cheddar', 'Crocantes nachos com molho de queijo cheddar.', 28.00, 'assets/img/snacks/nachos.jpg');
*/

INSERT INTO `snack` VALUES 
(1,'Pipoca Grande','Pipoca doce caramelizada',25.00,200,'pipoca.jpg'),
(2,'Refrigerante','Lata 350ml',10.00,150,'refrigerante.jpg'),
(3,'Nachos','Com queijo derretido',32.00,90,'nachos.jpg'),
(4,'Chocolate','Barra de chocolate',8.00,180,'chocolate.jpg');


-- Inserindo dados na tabela 'parceria'
INSERT INTO parceria (nome_parceria, descricao, logo_url) VALUES
('Banco CineBank', 'Descontos exclusivos em ingressos para clientes CineBank.', 'assets/img/parcerias/cinebank.jpg'),
('Pizzaria Sabor & Arte', '10% de desconto na pizza após a sessão com o ingresso CineVille.', 'assets/img/parcerias/sabor-arte.jpg'),
('Livraria do Saber', 'Eventos literários e descontos em livros de filmes.', 'assets/img/parcerias/livraria-saber.jpg');

-- Inserindo dados na tabela 'usuario'
-- Senhas fictícias. Em um ambiente real, NUNCA armazene senhas em texto puro.
-- Use um hash como SHA256, BCrypt, etc.
INSERT INTO usuario (nome, email, senha, tipo_usuario) VALUES
('Admin User', 'admin@cineville.com', 'senha_hashed_admin', 'admin'),
('João Silva', 'joao.silva@example.com', 'senha_hashed_joao', 'comum'),
('Maria Souza', 'maria.souza@example.com', 'senha_hashed_maria', 'comum');

-- Inserindo dados na tabela 'venda' (Exemplo, sem associações reais com pagamentos)
INSERT INTO venda (id_usuario, data_venda, valor_total) VALUES
(2, '2025-06-26 10:00:00', 75.00), -- Venda do João Silva
(3, '2025-06-26 10:30:00', 40.00); -- Venda da Maria Souza

-- Inserindo dados na tabela 'venda_ingresso' (Assumindo que os IDs de assento são 1 e 2 para a primeira sessão)
INSERT INTO venda_ingresso (id_venda, id_sessao, id_assento, quantidade) VALUES
(1, 1, 1, 1), -- João comprou 1 ingresso para Duna, assento A1
(1, 1, 2, 1), -- João comprou outro ingresso para Duna, assento A2
(2, 5, 7, 1); -- Maria comprou 1 ingresso para Deadpool, assento A1 (Sala 2)

-- Atualizando o status dos assentos para 'ocupado' após a venda
UPDATE assento SET status = 'ocupado' WHERE id_assento IN (1, 2, 7);

-- Inserindo dados na tabela 'venda_snack'
INSERT INTO venda_snack (id_venda, id_snack, quantidade, valor_unitario) VALUES
(1, 1, 1, 25.00), -- João comprou 1 Pipoca Grande
(1, 2, 1, 10.00); -- João comprou 1 Refrigerante

--
-- Table structure for table `promocao`
--

DROP TABLE IF EXISTS `promocao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promocao` (
  `id_promocao` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `descricao` TEXT,
  `tipo_promocao` ENUM('filme', 'snack', 'geral') NOT NULL,
  `valor_desconto` DECIMAL(5,2) DEFAULT NULL,
  `porcentagem_desconto` DECIMAL(5,2) DEFAULT NULL,
  `data_inicio` DATE NOT NULL,
  `data_fim` DATE NOT NULL,
  `ativo` BOOLEAN DEFAULT TRUE,
  `imagem_url` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_promocao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promocao`
--

LOCK TABLES `promocao` WRITE;
/*!40000 ALTER TABLE `promocao` DISABLE KEYS */;
INSERT INTO `promocao` VALUES
(1, 'Pipoca em Dobro', 'Compre uma pipoca grande e ganhe outra grátis!', 'snack', NULL, NULL, '2025-07-10', '2025-07-31', TRUE, 'assets/img/promocao_pipoca.jpg'),
(2, 'Ingresso Família', 'Desconto de 20% na compra de 4 ou mais ingressos.', 'filme', NULL, 20.00, '2025-07-01', '2025-08-15', TRUE, 'assets/img/promocao_familia.jpg'),
(3, 'Happy Hour Cine', 'Desconto de 10% em todos os snacks após as 20h.', 'geral', NULL, 10.00, '2025-07-05', '2025-09-30', TRUE, 'assets/img/promocao_happy_hour.jpg');
/*!40000 ALTER TABLE `promocao` ENABLE KEYS */;
UNLOCK TABLES;

UPDATE promocao SET imagem_url = '/assets/img/Diversos/promocao_pipoca.jpg' WHERE id_promocao = 1;
UPDATE promocao SET imagem_url = '/assets/img/Diversos/promocao_familia.jpg' WHERE id_promocao = 2;
UPDATE promocao SET imagem_url = '/assets/img/Diversos/promocao_happy_hour.jpg' WHERE id_promocao = 3;

select * from promocao;

ALTER TABLE `snack`
ADD COLUMN `disponivel` BOOLEAN DEFAULT TRUE;

select * from snack;

SET SQL_SAFE_UPDATES = 0;

UPDATE snack
SET disponivel = TRUE;

ALTER TABLE usuario
DROP COLUMN cpf;

ALTER TABLE `snack`
ADD COLUMN `disponivel` BOOLEAN DEFAULT TRUE;

describe snack;

DROP TABLE IF EXISTS `snack`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `snack` (
  `id_snack` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT,
  `preco` DECIMAL(10,2) NOT NULL,
  `disponivel` BOOLEAN DEFAULT TRUE, -- Esta é a coluna adicionada!
  `imagem_url` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id_snack`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `snack` VALUES
(1, 'Pipoca Grande', 'Deliciosa pipoca fresca e crocante.', 25.00, TRUE, 'assets/img/snacks/pipoca_grande.jpg'),
(2, 'Refrigerante 500ml', 'Coca-Cola, Guaraná, Fanta (selecione na bomboniere).', 12.00, TRUE, 'assets/img/snacks/refrigerante.jpg'),
(3, 'Combo Super Snack', 'Pipoca Grande + Refri 500ml + Nachos.', 40.00, TRUE, 'assets/img/snacks/combo_snack.jpg'),
(4, 'Chocolate Snickers', 'Barra de chocolate 45g.', 8.50, TRUE, 'assets/img/snacks/snickers.jpg');
/*!40000 ALTER TABLE `snack` ENABLE KEYS */;

update snack set descricao = 'Pipoca Grande + Refri 500ml + Nachos.' where id_snack = 3;

select * from usuario;

SELECT id_snack, nome, imagem_url FROM snack;

UPDATE snack SET imagem_url = '/assets/img/snacks/pipoca-grande.jpg' WHERE id_snack = 1;
UPDATE snack SET imagem_url = '/assets/img/snacks/refrigerante.jpg' WHERE id_snack = 2;
UPDATE snack SET imagem_url = '/assets/img/snacks/combo-familia.jpg' WHERE id_snack = 3;
UPDATE snack SET imagem_url = '/assets/img/snacks/chocolate.jpg' WHERE id_snack = 4;
-- Ajuste os IDs e nomes dos arquivos conforme seus dados reais

DROP TABLE IF EXISTS `apoio_parceria`;
CREATE TABLE `apoio_parceria` (
  `id_apoio_parceria` INT NOT NULL AUTO_INCREMENT,
  `nome_parceria` VARCHAR(255) NOT NULL,
  `descricao_parceria` TEXT,
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `site_url` VARCHAR(255) DEFAULT NULL,
  `ativo` BOOLEAN DEFAULT TRUE, -- Para ativar/desativar parcerias
  PRIMARY KEY (`id_apoio_parceria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dados de exemplo para Apoio de Parcerias
LOCK TABLES `apoio_parceria` WRITE;
INSERT INTO `apoio_parceria` (`nome_parceria`, `descricao_parceria`, `logo_url`, `site_url`, `ativo`) VALUES
('Livros & Leitura', 'Promoções exclusivas em best-sellers e lançamentos!', '/assets/img/parcerias/livros_leitura.png', 'http://www.livroseleitura.com', TRUE),
('Cafeteria Aroma', 'Descontos especiais em cafés e doces artesanais.', '/assets/img/parcerias/cafeteria_aroma.png', 'http://www.cafearoma.com', TRUE),
('Games Xtreme', 'Torneios e ofertas em jogos de última geração.', '/assets/img/parcerias/games_xtreme.png', 'http://www.gamesxtreme.com', TRUE),
('Moda Estilo', 'As últimas tendências da moda com preços imperdíveis.', '/assets/img/parcerias/moda_estilo.png', 'http://www.modaestilo.com', TRUE);
UNLOCK TABLES;

ALTER TABLE `filme`
Drop COLUMN `ano_lancamento`;

UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=Way9Dexny3w' WHERE `id_filme` = 1;
UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=LEjhY15eCx0' WHERE `id_filme` = 2; 
UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=73_1biulkYk' WHERE `id_filme` = 3; 
UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=Q4Z4yaSNGaE' WHERE `id_filme` = 4; 
UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=XJMuhwVlca4' WHERE `id_filme` = 5;
UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=lV1OOlGwExM' WHERE `id_filme` = 6;
UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=HpOBXh02rVc' WHERE `id_filme` = 7;
UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=j7jPnwVGdZ8' WHERE `id_filme` = 8;
UPDATE `filme` SET `trailer_url` = 'https://www.youtube.com/watch?v=AXEK7y1BuNQ' WHERE `id_filme` = 9;
UPDATE `filme` SET `poster_url` = '/assets/img/Posters/avengers_doomsday.jpg' WHERE `id_filme` = 10;
UPDATE `filme` SET `poster_url` = '/assets/img/Posters/madalorian.jpg' WHERE `id_filme` = 11;

select * from filme;

INSERT INTO filme (
    titulo, sinopse, genero, distribuidora, diretor, ano_lancamento,
    duracao, trailer_url, poster_url, em_cartaz, data_lancamento
) VALUES
(
    'Avengers: Doomsday',
    'A nova era dos Vingadores reúne heróis e vilões em uma missão épica liderada por Doctor Doom.',
    'Ação',
    'Marvel Studios',
    'Anthony Russo, Joe Russo',
    2026,
    150,
    'https://youtube.com/trailer/avengers_doomsday',
    'https://www.youtube.com/watch?v=PJtDDPtn2D0',
    0,
    '2026-05-01'
),
(
    'The Mandalorian and Grogu',
    'Din Djarin e Grogu retornam em aventura cinematográfica pós‑série em uma galáxia distante.',
    'Aventura',
    'Lucasfilm',
    'Jon Favreau',
    2026,
    135,
    'https://www.youtube.com/watch?v=zZvE43iqA0k',
    '/assets/img/Posters/mandalorian.jpg',
    0,
    '2026-05-22'
),
(
    'Supergirl',
    'Supergirl parte em uma jornada pelo universo para buscar vingança e enfrentar inimigos cósmicos.',
    'Super‑herói',
    'DC Studios',
    'Craig Gillespie',
    2026,
    130,
    'https://www.youtube.com/watch?v=O1Do0ZaIZGI',
    '/assets/img/Posters/supergirl.jpg',
    0,
    '2026-06-26'
);


select * from filme;

describe filme;

ALTER TABLE `empresa`
ADD COLUMN `url_logo` VARCHAR(255) DEFAULT NULL;

DROP TABLE IF EXISTS `apoio_parceria`;
CREATE TABLE `apoio_parceria` (
  `id_apoio_parceria` INT NOT NULL AUTO_INCREMENT,
  `id_empresa` INT NOT NULL, -- Adicionamos a FK para a tabela 'empresa'
  `descricao` TEXT,           -- Corrigimos o nome da coluna para 'descricao'
  `ativo` BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`id_apoio_parceria`),
  KEY `id_empresa` (`id_empresa`),
  CONSTRAINT `fk_apoio_empresa` FOREIGN KEY (`id_empresa`) REFERENCES `empresa` (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dados de exemplo para Apoio de Parcerias (Assumindo id_empresa 1 para exemplos)
LOCK TABLES `apoio_parceria` WRITE;
INSERT INTO `apoio_parceria` (`id_empresa`, `descricao`, `ativo`) VALUES
(1, 'Parceria com a Livros & Leitura: Descontos especiais para nossos clientes em qualquer livro!', TRUE),
(2, 'Parceria com a Cafeteria Aroma: Apresente seu ingresso e ganhe 10% de desconto no café!', TRUE),
(3, 'Parceria com a Games Xtreme: Ingresso de cinema te dá 1 hora grátis na arena de games!', TRUE),
(4, 'Parceria com a Moda Estilo: Descontos exclusivos em roupas para quem ama cinema!', TRUE);
UNLOCK TABLES;

select * from empresa;

DROP TABLE IF EXISTS `apoio_parceria`;
DROP TABLE IF EXISTS `empresa`; 

drop table parceria;
CREATE TABLE `parceria` (
  `id_parceria` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(255) NOT NULL, -- Nome da empresa parceira
  `descricao` TEXT,             -- O que a parceria faz/oferece
  `contato` VARCHAR(255) DEFAULT NULL, -- Email, telefone ou outro contato
  `site_url` VARCHAR(255) DEFAULT NULL, -- Link para o site da parceria
  `logo_url` VARCHAR(255) DEFAULT NULL, -- URL da imagem do logo da parceria (ex: /assets/img/parcerias/logo.png)
  `ativo` BOOLEAN DEFAULT TRUE,         -- Se a parceria está ativa
  PRIMARY KEY (`id_parceria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dados de exemplo para a nova tabela 'parceria'
LOCK TABLES `parceria` WRITE;
INSERT INTO `parceria` (`nome`, `descricao`, `contato`, `site_url`, `logo_url`, `ativo`) VALUES
('Livrinhos', 'Oferece 15% de desconto em qualquer livro para clientes CineVille.', 'contato@livroseleitura.com', 'http://www.livroseleitura.com', '/assets/img/parcerias/livros_leitura.png', TRUE),
('Farias Sampaio', 'Um café especial por apenas R$5,00 para quem apresentar o ingresso do cinema.', 'contato@fariasampaio.com', 'http://www.fariassampaio.com', '/assets/img/parcerias/farias_sampaio.png', TRUE),
('Solitions Games', '1 hora de jogos grátis no nosso arcade ao comprar um combo grande no cinema.', 'info@gamesxtreme.com', 'http://www.solitionsgames.com', '/assets/img/parcerias/solitions_games.png', TRUE),
('Spicy Streetware', 'Desconto de 20% na nova coleção ao apresentar o ingresso da semana.', 'atendimento@modaestilo.com', 'http://www.spicystware.com', '/assets/img/parcerias/moda_estilo.png', TRUE);
UNLOCK TABLES;

select * from parceria;

DROP TABLE IF EXISTS `contato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contato` (
  `id_contato` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `assunto` varchar(255) NOT NULL,
  `mensagem` text NOT NULL,
  `data_envio` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_contato`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contato`
--

LOCK TABLES `contato` WRITE;
/*!40000 ALTER TABLE `contato` DISABLE KEYS */;
INSERT INTO `contato` VALUES (1,'João Silva','joao@example.com','Reclamação','Problema com a pipoca.','2024-07-10 10:00:00');
/*!40000 ALTER TABLE `contato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--
DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `data_compra` datetime DEFAULT CURRENT_TIMESTAMP,
  `valor_total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `fk_compras_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
-- Exemplo de dados:
INSERT INTO `compras` VALUES (1,1,'2024-07-01 14:30:00',50.00);
INSERT INTO `compras` VALUES (2,1,'2024-07-05 19:00:00',35.50);
INSERT INTO `compras` VALUES (3,2,'2024-07-02 11:15:00',25.00);
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_compra`
--

DROP TABLE IF EXISTS `item_compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_compra` (
  `id_item_compra` int NOT NULL AUTO_INCREMENT,
  `id_compra` int NOT NULL,
  `tipo_item` enum('ingresso','snack') NOT NULL,
  `id_referencia` int NOT NULL COMMENT 'ID do filme ou do snack',
  `nome_item` varchar(255) NOT NULL,
  `quantidade` int NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_item_compra`),
  KEY `id_compra` (`id_compra`),
  CONSTRAINT `fk_item_compra_compra` FOREIGN KEY (`id_compra`) REFERENCES `compras` (`id_compra`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_compra`
--

LOCK TABLES `item_compra` WRITE;
/*!40000 ALTER TABLE `item_compra` DISABLE KEYS */;
-- Exemplo de dados:
INSERT INTO `item_compra` VALUES (1,1,'ingresso',1,'Filme Rivais - Ingresso Adulto',2,25.00);
INSERT INTO `item_compra` VALUES (2,2,'snack',101,'Pipoca Grande',1,15.50);
INSERT INTO `item_compra` VALUES (3,2,'snack',102,'Refrigerante',2,10.00);
INSERT INTO `item_compra` VALUES (4,3,'ingresso',2,'Filme Divertidamente 2 - Ingresso Infantil',1,25.00);
/*!40000 ALTER TABLE `item_compra` ENABLE KEYS */;
UNLOCK TABLES;

select * from item_compra;

-- Assumindo que você tem um usuário com id_usuario = 1
INSERT INTO compras (id_usuario, valor_total) VALUES (1, 50.00);
-- Pegue o id_compra gerado (ex: 1)

INSERT INTO compras (id_usuario, valor_total) VALUES (1, 30.00);
INSERT INTO item_compra (id_compra, tipo_item, id_referencia, nome_item, quantidade, preco_unitario) VALUES
(2, 'snack', 2, 'Refrigerante Grande', 2, 15.00);

select * from compras;

select * from compra;

select * from item_compra;

use db_cine;
describe historico_pontos;

select * from usuario;

drop table carrinho;
CREATE TABLE carrinho (
  id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  tipo_item ENUM('ingresso', 'snack') NOT NULL,
  id_referencia INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

use db_cine;
select * from carrinho;
select * from historico_pontos;
select * from usuario;
SELECT * FROM carrinho WHERE id_usuario = 6;  -- troque 2 pelo userId logado
delete from carrinho where id_carrinho = 1;
select * from beneficios_fidelidade;
SELECT * FROM carrinho WHERE id_usuario = 1;

/* db_cine.sql — adicione no final e execute 1 vez */
CREATE TABLE IF NOT EXISTS votacao_filme (
  id_voto       INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario    INT NOT NULL,
  id_filme      INT NOT NULL,
  data_voto     DATETIME DEFAULT CURRENT_TIMESTAMP,
  rodada        VARCHAR(20) NOT NULL,
  CONSTRAINT fk_voto_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  CONSTRAINT fk_voto_filme   FOREIGN KEY (id_filme)   REFERENCES filme(id_filme),
  UNIQUE KEY ux_usuario_rodada (id_usuario, rodada)
);

ALTER TABLE historico_pontos drop COLUMN data;
describe carrinho;
-- marque os candidatos com UPDATE filme SET em_votacao = 1 WHERE id_filme IN (...);
Describe filme;

UPDATE usuario SET tipo = 'admin' WHERE id_usuario = 6;

select * from usuario;

ALTER TABLE `usuario`
ADD COLUMN `pontos_fidelidade` INT DEFAULT 0,
ADD COLUMN `nivel_fidelidade` ENUM('bronze','prata','ouro','diamante') DEFAULT 'bronze',
ADD COLUMN `total_gasto` DECIMAL(10,2) DEFAULT 0.00;

CREATE TABLE `fidelidade` (
  `id_fidelidade` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `pontos` int NOT NULL DEFAULT '0',
  `totalGasto` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_fidelidade`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `fidelidade_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE item_compra DROP FOREIGN KEY fk_item_compra_compra;
DROP TABLE IF EXISTS compras;

ALTER TABLE item_compra
ADD CONSTRAINT fk_item_compra_compra
FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
ON DELETE CASCADE ON UPDATE CASCADE;
use db_cine;

select * FROM usuario;

ALTER TABLE item_compra
ADD COLUMN nome_item VARCHAR(255) NOT NULL;

select * from historico;

