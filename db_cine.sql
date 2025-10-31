CREATE DATABASE  IF NOT EXISTS `db_cine` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_cine`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: db_cine
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aluguel_sala`
--

DROP TABLE IF EXISTS `aluguel_sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aluguel_sala` (
  `id_aluguel` int NOT NULL AUTO_INCREMENT,
  `id_sala` int NOT NULL,
  `id_usuario` int NOT NULL,
  `dia_aluguel` date NOT NULL,
  `horario_inicio` time NOT NULL,
  `finalidade` varchar(255) DEFAULT NULL,
  `status_aluguel` varchar(20) DEFAULT 'pendente',
  `numero_convidados` int DEFAULT NULL,
  `mensagem` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_aluguel`),
  KEY `id_sala` (`id_sala`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `aluguel_sala_ibfk_1` FOREIGN KEY (`id_sala`) REFERENCES `sala` (`id_sala`),
  CONSTRAINT `aluguel_sala_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aluguel_sala`
--

LOCK TABLES `aluguel_sala` WRITE;
/*!40000 ALTER TABLE `aluguel_sala` DISABLE KEYS */;
INSERT INTO `aluguel_sala` VALUES (1,3,2,'2025-07-10','10:00:00','Festa de Aniversário Infantil','pendente',NULL,NULL),(2,1,1,'2025-07-15','09:00:00','Evento Corporativo \"Lançamento de Produto\"','pendente',NULL,NULL),(3,1,7,'2026-02-01','23:23:00','gravacao_video','aprovado',23,'dawd'),(4,1,5,'2026-10-23','11:11:00','curso','pendente',21,'dw'),(5,2,5,'2026-10-25','12:00:00','aniversario','rejeitado',30,'Quero fazer o meu aniversário com vocês!!'),(6,3,10,'2026-10-25','12:00:00','aniversario','pendente',32,'Quero aniversaria ae!'),(7,3,6,'2025-09-27','12:00:00','workshop','rejeitado',34,'Quero fazer um workshop ai!'),(8,3,11,'2026-07-20','12:00:00','aniversario','pendente',40,'To querendo fazer aniversário com vocês'),(9,3,12,'2026-10-25','12:00:00','festa_infantil','pendente',30,'To querendo fazer um festa para o meu filho ai!'),(10,3,11,'2026-05-02','20:00:00','exposicao','pendente',20,'Quero fazer um exposição de artes'),(11,1,13,'2030-02-20','12:00:00','ensaio_fotografico','rejeitado',100,'Não quero alugar, só estou de sacanagem!');
/*!40000 ALTER TABLE `aluguel_sala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assento`
--

DROP TABLE IF EXISTS `assento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assento` (
  `id_assento` int NOT NULL AUTO_INCREMENT,
  `id_sala` int NOT NULL,
  `fila` varchar(5) NOT NULL,
  `numero` int NOT NULL,
  `status_assento` enum('livre','ocupado','manutencao') DEFAULT 'livre',
  PRIMARY KEY (`id_assento`),
  UNIQUE KEY `id_sala` (`id_sala`,`fila`,`numero`),
  CONSTRAINT `assento_ibfk_1` FOREIGN KEY (`id_sala`) REFERENCES `sala` (`id_sala`)
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assento`
--

LOCK TABLES `assento` WRITE;
/*!40000 ALTER TABLE `assento` DISABLE KEYS */;
INSERT INTO `assento` VALUES (1,1,'A',1,'livre'),(2,1,'A',2,'livre'),(3,1,'A',3,'livre'),(4,1,'A',4,'livre'),(5,1,'A',5,'livre'),(6,1,'A',6,'livre'),(7,1,'A',7,'livre'),(8,1,'A',8,'livre'),(9,1,'A',9,'livre'),(10,1,'A',10,'livre'),(11,1,'B',1,'livre'),(12,1,'B',2,'livre'),(13,1,'B',3,'livre'),(14,1,'B',4,'livre'),(15,1,'B',5,'livre'),(16,1,'B',6,'livre'),(17,1,'B',7,'livre'),(18,1,'B',8,'livre'),(19,1,'B',9,'livre'),(20,1,'B',10,'livre'),(21,1,'C',1,'livre'),(22,1,'C',2,'livre'),(23,1,'C',3,'livre'),(24,1,'C',4,'livre'),(25,1,'C',5,'livre'),(26,1,'C',6,'livre'),(27,1,'C',7,'livre'),(28,1,'C',8,'livre'),(29,1,'C',9,'livre'),(30,1,'C',10,'livre'),(31,1,'D',1,'livre'),(32,1,'D',2,'livre'),(33,1,'D',3,'livre'),(34,1,'D',4,'livre'),(35,1,'D',5,'livre'),(36,1,'D',6,'livre'),(37,1,'D',7,'livre'),(38,1,'D',8,'livre'),(39,1,'D',9,'livre'),(40,1,'D',10,'livre'),(41,1,'E',1,'livre'),(42,1,'E',2,'livre'),(43,1,'E',3,'livre'),(44,1,'E',4,'livre'),(45,1,'E',5,'livre'),(46,1,'E',6,'livre'),(47,1,'E',7,'livre'),(48,1,'E',8,'livre'),(49,1,'E',9,'livre'),(50,1,'E',10,'livre'),(51,1,'F',1,'livre'),(52,1,'F',2,'livre'),(53,1,'F',3,'livre'),(54,1,'F',4,'livre'),(55,1,'F',5,'livre'),(56,1,'F',6,'livre'),(57,1,'F',7,'livre'),(58,1,'F',8,'livre'),(59,1,'F',9,'livre'),(60,1,'F',10,'livre'),(61,1,'G',1,'livre'),(62,1,'G',2,'livre'),(63,1,'G',3,'livre'),(64,1,'G',4,'livre'),(65,1,'G',5,'livre'),(66,1,'G',6,'livre'),(67,1,'G',7,'livre'),(68,1,'G',8,'livre'),(69,1,'G',9,'livre'),(70,1,'G',10,'livre'),(71,1,'H',1,'livre'),(72,1,'H',2,'livre'),(73,1,'H',3,'livre'),(74,1,'H',4,'livre'),(75,1,'H',5,'livre'),(76,1,'H',6,'livre'),(77,1,'H',7,'livre'),(78,1,'H',8,'livre'),(79,1,'H',9,'livre'),(80,1,'H',10,'livre'),(81,1,'I',1,'livre'),(82,1,'I',2,'livre'),(83,1,'I',3,'livre'),(84,1,'I',4,'livre'),(85,1,'I',5,'livre'),(86,1,'I',6,'livre'),(87,1,'I',7,'livre'),(88,1,'I',8,'livre'),(89,1,'I',9,'livre'),(90,1,'I',10,'livre'),(91,1,'J',1,'livre'),(92,1,'J',2,'livre'),(93,1,'J',3,'livre'),(94,1,'J',4,'livre'),(95,1,'J',5,'livre'),(96,1,'J',6,'livre'),(97,1,'J',7,'livre'),(98,1,'J',8,'livre'),(99,1,'J',9,'livre'),(100,1,'J',10,'livre'),(101,1,'K',1,'livre'),(102,1,'K',2,'livre'),(103,1,'K',3,'livre'),(104,1,'K',4,'livre'),(105,1,'K',5,'livre'),(106,1,'K',6,'livre'),(107,1,'K',7,'livre'),(108,1,'K',8,'livre'),(109,1,'K',9,'livre'),(110,1,'K',10,'livre'),(111,1,'L',1,'livre'),(112,1,'L',2,'livre'),(113,1,'L',3,'livre'),(114,1,'L',4,'livre'),(115,1,'L',5,'livre'),(116,1,'L',6,'livre'),(117,1,'L',7,'livre'),(118,1,'L',8,'livre'),(119,1,'L',9,'livre'),(120,1,'L',10,'livre'),(121,1,'M',1,'livre'),(122,1,'M',2,'livre'),(123,1,'M',3,'livre'),(124,1,'M',4,'livre'),(125,1,'M',5,'livre'),(126,1,'M',6,'livre'),(127,1,'M',7,'livre'),(128,1,'M',8,'livre'),(129,1,'M',9,'livre'),(130,1,'M',10,'livre'),(131,1,'N',1,'livre'),(132,1,'N',2,'livre'),(133,1,'N',3,'livre'),(134,1,'N',4,'livre'),(135,1,'N',5,'livre'),(136,1,'N',6,'livre'),(137,1,'N',7,'livre'),(138,1,'N',8,'livre'),(139,1,'N',9,'livre'),(140,1,'N',10,'livre'),(141,1,'O',1,'livre'),(142,1,'O',2,'livre'),(143,1,'O',3,'livre'),(144,1,'O',4,'livre'),(145,1,'O',5,'livre'),(146,1,'O',6,'livre'),(147,1,'O',7,'livre'),(148,1,'O',8,'livre'),(149,1,'O',9,'livre'),(150,1,'O',10,'livre'),(151,2,'A',1,'livre'),(152,2,'A',2,'livre'),(153,2,'A',3,'livre'),(154,2,'A',4,'livre'),(155,2,'A',5,'livre'),(156,2,'A',6,'livre'),(157,2,'A',7,'livre'),(158,2,'A',8,'livre'),(159,2,'A',9,'livre'),(160,2,'A',10,'livre'),(161,2,'B',1,'livre'),(162,2,'B',2,'livre'),(163,2,'B',3,'livre'),(164,2,'B',4,'livre'),(165,2,'B',5,'livre'),(166,2,'B',6,'livre'),(167,2,'B',7,'livre'),(168,2,'B',8,'livre'),(169,2,'B',9,'livre'),(170,2,'B',10,'livre'),(171,2,'C',1,'livre'),(172,2,'C',2,'livre'),(173,2,'C',3,'livre'),(174,2,'C',4,'livre'),(175,2,'C',5,'livre'),(176,2,'C',6,'livre'),(177,2,'C',7,'livre'),(178,2,'C',8,'livre'),(179,2,'C',9,'livre'),(180,2,'C',10,'livre'),(181,2,'D',1,'livre'),(182,2,'D',2,'livre'),(183,2,'D',3,'livre'),(184,2,'D',4,'livre'),(185,2,'D',5,'livre'),(186,2,'D',6,'livre'),(187,2,'D',7,'livre'),(188,2,'D',8,'livre'),(189,2,'D',9,'livre'),(190,2,'D',10,'livre'),(191,2,'E',1,'livre'),(192,2,'E',2,'livre'),(193,2,'E',3,'livre'),(194,2,'E',4,'livre'),(195,2,'E',5,'livre'),(196,2,'E',6,'livre'),(197,2,'E',7,'livre'),(198,2,'E',8,'livre'),(199,2,'E',9,'livre'),(200,2,'E',10,'livre'),(201,2,'F',1,'livre'),(202,2,'F',2,'livre'),(203,2,'F',3,'livre'),(204,2,'F',4,'livre'),(205,2,'F',5,'livre'),(206,2,'F',6,'livre'),(207,2,'F',7,'livre'),(208,2,'F',8,'livre'),(209,2,'F',9,'livre'),(210,2,'F',10,'livre'),(211,2,'G',1,'livre'),(212,2,'G',2,'livre'),(213,2,'G',3,'livre'),(214,2,'G',4,'livre'),(215,2,'G',5,'livre'),(216,2,'G',6,'livre'),(217,2,'G',7,'livre'),(218,2,'G',8,'livre'),(219,2,'G',9,'livre'),(220,2,'G',10,'livre'),(221,2,'H',1,'livre'),(222,2,'H',2,'livre'),(223,2,'H',3,'livre'),(224,2,'H',4,'livre'),(225,2,'H',5,'livre'),(226,2,'H',6,'livre'),(227,2,'H',7,'livre'),(228,2,'H',8,'livre'),(229,2,'H',9,'livre'),(230,2,'H',10,'livre'),(231,2,'I',1,'livre'),(232,2,'I',2,'livre'),(233,2,'I',3,'livre'),(234,2,'I',4,'livre'),(235,2,'I',5,'livre'),(236,2,'I',6,'livre'),(237,2,'I',7,'livre'),(238,2,'I',8,'livre'),(239,2,'I',9,'livre'),(240,2,'I',10,'livre'),(241,2,'J',1,'livre'),(242,2,'J',2,'livre'),(243,2,'J',3,'livre'),(244,2,'J',4,'livre'),(245,2,'J',5,'livre'),(246,2,'J',6,'livre'),(247,2,'J',7,'livre'),(248,2,'J',8,'livre'),(249,2,'J',9,'livre'),(250,2,'J',10,'livre'),(251,2,'K',1,'livre'),(252,2,'K',2,'livre'),(253,2,'K',3,'livre'),(254,2,'K',4,'livre'),(255,2,'K',5,'livre'),(256,2,'K',6,'livre'),(257,2,'K',7,'livre'),(258,2,'K',8,'livre'),(259,2,'K',9,'livre'),(260,2,'K',10,'livre'),(261,2,'L',1,'livre'),(262,2,'L',2,'livre'),(263,2,'L',3,'livre'),(264,2,'L',4,'livre'),(265,2,'L',5,'livre'),(266,2,'L',6,'livre'),(267,2,'L',7,'livre'),(268,2,'L',8,'livre'),(269,2,'L',9,'livre'),(270,2,'L',10,'livre');
/*!40000 ALTER TABLE `assento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avalia`
--

DROP TABLE IF EXISTS `avalia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avalia` (
  `id_avaliacao` int NOT NULL AUTO_INCREMENT,
  `id_sessao` int NOT NULL,
  `id_feedback` int NOT NULL,
  `data_avaliacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_avaliacao`),
  UNIQUE KEY `id_sessao` (`id_sessao`,`id_feedback`),
  KEY `id_feedback` (`id_feedback`),
  CONSTRAINT `avalia_ibfk_1` FOREIGN KEY (`id_sessao`) REFERENCES `sessao` (`id_sessao`),
  CONSTRAINT `avalia_ibfk_2` FOREIGN KEY (`id_feedback`) REFERENCES `feedback` (`id_feedback`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avalia`
--

LOCK TABLES `avalia` WRITE;
/*!40000 ALTER TABLE `avalia` DISABLE KEYS */;
INSERT INTO `avalia` VALUES (1,1,1,'2025-06-26 09:38:04');
/*!40000 ALTER TABLE `avalia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `beneficios_fidelidade`
--

DROP TABLE IF EXISTS `beneficios_fidelidade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `beneficios_fidelidade` (
  `id_beneficio` int NOT NULL AUTO_INCREMENT,
  `nivel` enum('bronze','prata','ouro','diamante') NOT NULL,
  `desconto_ingresso` decimal(5,2) DEFAULT '0.00',
  `desconto_snacks` decimal(5,2) DEFAULT '0.00',
  `snack_gratis` varchar(100) DEFAULT NULL,
  `min_pontos` int NOT NULL,
  PRIMARY KEY (`id_beneficio`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `beneficios_fidelidade`
--

LOCK TABLES `beneficios_fidelidade` WRITE;
/*!40000 ALTER TABLE `beneficios_fidelidade` DISABLE KEYS */;
INSERT INTO `beneficios_fidelidade` VALUES (1,'bronze',0.00,0.00,NULL,0),(2,'prata',10.00,5.00,'Pipoca Pequena',100),(3,'ouro',20.00,10.00,'Pipoca Média + Refri',250),(4,'diamante',25.00,15.00,'Combo Grande',500);
/*!40000 ALTER TABLE `beneficios_fidelidade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carrinho`
--

DROP TABLE IF EXISTS `carrinho`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carrinho` (
  `id_carrinho` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo_item` enum('ingresso','snack') NOT NULL,
  `id_referencia` int NOT NULL,
  `quantidade` int NOT NULL DEFAULT '1',
  `preco_unitario` decimal(10,2) NOT NULL,
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_carrinho`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `carrinho_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrinho`
--

LOCK TABLES `carrinho` WRITE;
/*!40000 ALTER TABLE `carrinho` DISABLE KEYS */;
/*!40000 ALTER TABLE `carrinho` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cinema`
--

DROP TABLE IF EXISTS `cinema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cinema` (
  `id_cinema` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(80) DEFAULT NULL,
  `nivel_acesso` int DEFAULT '1',
  PRIMARY KEY (`id_cinema`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cinema`
--

LOCK TABLES `cinema` WRITE;
/*!40000 ALTER TABLE `cinema` DISABLE KEYS */;
INSERT INTO `cinema` VALUES (1,'CineVille Matriz','Rua do Cinema, 123, Centro, Nova Lima - MG','3133334444','contato@cineville.com',1);
/*!40000 ALTER TABLE `cinema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compra`
--

DROP TABLE IF EXISTS `compra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compra` (
  `id_compra` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `data_compra` datetime DEFAULT CURRENT_TIMESTAMP,
  `valor_total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `compra_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compra`
--

LOCK TABLES `compra` WRITE;
/*!40000 ALTER TABLE `compra` DISABLE KEYS */;
INSERT INTO `compra` VALUES (1,2,'2025-06-26 09:00:00',90.00),(2,3,'2025-06-26 10:00:00',38.00),(3,5,'2025-07-14 15:04:32',138.00),(4,5,'2025-07-14 15:13:22',150.00),(5,6,'2025-07-14 16:16:48',12.00),(6,6,'2025-07-14 16:18:23',52.00),(7,6,'2025-07-14 16:20:11',52.00),(8,6,'2025-07-14 16:35:30',92.00),(9,6,'2025-07-14 16:42:05',92.00),(10,6,'2025-07-14 16:42:08',92.00),(11,6,'2025-07-14 16:44:10',92.00),(12,6,'2025-07-14 16:44:32',40.00),(13,6,'2025-07-14 16:00:52',125.00),(14,5,'2025-07-15 21:41:22',50.00),(15,5,'2025-07-15 21:33:57',40.00),(16,5,'2025-07-15 21:25:48',50.00),(17,5,'2025-07-16 14:38:56',25.00),(18,5,'2025-07-16 14:53:46',50.00),(19,5,'2025-07-16 14:55:41',25.00),(20,5,'2025-07-16 14:56:38',25.00),(21,6,'2025-07-16 19:02:32',25.00),(22,6,'2025-07-16 20:20:20',50.00),(23,6,'2025-07-17 16:07:44',75.00),(24,6,'2025-07-18 13:55:52',50.00),(25,6,'2025-07-19 20:48:32',100.00),(26,7,'2025-07-22 21:46:30',50.00),(27,6,'2025-07-24 14:32:33',35.20),(28,6,'2025-07-24 18:46:21',40.00),(29,6,'2025-07-24 23:20:31',50.00),(30,5,'2025-07-29 14:17:48',60.20),(31,6,'2025-07-29 19:48:57',50.00),(32,6,'2025-07-30 00:10:29',50.00),(33,6,'2025-07-30 21:44:13',25.00),(34,6,'2025-07-30 22:10:47',50.00),(35,10,'2025-07-31 20:06:57',47.00),(36,6,'2025-08-01 21:30:32',65.00),(37,11,'2025-08-02 17:40:50',37.00),(38,6,'2025-08-02 18:13:54',120.00),(39,6,'2025-08-03 01:00:09',185.00),(40,11,'2025-08-03 01:23:20',59.00),(41,12,'2025-08-04 13:16:08',49.00),(42,11,'2025-08-06 12:20:34',45.00),(43,13,'2025-08-06 12:34:08',58.00);
/*!40000 ALTER TABLE `compra` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
INSERT INTO `compras` VALUES (1,1,'2024-07-01 14:30:00',50.00),(2,1,'2024-07-05 19:00:00',35.50),(3,2,'2024-07-02 11:15:00',25.00),(4,1,'2025-07-11 11:43:18',50.00),(5,1,'2025-07-11 11:43:35',30.00);
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contato`
--

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
  `status` varchar(20) DEFAULT 'pendente',
  PRIMARY KEY (`id_contato`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contato`
--

LOCK TABLES `contato` WRITE;
/*!40000 ALTER TABLE `contato` DISABLE KEYS */;
INSERT INTO `contato` VALUES (1,'João Silva','joao@example.com','Reclamação','Problema com a pipoca.','2024-07-10 10:00:00','pendente'),(3,'Arthur','arthur@gmail.com','Parceria','Vamos fazer parceria bb\n','2025-07-22 18:00:19','resolvido'),(4,'Arthur','sss@gamil.com','Dúvida','Como eu faço para usar os meu pontos de fidelidade?','2025-07-29 14:45:45','resolvido'),(5,'Carlton','carlton244@gmail.com','Dúvida','Como que faz para comprar ingresso? É seguro?','2025-07-29 20:38:24','pendente'),(6,'Francielle','franfan@gmail.com','Dúvida','Só testando os seus sistemas.','2025-07-31 10:45:14','resolvido'),(7,'Claudio Regulagi','regulagiclaudio@gmail.com','Sugestão','Testando 157','2025-07-31 20:06:08','pendente'),(8,'Arthur','bostaaa@gmail.com','Parceria','Vamos pareceriar!','2025-08-01 21:29:40','resolvido'),(9,'Michelle F.','michellef@gmail.com','Sugestão','Adiciona mais snacks','2025-08-02 17:40:08','pendente'),(10,'Carlos Eduardo','dudu244@gmail.com','Elogio','Muito bom os snacks!!','2025-08-04 13:14:39','pendente'),(11,'Michelle F.','michellef@gmail.com','Dúvida','Por que não posso levar comida de fora?','2025-08-06 12:19:20','resolvido'),(12,'Carlos de Jesus','carlosreideslas157@gmail.com','Reclamação','Esse cheetos é muito pequeno!','2025-08-06 12:33:24','em_progresso');
/*!40000 ALTER TABLE `contato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id_feedback` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_sessao` int DEFAULT NULL,
  `tipo_problema` varchar(80) DEFAULT NULL,
  `mensagem` text NOT NULL,
  `data_hora` datetime DEFAULT CURRENT_TIMESTAMP,
  `status_feedback` enum('aberto','em_progresso','resolvido') DEFAULT 'aberto',
  PRIMARY KEY (`id_feedback`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_sessao` (`id_sessao`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`id_sessao`) REFERENCES `sessao` (`id_sessao`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,2,1,'Problema com som','O som da sala 1 estava um pouco baixo durante a sessão de Duna.','2025-06-27 21:30:00','resolvido'),(2,3,NULL,'Sugestão de filme','Gostaria de sugerir o filme \"Blade Runner 2049\" para exibição futura.','2025-06-26 14:00:00','resolvido'),(3,6,10,'sem som','awda','2025-07-29 13:38:43','aberto'),(4,5,2,'outro','Tem um cara peidando aqui!!','2025-07-29 14:18:07','em_progresso'),(5,10,2,'imagem ruim','Imagem ta ruim ein','2025-07-31 20:28:38','aberto'),(6,6,2,'pessoas inconvenientes','Nego ta cagando aqui ein!','2025-08-05 20:30:06','aberto'),(7,6,2,'outro','Asmei!','2025-08-05 20:38:32','aberto'),(8,11,2,'imagem ruim','A imagem está ruim','2025-08-06 12:20:28','resolvido'),(9,13,10,'limpeza','Sala não estava suja, eu que sujei agora!','2025-08-06 12:34:53','aberto');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fidelidade`
--

DROP TABLE IF EXISTS `fidelidade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fidelidade` (
  `id_fidelidade` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `pontos` int NOT NULL DEFAULT '0',
  `totalGasto` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_fidelidade`),
  UNIQUE KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `fidelidade_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fidelidade`
--

LOCK TABLES `fidelidade` WRITE;
/*!40000 ALTER TABLE `fidelidade` DISABLE KEYS */;
/*!40000 ALTER TABLE `fidelidade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filme`
--

DROP TABLE IF EXISTS `filme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filme` (
  `id_filme` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(150) NOT NULL,
  `sinopse` text,
  `genero` varchar(50) DEFAULT NULL,
  `ano_lancamento` int DEFAULT NULL,
  `duracao` int DEFAULT NULL,
  `classificacao_indicativa` varchar(10) DEFAULT NULL,
  `idioma` varchar(20) DEFAULT NULL,
  `trailer_url` varchar(255) DEFAULT NULL,
  `poster_url` varchar(255) NOT NULL,
  `em_cartaz` tinyint(1) DEFAULT NULL,
  `data_lancamento` date DEFAULT (curdate()),
  `em_votacao` tinyint(1) DEFAULT '0',
  `condicao` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_filme`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filme`
--

LOCK TABLES `filme` WRITE;
/*!40000 ALTER TABLE `filme` DISABLE KEYS */;
INSERT INTO `filme` VALUES (1,'Duna: Parte Dois','Paul Atreides se une a Chani e os Fremen enquanto busca vingança contra os conspiradores que destruíram sua família. Enfrentando uma escolha entre o amor de sua vida e o destino do universo conhecido, ele se esforça para evitar um futuro terrível que só ele pode prever.','Ficção Científica',2024,166,'14','Legendado','https://www.youtube.com/watch?v=Way9Dexny3w','/posters/poster-1752859304622-626781438.jpg',1,'2024-02-29',0,'cartaz'),(2,'Divertida Mente 2','Riley, agora uma adolescente, lida com novas emoções como Ansiedade, Inveja, Tédio e Vergonha, enquanto Alegria, Tristeza, Raiva, Medo e Nojinho tentam manter a ordem em sua mente.','Animação',2024,96,'Livre','Dublado','https://www.youtube.com/watch?v=LEjhY15eCx0','/posters/poster-1752859326054-223951241.jpg',1,'2024-06-20',0,'cartaz'),(3,'Deadpool & Wolverine','Wolverine se recupera de seus ferimentos quando cruza com o tagarela Deadpool. Eles se unem para derrotar um inimigo em comum.','Ação',2024,127,'16','Legendado','https://www.youtube.com/watch?v=73_1biulkYk','/posters/poster-1752859337483-947065880.jpg',1,'2024-07-22',0,'cartaz'),(4,'Planeta dos Macacos: O Reinado','Muitas gerações após o reinado de César, os macacos são a espécie dominante no planeta, vivendo em harmonia, e os humanos são selvagens. À medida que um novo líder símio tirânico constrói seu império, um jovem macaco empreende uma jornada que o levará a questionar tudo o que sabe sobre o passado e a fazer escolhas que definirão o futuro de macacos e humanos.','Ficção Científica',2024,145,'12','Dublado','https://www.youtube.com/watch?v=Q4Z4yaSNGaE','/posters/poster-1752859347298-518538512.jpg',1,'2024-05-09',0,'cartaz'),(5,'Furiosa: Uma Saga Mad Max','Enquanto o mundo caía, a jovem Furiosa é sequestrada do Green Place das Muitas Mães e cai nas mãos de uma grande Horda de Motoqueiros liderada pelo Senhor da Guerra Dementus.','Ação',2024,148,'16','Legendado','https://www.youtube.com/watch?v=XJMuhwVlca4','/posters/poster-1752859354348-198854001.jpg',1,'2024-05-23',0,'cartaz'),(6,'Godzilla e Kong: O Novo Império','O poderoso Kong e o temível Godzilla se unem contra uma colossal ameaça desconhecida escondida em nosso mundo.','Ação',2024,115,'12','Dublado','https://www.youtube.com/watch?v=lV1OOlGwExM','/posters/poster-1752859362371-679987203.jpg',1,'2024-03-29',0,'cartaz'),(7,'Ghostbusters: Apocalipse de Gelo','A família Spengler retorna ao local onde tudo começou – a icônica estação de bombeiros de Nova York – para se unir aos Caça-Fantasmas originais.','Comédia',2024,115,'12','Dublado','https://www.youtube.com/watch?v=HpOBXh02rVc','/posters/poster-1752859369546-235066489.jpg',1,'2024-04-11',0,'cartaz'),(8,'O Dublê','Um dublê, quase aposentado e machucado, precisa encontrar uma estrela de cinema desaparecida, resolver uma conspiração e tentar reconquistar o amor de sua vida.','Ação',2024,126,'14','Legendado','https://www.youtube.com/watch?v=j7jPnwVGdZ8','/posters/poster-1752859376081-810027762.jpg',1,'2024-03-12',1,'cartaz'),(9,'Rivais','Tashi, uma ex-prodígio do tênis que virou treinadora, transforma seu marido Art em um campeão de Grand Slam.','Drama',2024,131,'16','Legendado','https://www.youtube.com/watch?v=AXEK7y1BuNQ','/posters/poster-1752859381634-751294398.jpg',1,'2024-04-25',0,'cartaz'),(10,'Avengers: Doomsday','A nova era dos Vingadores reúne heróis e vilões em uma missão épica liderada por Doctor Doom.','Ação',2026,150,'14',NULL,'https://youtube.com/trailer/avengers_doomsday','/assets/img/Posters/avengers_doomsday.jpg',0,'2026-05-01',0,'emBreve'),(12,'Supergirl','Supergirl parte em uma jornada pelo universo para buscar vingança e enfrentar inimigos cósmicos.','Super‑herói',2026,130,'12',NULL,'https://www.youtube.com/watch?v=O1Do0ZaIZGI','/assets/img/Posters/supergirl.jpg',0,'2026-06-26',0,'emBreve'),(13,'The Batman','Batman (The Batman, no original) segue o segundo ano de Bruce Wayne (Robert Pattinson) como o herói de Gotham, causando medo nos corações dos criminosos da sombria cidade. Com apenas alguns aliados de confiança - Alfred Pennyworth (Andy Serkis) e o tenente James Gordon (Jeffrey Wright) - entre a rede corrupta de funcionários e figuras importantes do distrito, o vigilante solitário se estabeleceu como a única personificação da vingança entre seus concidadãos. Durante uma de suas investigações, Bruce acaba envolvendo a si mesmo e Gordon em um jogo de gato e rato, ao investigar uma série de maquinações sádicas em uma trilha de pistas enigmáticas estabelecida pelo vilão Charada.','Ação',NULL,170,'14',NULL,'https://www.youtube.com/watch?v=mqqft2x_Aa4','/posters/poster-1752707991670-400281164.jpg',1,'2025-07-16',1,'cartaz'),(14,'Scream 4','Dez anos se passaram, e Sidney Prescott, que se reergueu graças, em parte, a sua escrita, é visitada pelo assassino Ghostface.','Terror',NULL,111,'16',NULL,'https://www.youtube.com/watch?v=JKRtyVLWV-E','/posters/poster-1752956246780-123487377.jpg',1,'2025-07-19',0,NULL),(15,'Kill Bill Vol.1','A Noiva (Uma Thurman) é uma perigosa assassina que trabalhava em um grupo, liderado por Bill (David Carradine), composto principalmente por mulheres. Grávida, ela decide escapar dessa vida de violência e decide se casar, mas no dia da cerimônia seus companheiros de trabalho se voltam contra ela, quase a matando.','Ação',NULL,157,'16',NULL,'https://www.youtube.com/watch?v=7kSuas6mRpk&t=4s','/posters/poster-1752967270681-694100823.jpg',0,'2004-04-23',1,NULL),(16,'Baby Driver','Baby (Ansel Elgort) consegue entrar numa gangue de assaltantes de banco. Ele fica com a função de dirigir o carro de fuga e fica em perigo quando decide deixar a vida de crimes para trás. Dessa forma, o jovem tenta escapar do chefão com a ajuda de uma garçonete (Lily James), por quem é apaixonado.','Ação/Crime',NULL,112,'14',NULL,'https://www.youtube.com/watch?v=zTvJJnoWIPk','/posters/poster-1753385009142-910974327.jpg',0,'2017-07-27',0,NULL),(17,'Nós','Adelaide (Lupita Nyong\'o) e Gabe (Winston Duke) decidem levar a família para passar um fim de semana na praia e descansar em uma casa de veraneio. Eles viajam com os filhos e começam a aproveitar o ensolarado local, mas a chegada de um grupo misterioso muda tudo e a família se torna refém de seus próprios duplos.','Terror/Suspense',NULL,116,'16',NULL,'https://www.youtube.com/watch?v=hNCmb-4oXJA','/posters/poster-1753385221973-445556379.jpg',0,'2019-03-21',0,NULL),(18,'Ainda Estou Aqui','Uma mulher casada com um ex-político durante a ditadura militar no Brasil é obrigada a se reinventar e a traçar um novo destino para si e os filhos depois que a vida de sua família é impactada por um ato violento e arbitrário.','Drama',NULL,135,'14',NULL,'https://www.youtube.com/watch?v=_NzqP0jmk3o','/posters/poster-1753574264927-610758359.jpg',1,'2024-11-07',0,NULL),(19,'Eu Sei o que Vocês Fizeram no Verão Passado','Em uma pequena cidade costeira, quatro adolescentes atropelam e supostamente matam um desconhecido. Com medo das conseqüências deste acidente, decidem se livrar do corpo e o jogam no mar. A vida de cada um dos quatro toma rumos diversos e um ano depois, eles se reencontram na mesma cidade e uma das jovens recebe um bilhete dizendo: \"Eu sei o que vocês fizeram no verão passado\". Deste momento em diante mortes acontecem, todas causadas por um gancho de pescador.','Terror/Suspense',NULL,101,'16',NULL,'https://www.youtube.com/watch?v=RaarQMP_1Yg','/posters/poster-1753574439969-203210136.jpg',0,'1997-10-17',0,NULL);
/*!40000 ALTER TABLE `filme` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_pontos`
--

DROP TABLE IF EXISTS `historico_pontos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_pontos` (
  `id_historico` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `pontos` int NOT NULL,
  `data` datetime DEFAULT CURRENT_TIMESTAMP,
  `origem` enum('compra','promocao','bonus','outro') NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_historico`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `historico_pontos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_pontos`
--

LOCK TABLES `historico_pontos` WRITE;
/*!40000 ALTER TABLE `historico_pontos` DISABLE KEYS */;
INSERT INTO `historico_pontos` VALUES (1,6,92,'2025-07-14 16:44:10','compra','Compra #11'),(2,6,40,'2025-07-14 16:44:32','compra','Compra #12'),(3,6,125,'2025-07-14 16:00:52','compra','Compra #13'),(4,5,50,'2025-07-15 21:41:22','compra','Compra #14'),(5,5,40,'2025-07-15 21:33:57','compra','Compra #15'),(6,5,50,'2025-07-15 21:25:48','compra','Compra #16'),(7,5,25,'2025-07-16 14:38:56','compra','Compra #17'),(8,5,50,'2025-07-16 14:53:46','compra','Compra #18'),(9,5,25,'2025-07-16 14:55:42','compra','Compra #19'),(10,5,25,'2025-07-16 14:56:38','compra','Compra #20'),(11,6,25,'2025-07-16 19:02:32','compra','Compra #21'),(12,6,50,'2025-07-16 20:20:20','compra','Compra #22'),(13,6,75,'2025-07-17 16:07:44','compra','Compra #23'),(14,6,50,'2025-07-18 13:55:52','compra','Compra #24'),(15,6,100,'2025-07-19 20:48:32','compra','Compra #25'),(16,7,50,'2025-07-22 21:46:30','compra','Compra #26'),(17,6,35,'2025-07-24 14:32:33','compra','Compra #27'),(18,6,40,'2025-07-24 18:46:22','compra','Compra #28'),(19,6,50,'2025-07-24 23:20:31','compra','Compra #29'),(20,5,60,'2025-07-29 14:17:48','compra','Compra #30'),(21,6,50,'2025-07-29 19:48:57','compra','Compra #31'),(22,6,50,'2025-07-30 00:10:29','compra','Compra #32'),(23,6,25,'2025-07-30 21:44:13','compra','Compra #33'),(24,6,50,'2025-07-30 22:10:47','compra','Compra #34'),(25,10,47,'2025-07-31 20:06:57','compra','Compra #35'),(26,6,65,'2025-08-01 21:30:32','compra','Compra #36'),(27,11,37,'2025-08-02 17:40:50','compra','Compra #37'),(28,6,120,'2025-08-02 18:13:54','compra','Compra #38'),(29,6,185,'2025-08-03 01:00:10','compra','Compra #39'),(30,11,59,'2025-08-03 01:23:20','compra','Compra #40'),(31,12,49,'2025-08-04 13:16:08','compra','Compra #41'),(32,11,45,'2025-08-06 12:20:34','compra','Compra #42'),(33,13,58,'2025-08-06 12:34:08','compra','Compra #43');
/*!40000 ALTER TABLE `historico_pontos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingresso`
--

DROP TABLE IF EXISTS `ingresso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingresso` (
  `id_ingresso` int NOT NULL AUTO_INCREMENT,
  `id_sessao` int NOT NULL,
  `id_assento` int NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status_ingresso` enum('valido','usado','cancelado') DEFAULT 'valido',
  PRIMARY KEY (`id_ingresso`),
  UNIQUE KEY `id_sessao` (`id_sessao`,`id_assento`),
  KEY `id_assento` (`id_assento`),
  CONSTRAINT `ingresso_ibfk_1` FOREIGN KEY (`id_sessao`) REFERENCES `sessao` (`id_sessao`),
  CONSTRAINT `ingresso_ibfk_2` FOREIGN KEY (`id_assento`) REFERENCES `assento` (`id_assento`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingresso`
--

LOCK TABLES `ingresso` WRITE;
/*!40000 ALTER TABLE `ingresso` DISABLE KEYS */;
INSERT INTO `ingresso` VALUES (1,1,1,'QR_CODE_FILME_1_ASSENTO_1','valido'),(2,1,2,'QR_CODE_FILME_1_ASSENTO_2','valido'),(3,2,111,'QR_CODE_FILME_2_ASSENTO_1','valido');
/*!40000 ALTER TABLE `ingresso` ENABLE KEYS */;
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
  CONSTRAINT `fk_item_compra_compra` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_compra`
--

LOCK TABLES `item_compra` WRITE;
/*!40000 ALTER TABLE `item_compra` DISABLE KEYS */;
INSERT INTO `item_compra` VALUES (1,1,'ingresso',1,'Filme Rivais - Ingresso Adulto',2,25.00),(2,2,'snack',101,'Pipoca Grande',1,15.50),(3,2,'snack',102,'Refrigerante',2,10.00),(4,3,'ingresso',2,'Filme Divertidamente 2 - Ingresso Infantil',1,25.00),(5,4,'snack',2,'Refrigerante 500ml',1,12.00),(6,4,'snack',2,'Refrigerante 500ml',1,12.00),(7,4,'ingresso',4,'Planeta dos Macacos: O Reinado',2,25.00),(8,4,'snack',2,'Refrigerante 500ml',1,12.00),(9,4,'snack',2,'Refrigerante 500ml',1,12.00),(10,4,'snack',3,'Combo Super Snack',1,40.00),(11,4,'snack',2,'Refrigerante 500ml',1,12.00),(37,11,'snack',3,'Combo Super Snack',1,40.00),(38,11,'snack',3,'Combo Super Snack',1,40.00),(39,11,'snack',2,'Refrigerante 500ml',1,12.00),(40,12,'snack',3,'Combo Super Snack',1,40.00),(41,13,'ingresso',4,'Planeta dos Macacos: O Reinado',2,25.00),(42,13,'ingresso',4,'Planeta dos Macacos: O Reinado',3,25.00),(43,14,'ingresso',4,'Planeta dos Macacos: O Reinado',2,25.00),(44,15,'snack',3,'Combo Super Snack',1,40.00),(45,16,'ingresso',5,'Furiosa: Uma Saga Mad Max',2,25.00),(46,17,'ingresso',5,'Furiosa: Uma Saga Mad Max',1,25.00),(47,18,'ingresso',4,'Planeta dos Macacos: O Reinado',2,25.00),(48,19,'ingresso',5,'Furiosa: Uma Saga Mad Max',1,25.00),(49,20,'ingresso',7,'Ghostbusters: Apocalipse de Gelo',1,25.00),(50,21,'ingresso',4,'Planeta dos Macacos: O Reinado',1,25.00),(51,22,'ingresso',13,'The Batman',2,25.00),(52,23,'snack',1,'Pipoca Grande',1,25.00),(53,23,'ingresso',1,'Duna: Parte Dois',2,25.00),(54,24,'ingresso',9,'Rivais',2,25.00),(55,25,'ingresso',9,'Rivais',2,25.00),(56,25,'ingresso',14,'Scream 4',2,25.00),(57,26,'ingresso',13,'The Batman',2,25.00),(58,27,'ingresso',9,'Rivais',1,25.00),(59,27,'snack',6,'Cheetos',1,10.20),(60,28,'snack',3,'Combo Super Snack',1,40.00),(61,29,'ingresso',5,'Furiosa: Uma Saga Mad Max',2,25.00),(62,30,'ingresso',18,'Ainda Estou Aqui',2,25.00),(63,30,'snack',6,'Cheetos',1,10.20),(64,31,'ingresso',5,'Furiosa: Uma Saga Mad Max',2,25.00),(65,32,'ingresso',4,'Planeta dos Macacos: O Reinado',2,25.00),(66,33,'ingresso',4,'Planeta dos Macacos: O Reinado',1,25.00),(67,34,'ingresso',4,'Planeta dos Macacos: O Reinado',2,25.00),(68,35,'ingresso',13,'The Batman',1,25.00),(69,35,'snack',1,'Pipoca Grande',1,10.00),(70,35,'snack',2,'Refrigerante 500ml',1,12.00),(71,36,'ingresso',8,'O Dublê',1,25.00),(72,36,'snack',3,'Combo Super Snack',1,40.00),(73,37,'ingresso',1,'Duna: Parte Dois',1,25.00),(74,37,'snack',2,'Refrigerante 500ml',1,12.00),(75,38,'snack',3,'Combo Super Snack',3,40.00),(76,39,'ingresso',4,'Planeta dos Macacos: O Reinado',1,25.00),(77,39,'snack',3,'Combo Super Snack',4,40.00),(78,40,'ingresso',9,'Rivais',1,25.00),(79,40,'snack',2,'Refrigerante 500ml',2,12.00),(80,40,'snack',1,'Pipoca Grande',1,10.00),(81,41,'ingresso',14,'Scream 4',1,25.00),(82,41,'snack',2,'Refrigerante 500ml',2,12.00),(83,42,'ingresso',7,'Ghostbusters: Apocalipse de Gelo',1,25.00),(84,42,'snack',1,'Pipoca Grande',2,10.00),(85,43,'ingresso',14,'Scream 4',1,25.00),(86,43,'snack',5,'Lays',2,10.50),(87,43,'snack',2,'Refrigerante 500ml',1,12.00);
/*!40000 ALTER TABLE `item_compra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parceria`
--

DROP TABLE IF EXISTS `parceria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parceria` (
  `id_parceria` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `contato` varchar(255) DEFAULT NULL,
  `site_url` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_parceria`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parceria`
--

LOCK TABLES `parceria` WRITE;
/*!40000 ALTER TABLE `parceria` DISABLE KEYS */;
INSERT INTO `parceria` VALUES (1,'Carrinho','Um ótimo lugar para você comprar utensílios para a sua casa e entre outras coisas.','carrrinhocontato@gmail.com','http://www.carrinho.com','/assets/img/parcerias/logo_file-1754495090517-792962744.jpg',1),(2,'Livrinhos','Oferece 15% de desconto em qualquer livro para clientes CineVille.','contato@livroseleitura.com','http://www.livroseleitura.com','/assets/img/parcerias/livros_leitura.png',1),(3,'Solitions Games','1 hora de jogos grátis no nosso arcade ao comprar um combo grande no cinema.','info@gamesxtreme.com','http://www.solitionsgames.com','/assets/img/parcerias/solitions_games.png',1),(4,'Spicy Streetware','Desconto de 20% na nova coleção ao apresentar o ingresso da semana.','atendimento@modaestilo.com','http://www.spicystware.com','/assets/img/parcerias/moda_estilo.png',1),(6,'Farias Sampaio','Um café especial por apenas R$5,00 para quem apresentar o ingresso do cinema.','fariassampaiocont@gmail.com','http://www.fariassampaio.com','/assets/img/parcerias/logo_file-1753568565206-187936809.png',1);
/*!40000 ALTER TABLE `parceria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participa`
--

DROP TABLE IF EXISTS `participa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participa` (
  `id_participacao` int NOT NULL AUTO_INCREMENT,
  `id_votacao` int NOT NULL,
  `id_usuario` int NOT NULL,
  `data_voto` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_participacao`),
  UNIQUE KEY `id_votacao` (`id_votacao`,`id_usuario`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `participa_ibfk_1` FOREIGN KEY (`id_votacao`) REFERENCES `votacao` (`id_votacao`),
  CONSTRAINT `participa_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participa`
--

LOCK TABLES `participa` WRITE;
/*!40000 ALTER TABLE `participa` DISABLE KEYS */;
INSERT INTO `participa` VALUES (1,1,2,'2025-06-25 10:00:00'),(2,1,3,'2025-06-25 10:15:00'),(3,2,2,'2025-06-25 11:00:00');
/*!40000 ALTER TABLE `participa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promocao`
--

DROP TABLE IF EXISTS `promocao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promocao` (
  `id_promocao` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `tipo_promocao` enum('filme','snack','geral') NOT NULL,
  `valor_desconto` decimal(5,2) DEFAULT NULL,
  `porcentagem_desconto` decimal(5,2) DEFAULT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `imagem_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_promocao`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promocao`
--

LOCK TABLES `promocao` WRITE;
/*!40000 ALTER TABLE `promocao` DISABLE KEYS */;
INSERT INTO `promocao` VALUES (2,'Ingresso Família','Desconto de 20% na compra de 4 ou mais ingressos.','filme',NULL,20.00,'2025-07-01','2025-08-15',1,'/assets/img/Diversos/promocao_familia.jpg'),(3,'Happy Hour Cine','Desconto de 10% em todos os snacks após as 20h.','geral',NULL,10.00,'2025-07-05','2025-09-30',1,'/assets/img/promocoes/promocao-1753984958641-799830947.png'),(4,'Pipoca em Dobro','Compre uma pipoca grande e ganhe outra grátis!','snack',NULL,NULL,'2025-07-10','2025-08-31',1,'/assets/img/promocoes/promocao-1754056074516-843399560.jpg');
/*!40000 ALTER TABLE `promocao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rodada_votacao`
--

DROP TABLE IF EXISTS `rodada_votacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rodada_votacao` (
  `id_rodada` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `ativa` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_rodada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rodada_votacao`
--

LOCK TABLES `rodada_votacao` WRITE;
/*!40000 ALTER TABLE `rodada_votacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `rodada_votacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sala`
--

DROP TABLE IF EXISTS `sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sala` (
  `id_sala` int NOT NULL AUTO_INCREMENT,
  `nome_sala` varchar(50) NOT NULL,
  `capacidade_total` int NOT NULL,
  `tipo_sala` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_sala`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala`
--

LOCK TABLES `sala` WRITE;
/*!40000 ALTER TABLE `sala` DISABLE KEYS */;
INSERT INTO `sala` VALUES (1,'Sala 1 - Standard',150,'2D'),(2,'Sala 2 - 3D Premium',120,'3D'),(3,'Sala 3 - VIP Luxo',80,'VIP'),(4,'Sala 4 - IMAX Experience',200,'IMAX');
/*!40000 ALTER TABLE `sala` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessao`
--

DROP TABLE IF EXISTS `sessao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessao` (
  `id_sessao` int NOT NULL AUTO_INCREMENT,
  `id_filme` int NOT NULL,
  `id_sala` int NOT NULL,
  `data_hora` datetime NOT NULL,
  `valor_ingresso` decimal(10,2) NOT NULL,
  `tipo_exibicao` enum('2D Dublado','2D Legendado','3D Dublado','3D Legendado','IMAX Dublado','IMAX Legendado') NOT NULL,
  PRIMARY KEY (`id_sessao`),
  KEY `id_filme` (`id_filme`),
  KEY `id_sala` (`id_sala`),
  CONSTRAINT `sessao_ibfk_1` FOREIGN KEY (`id_filme`) REFERENCES `filme` (`id_filme`),
  CONSTRAINT `sessao_ibfk_2` FOREIGN KEY (`id_sala`) REFERENCES `sala` (`id_sala`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessao`
--

LOCK TABLES `sessao` WRITE;
/*!40000 ALTER TABLE `sessao` DISABLE KEYS */;
INSERT INTO `sessao` VALUES (1,1,1,'2025-08-27 19:00:00',25.00,'2D Dublado'),(2,1,2,'2025-08-27 22:00:00',25.00,'3D Legendado'),(3,2,3,'2025-08-27 15:30:00',25.00,'2D Legendado'),(4,3,4,'2025-08-27 18:00:00',25.00,'IMAX Dublado'),(5,4,1,'2025-08-28 14:00:00',25.00,'2D Dublado'),(6,5,2,'2025-08-28 20:00:00',25.00,'3D Legendado'),(7,6,3,'2025-08-28 17:00:00',25.00,'2D Dublado'),(8,7,4,'2025-08-28 22:30:00',25.00,'IMAX Legendado'),(9,8,1,'2025-08-29 16:00:00',25.00,'2D Legendado'),(10,16,2,'2025-08-29 19:00:00',25.00,'3D Dublado'),(11,14,3,'2025-08-29 20:00:00',25.00,'2D Dublado'),(12,18,1,'2025-08-28 18:00:00',25.00,'2D Dublado'),(13,9,2,'2025-08-28 17:00:00',25.00,'2D Dublado'),(14,13,3,'2025-08-28 20:00:00',25.00,'2D Dublado');
/*!40000 ALTER TABLE `sessao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `snack`
--

DROP TABLE IF EXISTS `snack`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `snack` (
  `id_snack` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `preco` decimal(10,2) NOT NULL,
  `disponivel` tinyint(1) DEFAULT NULL,
  `imagem_url` varchar(255) DEFAULT NULL,
  `tipo` enum('lanche','bebida','doce','combo') NOT NULL DEFAULT 'lanche',
  PRIMARY KEY (`id_snack`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `snack`
--

LOCK TABLES `snack` WRITE;
/*!40000 ALTER TABLE `snack` DISABLE KEYS */;
INSERT INTO `snack` VALUES (1,'Pipoca Grande','Pipoca grande deliciosa com muita manteiga!',10.00,1,'/snacks/snack-1754436732064-466245261.jpg','lanche'),(2,'Refrigerante 500ml','Coca-Cola, Guaraná, Fanta (selecione na bomboniere).',12.00,1,'/snacks/snack-1752969448391-920568422.jpg','bebida'),(3,'Combo Super Snack','Pipoca Grande + Refri 500ml + Nachos.',40.00,1,'/snacks/snack-1752969455871-990284494.jpg','combo'),(4,'Barra de Chocolate','Barra de chocolate 45g.',8.50,1,'/snacks/snack-1752969461503-885070915.jpg','doce'),(5,'Lays','Batata Lays deliciosas!',10.50,1,'/snacks/snack-1752968753888-483020774.jpg','lanche'),(6,'Cheetos','Cheetos deliciosos para acompanhar na sua sessão!',10.20,1,'/snacks/snack-1753373980015-573186553.jpg','lanche'),(7,'Combo família especial.','Que tal um combo família? Pipoca grande, dois refrigerantes e dois chocolates por um preço incrível! Confira já!',120.00,1,'/snacks/snack-1754057539066-306620775.jpg','combo');
/*!40000 ALTER TABLE `snack` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `email` varchar(80) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `tipo` enum('admin','comum') DEFAULT 'comum',
  `pontos_fidelidade` int DEFAULT '0',
  `nivel_fidelidade` enum('bronze','prata','ouro','diamante') DEFAULT 'bronze',
  `data_adesao_programa` date DEFAULT NULL,
  `total_gasto` decimal(10,2) DEFAULT '0.00',
  `data_cadastro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'Admin CineVille','admin@cineville.com','hash_da_senha_admin','admin',0,'bronze',NULL,0.00,'2025-07-18 15:35:47'),(2,'João Silva','joao.silva@example.com','hash_da_senha_joao','comum',0,'bronze',NULL,0.00,'2025-07-18 15:35:47'),(3,'Maria Souza','maria.souza@example.com','hash_da_senha_maria','comum',0,'bronze',NULL,0.00,'2025-07-18 15:35:47'),(4,'Carlton Christian','christian@gmail.com','123098','comum',0,'bronze',NULL,0.00,'2025-07-18 15:35:47'),(5,'Henrique Gomes','henriquegomes@gmail.com','$2b$10$jzkmDIB8xWe0yt6SsMlxFOrWpYASKfeYkys/AZjAGhjKITMfeMvR6','comum',325,'ouro',NULL,325.20,'2025-07-18 15:35:47'),(6,'AdminCinneVille','admin@cineville','$2b$10$l7AyH5X5qK30PHWWdh2yeemE/VvvsZ2GoPbaf8VvVKZlz0SUpFQ06','admin',1095,'diamante',NULL,1095.20,'2025-07-18 15:35:47'),(7,'Vinicius Nunes','vinilkd244@gmail.com','$2b$10$cakuSc2n7HhqNAQAqp/EUujY4Yloz0nG0IDIdsncSwpNJrSE614kC','comum',50,'prata',NULL,50.00,'2025-07-21 22:43:50'),(9,'Julio Cude Franga','franga224@gmail.com','$2b$10$gAEXfpILvFjr7j0XH7lvbuk.Z.5u1mMWVqh/Hje6GXp62HeC1oHc6','comum',0,'bronze',NULL,0.00,'2025-07-24 20:12:08'),(10,'Claudio Regulagi','regulagiclaudio@gmail.com','$2b$10$EgeSUhLJkYwwgb7aNFJAs.UDfsUvMY55p7achZw3K3Ug1tooQED36','comum',47,'bronze',NULL,47.00,'2025-07-31 23:03:36'),(11,'Michelle Ferreira','michellef@gmail.com','$2b$10$aJrgNMt./oySG/Mj2lCRc.0KDFTLZ6IUsWGPBmH2PTqh8Mcc.WCSq','comum',141,'prata',NULL,141.00,'2025-08-02 20:37:54'),(12,'Carlos Eduardo','dudu244@gmail.com','$2b$10$LV/WdDBlD6qciQJ3XTjFnuAm8m8zvYHD0hLg0xly4NbNEqrBQm866','comum',49,'bronze',NULL,49.00,'2025-08-04 16:11:47'),(13,'Carlos de Jesus','carlosreideslas157@gmail.com','$2b$10$7onAR4TBZCq26o57RE.oIurFb5Sa/OxglSLSGWsrpI2BJd0APWCYu','comum',58,'prata',NULL,58.00,'2025-08-06 15:32:14');
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votacao`
--

DROP TABLE IF EXISTS `votacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votacao` (
  `id_votacao` int NOT NULL AUTO_INCREMENT,
  `tema_votacao` varchar(80) NOT NULL,
  `descricao` text,
  `data_inicio` date NOT NULL,
  `data_fim` date NOT NULL,
  `status_votacao` enum('ativa','encerrada') DEFAULT 'ativa',
  PRIMARY KEY (`id_votacao`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votacao`
--

LOCK TABLES `votacao` WRITE;
/*!40000 ALTER TABLE `votacao` DISABLE KEYS */;
INSERT INTO `votacao` VALUES (1,'Vote no Próximo Clássico','Escolha o próximo filme clássico que você quer ver de volta nas telonas do CineVille!','2025-06-20','2025-07-05','ativa'),(2,'Filmes de Terror, qual vocês vão ficar com mais medo?','Qual filme infantil você quer ver nas sessões especiais de férias?','2025-07-01','2025-07-15','ativa');
/*!40000 ALTER TABLE `votacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votacao_filmes`
--

DROP TABLE IF EXISTS `votacao_filmes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votacao_filmes` (
  `id_votacao_filme` int NOT NULL AUTO_INCREMENT,
  `id_votacao` int NOT NULL,
  `id_filme` int NOT NULL,
  `votos` int DEFAULT '0',
  PRIMARY KEY (`id_votacao_filme`),
  UNIQUE KEY `id_votacao` (`id_votacao`,`id_filme`),
  KEY `id_filme` (`id_filme`),
  CONSTRAINT `votacao_filmes_ibfk_1` FOREIGN KEY (`id_votacao`) REFERENCES `votacao` (`id_votacao`) ON DELETE CASCADE,
  CONSTRAINT `votacao_filmes_ibfk_2` FOREIGN KEY (`id_filme`) REFERENCES `filme` (`id_filme`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votacao_filmes`
--

LOCK TABLES `votacao_filmes` WRITE;
/*!40000 ALTER TABLE `votacao_filmes` DISABLE KEYS */;
INSERT INTO `votacao_filmes` VALUES (11,2,19,0),(13,2,14,1),(15,2,17,0);
/*!40000 ALTER TABLE `votacao_filmes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votacao_sessao`
--

DROP TABLE IF EXISTS `votacao_sessao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votacao_sessao` (
  `id_votacao_sessao` int NOT NULL AUTO_INCREMENT,
  `id_votacao` int NOT NULL,
  `id_filme` int NOT NULL,
  `qtd_votos` int DEFAULT '0',
  PRIMARY KEY (`id_votacao_sessao`),
  UNIQUE KEY `id_votacao` (`id_votacao`,`id_filme`),
  KEY `id_filme` (`id_filme`),
  CONSTRAINT `votacao_sessao_ibfk_1` FOREIGN KEY (`id_votacao`) REFERENCES `votacao` (`id_votacao`),
  CONSTRAINT `votacao_sessao_ibfk_2` FOREIGN KEY (`id_filme`) REFERENCES `filme` (`id_filme`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votacao_sessao`
--

LOCK TABLES `votacao_sessao` WRITE;
/*!40000 ALTER TABLE `votacao_sessao` DISABLE KEYS */;
INSERT INTO `votacao_sessao` VALUES (1,1,1,150),(2,1,3,120),(3,2,2,200),(4,2,4,80);
/*!40000 ALTER TABLE `votacao_sessao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `votos_usuario`
--

DROP TABLE IF EXISTS `votos_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `votos_usuario` (
  `id_voto` int NOT NULL AUTO_INCREMENT,
  `id_votacao` int NOT NULL,
  `id_usuario` int NOT NULL,
  `id_filme_votado` int NOT NULL,
  `data_voto` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_voto`),
  UNIQUE KEY `id_votacao` (`id_votacao`,`id_usuario`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_filme_votado` (`id_filme_votado`),
  CONSTRAINT `votos_usuario_ibfk_1` FOREIGN KEY (`id_votacao`) REFERENCES `votacao` (`id_votacao`),
  CONSTRAINT `votos_usuario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `votos_usuario_ibfk_3` FOREIGN KEY (`id_filme_votado`) REFERENCES `filme` (`id_filme`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `votos_usuario`
--

LOCK TABLES `votos_usuario` WRITE;
/*!40000 ALTER TABLE `votos_usuario` DISABLE KEYS */;
INSERT INTO `votos_usuario` VALUES (23,2,13,14,'2025-08-06 15:32:50');
/*!40000 ALTER TABLE `votos_usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-06 12:46:01
