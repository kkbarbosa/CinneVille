const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET; // coloque sua Secret Key no .env
const bcrypt = require('bcrypt');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const port = 5000;

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'db_cine'
});

async function getDbConnection() {
    return await db.getConnection();
}

const getConn = () => db.getConnection();

// Configurações de Middleware (inalteradas)
app.use(cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-type'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));;
app.use((req, res, next) => {
    req.userId = req.headers['x-user-id'];
    req.userType = req.headers['x-user-type'];
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'public', 'posters');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'poster-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        cb(null, mimetype && extname);
    }
}).single('poster');

// --- Nova Configuração para Imagens de Snacks ---
const storageSnack = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'public', 'snacks'); // Nova pasta para snacks
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'snack-' + uniqueSuffix + path.extname(file.originalname)); // Prefixo 'snack-'
    }
});

const uploadSnack = multer({
    storage: storageSnack,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        cb(null, mimetype && extname);
    }
}).single('imagem');

// Configuração de armazenamento para imagens de parcerias
const storageParcerias = multer.diskStorage({
    destination: function (req, file, cb) {
        // ✅ CORRIGIDO: Usando o mesmo caminho que você referencia no backend
        const uploadPath = path.join(__dirname, 'public', 'assets', 'img', 'parcerias');

        // Garante que o diretório exista
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('📁 Diretório de upload criado/verificado:', uploadPath);

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Gera um nome de arquivo único para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);

        console.log('📝 Arquivo será salvo como:', filename);
        cb(null, filename);
    }
});

const uploadParcerias = multer({
    storage: storageParcerias,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB por imagem
    },
    fileFilter: (req, file, cb) => {
        console.log('🔍 Verificando arquivo:', file.originalname, 'MIME:', file.mimetype);

        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            console.log('✅ Arquivo aceito');
            return cb(null, true);
        }

        console.log('❌ Arquivo rejeitado - tipo não permitido');
        cb(new Error("Erro: Apenas imagens (jpeg, jpg, png, gif) são permitidas!"));
    }
});

// Configuração de armazenamento para imagens de promoções
const storagePromocoes = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'public', 'assets', 'img', 'promocoes');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'promocao-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadPromocoes = multer({
    storage: storagePromocoes,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        cb(null, mimetype && extname);
    }
}).single('imagem');

module.exports = { uploadPromocoes };

function authenticateAdmin(req, res, next) {
    const userType = req.headers['x-user-type'];
    const userId = req.headers['x-user-id'];

    if (!userId || !userType) {
        return res.status(401).json({ message: 'Credenciais não fornecidas.' });
    }

    if (userType === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }
}

function authenticateUser(req, res, next) {
    const userId = req.headers['x-user-id'];
    const userType = req.headers['x-user-type'];

    if (userId && (userType === 'admin' || userType === 'comum')) {
        req.userId = userId;
        req.user = { tipo: userType };
        next();
    } else {
        res.status(403).json({ message: 'Acesso negado. Necessário login.' });
    }
}

// Middleware para verificar se o usuário é admin
function isAdmin(req, res, next) {
    if (req.user && req.user.tipo === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acesso restrito a administradores.' });
    }
}

// ===============================================
// Rotas de API
// ============================================

// Rota de Login
app.post('/api/login', async (req, res) => {
    const { email, senha, captchaToken } = req.body;

    try {
        const gRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET,
                response: captchaToken,
                remoteip: req.ip
            })
        });

        const gData = await gRes.json();
        console.log('reCAPTCHA →', gData);
        if (!gData.success) {
            return res.status(400).json({
                message: 'Falha no reCAPTCHA',
                errors: gData['error-codes'] || []
            });
        }
    } catch (err) {
        console.error('Erro reCAPTCHA:', err);
        return res.status(500).json({ message: 'Erro ao validar reCAPTCHA.' });
    }

    const conn = await getConn();
    try {
        const [rows] = await conn.query(
            'SELECT id_usuario, nome, senha, tipo FROM usuario WHERE email = ?',
            [email]
        );

        if (!rows.length) {
            return res.status(401).json({ message: 'E‑mail ou senha inválidos.' });
        }

        const u = rows[0];
        const senhaCorreta = await bcrypt.compare(senha, u.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ message: 'E‑mail ou senha inválidos.' });
        }

        res.json({ usuario: { id: u.id_usuario, nome: u.nome, tipo: u.tipo } });
    } finally {
        conn.release();
    }
});

// Rota de Cadastro
app.post('/api/cadastro', async (req, res) => {
    let connection;
    try {
        const { nome, email, senha } = req.body;

        // Validações básicas
        if (!nome || !email || !senha) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        connection = await db.getConnection()

        // Verifica se email já existe
        const [existingUsers] = await connection.query(
            "SELECT email FROM usuario WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Este email já está cadastrado." });
        }

        // *** CORREÇÃO AQUI: Gera o hash da senha antes de inserir no banco ***
        const saltRounds = 10; // Custo do hash (quanto maior, mais seguro, mas mais lento)
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        // Insere novo usuário (tipo 'comum' por padrão) com a senha hasheada
        const [result] = await connection.query(
            "INSERT INTO usuario (nome, email, senha, tipo) VALUES (?, ?, ?, 'comum')",
            [nome, email, hashedPassword] // Use a senha hasheada aqui
        );

        res.status(201).json({
            message: "Cadastro realizado com sucesso!",
            usuario: {
                id: result.insertId,
                nome,
                email,
                tipo: 'comum'
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao realizar cadastro.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/carrinho', async (req, res) => {
    const { id_usuario } = req.query; // Agora usando query params
    const connection = await db.getConnection();
    try {
        await connection.query(
            'INSERT INTO item_compra (id_compra, tipo_item, id_referencia, quantidade, preco_unitario, nome_item) VALUES (?, ?, ?, ?, ?, ?)',
            [idCompra, item.tipo_item, item.id_referencia, quantidade, preco, item.nome_item || 'Desconhecido']
        );
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar carrinho:', err);
        res.status(500).json({ message: 'Erro ao buscar carrinho.' });
    } finally {
        connection.release();
    }
});

app.post('/api/carrinho/checkout', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const conn = await getConn();
    try {
        const [itens] = await conn.query(`
      SELECT c.*, 
             CASE 
               WHEN c.tipo_item = 'ingresso' THEN f.titulo 
               ELSE s.nome 
             END AS nome_item
      FROM carrinho c
      LEFT JOIN filme f ON c.tipo_item = 'ingresso' AND c.id_referencia = f.id_filme
      LEFT JOIN snack s ON c.tipo_item = 'snack' AND c.id_referencia = s.id_snack
      WHERE c.id_usuario = ?
    `, [userId]);

        if (!itens.length) return res.status(400).json({ message: 'Carrinho vazio.' });

        const total = itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0);
        const [compra] = await conn.query(
            'INSERT INTO compra (id_usuario, data_compra, valor_total) VALUES (?, NOW(), ?)',
            [userId, total]
        );
        const id_compra = compra.insertId;

        for (const i of itens) {
            const nomeItem = i.nome_item || 'Desconhecido';
            await conn.query(
                `INSERT INTO item_compra 
          (id_compra, tipo_item, id_referencia, quantidade, preco_unitario, nome_item) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [id_compra, i.tipo_item, i.id_referencia, i.quantidade, i.preco_unitario, nomeItem]
            );
        }

        await conn.query('DELETE FROM carrinho WHERE id_usuario = ?', [userId]);

        await conn.query(`
      INSERT INTO historico_pontos (id_usuario, pontos, data, origem, descricao)
      VALUES (?, ?, NOW(), 'compra', ?)
    `, [userId, Math.floor(total), `Compra #${id_compra}`]);

        await conn.query(`
      UPDATE usuario
      SET pontos_fidelidade = IFNULL(pontos_fidelidade, 0) + ?,
          total_gasto = IFNULL(total_gasto, 0) + ?,
          nivel_fidelidade = CASE
            WHEN (IFNULL(pontos_fidelidade, 0) + ?) >= 500 THEN 'diamante'
            WHEN (IFNULL(pontos_fidelidade, 0) + ?) >= 250 THEN 'ouro'
            WHEN (IFNULL(pontos_fidelidade, 0) + ?) >= 100 THEN 'prata'
            ELSE 'bronze'
          END
      WHERE id_usuario = ?
    `, [Math.floor(total), total, Math.floor(total), Math.floor(total), Math.floor(total), userId]);

        res.json({
            message: 'Compra concluída!',
            id_compra,
            valor_total: total,
            pontos: Math.floor(total)
        });
    } catch (err) {
        console.error('checkout:', err);
        res.status(500).json({ message: 'Erro ao finalizar compra.' });
    } finally {
        conn.release();
    }
});

// Remove item do carrinho
app.delete('/api/carrinho/:item_id', async (req, res) => {
    const { item_id } = req.params;
    const connection = await db.getConnection();
    try {
        await connection.query('DELETE FROM carrinho WHERE id_carrinho = ?', [item_id]);
        res.json({ message: 'Item removido do carrinho.' });
    } catch (err) {
        console.error('Erro ao remover item:', err);
        res.status(500).json({ message: 'Erro ao remover item.' });
    } finally {
        connection.release();
    }
});

// Finaliza compra
app.post('/api/carrinho/finalizar', async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: 'Usuário não autenticado.' });

    const conn = await getConn();
    try {
        // 1. Itens atuais do carrinho com nome do item
        const [itens] = await conn.query(`
            SELECT c.*, 
                   CASE 
                     WHEN c.tipo_item = 'ingresso' THEN f.titulo 
                     ELSE s.nome 
                   END AS nome_item
            FROM carrinho c
            LEFT JOIN filme f ON c.tipo_item = 'ingresso' AND c.id_referencia = f.id_filme
            LEFT JOIN snack s ON c.tipo_item = 'snack' AND c.id_referencia = s.id_snack
            WHERE c.id_usuario = ?
        `, [userId]);

        if (!itens.length) return res.status(400).json({ message: 'Carrinho vazio.' });

        // 2. Criar compra
        const total = itens.reduce((s, i) => s + i.preco_unitario * i.quantidade, 0);
        const [compra] = await conn.query(
            'INSERT INTO compra (id_usuario, data_compra, valor_total) VALUES (?,?,?)',
            [userId, new Date(), total]
        );
        const id_compra = compra.insertId;

        // 3. Adicionar itens com nome_item
        const itensInsert = itens.map(i => [
            id_compra,
            i.tipo_item,
            i.id_referencia,
            i.quantidade,
            i.preco_unitario,
            i.nome_item || 'Desconhecido'
        ]);
        await conn.query(
            'INSERT INTO item_compra (id_compra, tipo_item, id_referencia, quantidade, preco_unitario, nome_item) VALUES ?',
            [itensInsert]
        );

        // 4. Limpar carrinho
        await conn.query('DELETE FROM carrinho WHERE id_usuario = ?', [userId]);

        // 5. Pontos de fidelidade (1 ponto por real)
        await conn.query(`
            INSERT INTO historico_pontos (id_usuario, pontos, data, origem, descricao)
            VALUES (?, ?, NOW(), 'compra', ?)
        `, [userId, Math.floor(total), `Compra #${id_compra}`]);

        res.json({ message: 'Compra concluída!', total, pontos: Math.floor(total) });
    } catch (err) {
        console.error('checkout:', err);
        res.status(500).json({ message: 'Erro ao finalizar compra.' });
    } finally { conn.release(); }
});

// Rota para obter dados do usuário
app.get('/api/usuarios/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();

        const [rows] = await connection.query(
            "SELECT nome, email FROM usuario WHERE id_usuario = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter histórico de compras do usuário
app.get('/api/usuarios/:id/compras', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();

        const [rows] = await connection.query(`
            SELECT 
                c.id_compra,
                c.data_compra,
                CAST(c.valor_total AS DECIMAL(10,2)) as valor_total,
                MAX(f.titulo) AS filme,
                MAX(s.nome) AS snack,
                COUNT(DISTINCT CASE WHEN ic.tipo_item = 'ingresso' THEN ic.id_item_compra END) AS ingressos,
                COUNT(DISTINCT CASE WHEN ic.tipo_item = 'snack' THEN ic.id_item_compra END) AS snacks,
                FLOOR(c.valor_total) AS pontos_gerados
            FROM compra c
            LEFT JOIN item_compra ic ON c.id_compra = ic.id_compra
            LEFT JOIN ingresso i ON ic.id_referencia = i.id_ingresso AND ic.tipo_item = 'ingresso'
            LEFT JOIN sessao ss ON i.id_sessao = ss.id_sessao
            LEFT JOIN filme f ON ss.id_filme = f.id_filme
            LEFT JOIN snack s ON ic.id_referencia = s.id_snack AND ic.tipo_item = 'snack'
            WHERE c.id_usuario = ?
            GROUP BY c.id_compra
            ORDER BY c.data_compra DESC
        `, [id]);

        res.json(rows.map(compra => ({
            ...compra,
            valor_total: Number(compra.valor_total) || 0,
            pontos_gerados: Number(compra.pontos_gerados) || 0
        })));
    } catch (error) {
        console.error('Erro ao buscar compras:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter dados de fidelidade do usuário
app.get('/api/usuarios/:id/fidelidade', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();

        const [rows] = await connection.query(
            `SELECT pontos_fidelidade AS pontos, nivel_fidelidade AS nivel, total_gasto FROM usuario WHERE id_usuario = ?`,
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar fidelidade do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/usuarios/:id/historico-pontos', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();

        const [rows] = await connection.query(`
      SELECT 
        DATE_FORMAT(data, '%d/%m/%Y') as data,
        pontos,
        descricao
      FROM historico_pontos
      WHERE id_usuario = ?
      ORDER BY data DESC
    `, [id]);

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar histórico de pontos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

function calcularNivel(pontos) {
    if (pontos >= 500) return 'diamante';
    if (pontos >= 250) return 'ouro';
    if (pontos >= 100) return 'prata';
    return 'bronze';
}

// Rota para obter todos os filmes
app.get('/api/filmes', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();

        const [filmes] = await connection.query("SELECT * FROM filme WHERE em_cartaz = 1");
        res.json(filmes);
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao buscar filmes.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter todos os snacks
app.get('/api/snacks', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [snacks] = await connection.query("SELECT * FROM snack WHERE disponivel = TRUE");
        res.json(snacks);
    } catch (error) {
        console.error('Erro ao buscar snacks:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao buscar snacks.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter um snack específico
app.get('/api/snacks/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();
        const [snack] = await connection.query(
            "SELECT * FROM snack WHERE id_snack = ?",
            [id]
        );

        if (snack.length === 0) {
            return res.status(404).json({ message: "Snack não encontrado." });
        }

        res.json(snack[0]);
    } catch (error) {
        console.error('Erro ao buscar snack:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/beneficios-fidelidade', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [beneficios] = await connection.query("SELECT * FROM beneficios_fidelidade");
        res.json(beneficios);
    } catch (error) {
        console.error('Erro ao buscar benefícios:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// GET snack por ID
app.get('/api/admin/snacks/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [snack] = await connection.query("SELECT * FROM snack WHERE id_snack = ?", [id]);
        if (snack.length === 0) {
            return res.status(404).json({ message: 'Snack não encontrado.' });
        }
        res.json(snack[0]);
    } catch (error) {
        console.error('Erro ao buscar snack por ID:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar snack.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter todos os snacks (admin)
app.get('/api/admin/snacks', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [snacks] = await connection.query("SELECT * FROM snack");
        res.json(snacks);
    } catch (error) {
        console.error('Erro ao buscar snacks:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar snacks.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para adicionar um novo snack (admin)
app.post('/api/admin/snacks', (req, res) => {
    uploadSnack(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: `Erro de upload: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ message: `Erro desconhecido ao fazer upload: ${err.message}` });
        }

        const { nome, descricao, preco, disponivel, tipo } = req.body;
        const imagem_url = req.file ? `/snacks/${req.file.filename}` : null;
        let connection;

        if (!nome || !preco) {
            // Se a imagem foi enviada, mas outros campos obrigatórios estão faltando, remova a imagem.
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Erro ao remover arquivo:', unlinkErr);
                });
            }
            return res.status(400).json({ message: 'Nome e Preço são obrigatórios para o snack.' });
        }

        try {
            connection = await db.getConnection();
            connection = await db.getConnection();
            const [result] = await connection.query(
                "INSERT INTO snack (nome, descricao, preco, imagem_url, disponivel, tipo) VALUES (?, ?, ?, ?, ?, ?)",
                [nome, descricao, parseFloat(preco), imagem_url, disponivel === 'true', tipo || 'lanche'] // Adicione tipo
            );
            res.status(201).json({ message: 'Snack adicionado com sucesso!', id_snack: result.insertId, imagem_url });
        } catch (error) {
            console.error('Erro ao adicionar snack:', error);
            // Se houve erro no banco de dados, e a imagem foi carregada, remova a imagem do sistema de arquivos.
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Erro ao remover arquivo após falha no DB:', unlinkErr);
                });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao adicionar snack.' });
        } finally {
            if (connection) connection.release();
        }
    });
});

// Rota para atualizar um snack (admin)
app.put('/api/admin/snacks/:id', (req, res) => {
    uploadSnack(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: `Erro de upload: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ message: `Erro desconhecido ao fazer upload: ${err.message}` });
        }

        const { id } = req.params;
        const { nome, descricao, preco, disponivel, manter_imagem, tipo } = req.body;
        let connection;

        if (!nome || !preco) {
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Erro ao remover arquivo:', unlinkErr);
                });
            }
            return res.status(400).json({ message: 'Nome e Preço são obrigatórios para o snack.' });
        }

        try {
            connection = await db.getConnection();
            const [currentSnack] = await connection.query("SELECT imagem_url FROM snack WHERE id_snack = ?", [id]);

            let imagem_url = currentSnack.length ? currentSnack[0].imagem_url : null;

            if (req.file) {
                // Nova imagem enviada, apagar a antiga se existir
                if (imagem_url && imagem_url.startsWith('/snacks/')) {
                    const oldImagePath = path.join(__dirname, 'public', imagem_url);
                    fs.unlink(oldImagePath, (unlinkErr) => {
                        if (unlinkErr && unlinkErr.code !== 'ENOENT') { // ENOENT = arquivo não existe, ignore
                            console.error('Erro ao remover imagem antiga do snack:', unlinkErr);
                        }
                    });
                }
                imagem_url = `/snacks/${req.file.filename}`;
            } else if (manter_imagem !== 'true') { // Se não enviou nova imagem e não é para manter a antiga
                // Nenhuma nova imagem e a flag 'manter_imagem' não é true, então remover a imagem existente
                if (imagem_url && imagem_url.startsWith('/snacks/')) {
                    const oldImagePath = path.join(__dirname, 'public', imagem_url);
                    fs.unlink(oldImagePath, (unlinkErr) => {
                        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
                            console.error('Erro ao remover imagem antiga do snack (sem nova imagem):', unlinkErr);
                        }
                    });
                }
                imagem_url = null; // Limpa a URL da imagem no banco de dados
            }
            // Se req.file for falso e manter_imagem for 'true', imagem_url permanece a antiga.

            const [result] = await connection.query(
                "UPDATE snack SET nome = ?, descricao = ?, preco = ?, imagem_url = ?, disponivel = ?, tipo = ? WHERE id_snack = ?",
                [nome, descricao, parseFloat(preco), imagem_url, disponivel === 'true', tipo || 'lanche', id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Snack não encontrado para atualização.' });
            }
            res.json({ message: 'Snack atualizado com sucesso!', imagem_url });
        } catch (error) {
            console.error('Erro ao atualizar snack:', error);
            if (req.file) { // Se upload da nova imagem falhou na DB, apagar arquivo recém-enviado
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Erro ao remover arquivo após falha no DB:', unlinkErr);
                });
            }
            res.status(500).json({ message: 'Erro interno do servidor ao atualizar snack.' });
        } finally {
            if (connection) connection.release();
        }
    });
});

// Rota para excluir um snack (admin)
app.delete('/api/admin/snacks/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Obter a URL da imagem antes de deletar o registro
        const [snackRows] = await connection.query("SELECT imagem_url FROM snack WHERE id_snack = ?", [id]);
        const imageUrlToDelete = snackRows.length > 0 ? snackRows[0].imagem_url : null;

        const [result] = await connection.query("DELETE FROM snack WHERE id_snack = ?", [id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Snack não encontrado para exclusão.' });
        }

        // Remover o arquivo de imagem do sistema de arquivos, se existir
        if (imageUrlToDelete && imageUrlToDelete.startsWith('/snacks/')) {
            const imagePath = path.join(__dirname, 'public', imageUrlToDelete);
            fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr && unlinkErr.code !== 'ENOENT') { // ENOENT = arquivo não existe, ignore
                    console.error('Erro ao remover imagem do snack:', unlinkErr);
                }
            });
        }

        await connection.commit();
        res.json({ message: 'Snack excluído com sucesso!' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao excluir snack:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir snack.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para alternar o status de um snack (admin)
app.put('/api/admin/snacks/:id/status', async (req, res) => {
    let connection;
    try {
        const snackId = req.params.id;

        // 🔍 LOGS PARA DEBUG - INÍCIO
        console.log('🚀 Iniciando alteração de status do snack');
        console.log('📝 snackId recebido:', snackId);
        console.log('📝 req.body:', req.body);
        console.log('📝 req.params:', req.params);
        // 🔍 LOGS PARA DEBUG - FIM

        connection = await getConn();
        console.log('✅ Conexão com banco obtida');

        // Primeiro, busca o status atual do snack
        const getCurrentStatusQuery = `
            SELECT disponivel 
            FROM snack
            WHERE id_snack = ?
        `;

        console.log('🔍 Executando query para buscar status atual:', getCurrentStatusQuery);
        console.log('🔍 Com parâmetro:', snackId);

        const [currentRows] = await connection.query(getCurrentStatusQuery, [snackId]);

        console.log('📊 Resultado da consulta:', currentRows);

        if (currentRows.length === 0) {
            console.log('❌ Snack não encontrado com ID:', snackId);
            return res.status(404).json({ message: 'Snack não encontrado.' });
        }

        // Alterna o status (0 vira 1, 1 vira 0)
        const currentStatus = currentRows[0].disponivel;
        const newStatus = currentStatus === 1 ? 0 : 1;

        console.log('🔄 Status atual:', currentStatus);
        console.log('🔄 Novo status:', newStatus);

        // Atualiza o status
        const updateQuery = `
            UPDATE snack
            SET disponivel = ?
            WHERE id_snack = ?
        `;

        console.log('🔍 Executando query de update:', updateQuery);
        console.log('🔍 Com parâmetros:', [newStatus, snackId]);

        const [result] = await connection.query(updateQuery, [newStatus, snackId]);

        console.log('📊 Resultado do update:', result);

        if (result.affectedRows === 0) {
            console.log('❌ Nenhuma linha afetada no update');
            return res.status(404).json({ message: 'Snack não encontrado.' });
        }

        console.log('✅ Status atualizado com sucesso!');
        res.status(200).json({
            message: 'Status do snack atualizado com sucesso!',
            newStatus: newStatus === 1,
            snackId: snackId
        });

    } catch (error) {
        console.error('💥 ERRO DETALHADO na rota de status do snack:');
        console.error('💥 Tipo do erro:', error.constructor.name);
        console.error('💥 Mensagem:', error.message);
        console.error('💥 Stack completo:', error.stack);
        console.error('💥 SQL State (se houver):', error.sqlState);
        console.error('💥 SQL Message (se houver):', error.sqlMessage);

        res.status(500).json({
            message: 'Erro interno do servidor ao alternar status do snack.',
            error: error.message
        });
    } finally {
        if (connection) {
            console.log('🔒 Liberando conexão');
            connection.release();
        }
    }
});

// ===============
// PROMOÇÕES
// ===============

app.get('/api/promocoes', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [promocoes] = await connection.query("SELECT * FROM promocao WHERE ativo = TRUE AND data_fim >= CURDATE()");
        res.json(promocoes);
    } catch (error) {
        console.error('Erro ao buscar promoções:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao buscar promoções.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para listar todas as promoções (admin)
app.get('/api/admin/promocoes', async (req, res) => {
    const conn = await db.getConnection();
    try {
        const [rows] = await conn.query("SELECT * FROM promocao");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar promoções.' });
    } finally {
        conn.release();
    }
});

// Rota para obter detalhes de uma única promoção (para edição)
app.get('/api/admin/promocoes/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [promocoes] = await connection.query(`
            SELECT id_promocao, titulo, descricao, tipo_promocao, valor_desconto, 
                   porcentagem_desconto, data_inicio, data_fim, ativo, imagem_url 
            FROM promocao 
            WHERE id_promocao = ?
        `, [id]);

        if (promocoes.length === 0) {
            return res.status(404).json({ message: 'Promoção não encontrada.' });
        }

        res.json(promocoes[0]);
    } catch (error) {
        console.error(`Erro ao buscar promoção ${id}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar promoção.' });
    } finally {
        if (connection) connection.release();
    }
});

// Adicionar promoção
app.post('/api/admin/promocoes', (req, res) => {
    uploadPromocoes(req, res, async (err) => {
        if (err) return res.status(400).json({ message: 'Erro no upload da imagem' });

        const { titulo, descricao, tipo_promocao, valor_desconto, porcentagem_desconto, data_inicio, data_fim } = req.body;
        const imagem_url = req.file ? `/assets/img/promocoes/${req.file.filename}` : null;

        const conn = await db.getConnection();
        try {
            await conn.query(`
                INSERT INTO promocao (titulo, descricao, tipo_promocao, valor_desconto, porcentagem_desconto, data_inicio, data_fim, ativo, imagem_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
                [titulo, descricao, tipo_promocao, valor_desconto || null, porcentagem_desconto || null, data_inicio, data_fim, imagem_url]
            );
            res.json({ message: 'Promoção adicionada com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao adicionar promoção.' });
        } finally {
            conn.release();
        }
    });
});

// Rota para editar uma promoção
app.put('/api/admin/promocoes/:id', (req, res) => {
    uploadPromocoes(req, res, async (err) => {
        if (err) return res.status(400).json({ message: 'Erro no upload da imagem' });

        const { id } = req.params;
        const { titulo, descricao, tipo_promocao, valor_desconto, porcentagem_desconto, data_inicio, data_fim, manter_imagem } = req.body;
        let imagem_url = null;

        const conn = await db.getConnection();
        try {
            const [old] = await conn.query("SELECT imagem_url FROM promocao WHERE id_promocao = ?", [id]);
            imagem_url = old[0]?.imagem_url;

            if (req.file) {
                if (imagem_url) {
                    const oldPath = path.join(__dirname, 'public', imagem_url);
                    fs.unlink(oldPath, (err) => { if (err) console.error('Erro ao excluir imagem antiga:', err); });
                }
                imagem_url = `/assets/img/promocoes/${req.file.filename}`;
            } else if (manter_imagem !== 'true') {
                imagem_url = null;
            }

            await conn.query(`
                UPDATE promocao
                SET titulo = ?, descricao = ?, tipo_promocao = ?, valor_desconto = ?, porcentagem_desconto = ?, data_inicio = ?, data_fim = ?, imagem_url = ?
                WHERE id_promocao = ?`,
                [titulo, descricao, tipo_promocao, valor_desconto || null, porcentagem_desconto || null, data_inicio, data_fim, imagem_url, id]
            );

            res.json({ message: 'Promoção atualizada com sucesso!' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao atualizar promoção.' });
        } finally {
            conn.release();
        }
    });
});

// Alterar status (ativo/inativo)
app.patch('/api/admin/promocoes/:id/status', async (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body;
    const conn = await db.getConnection();
    try {
        await conn.query("UPDATE promocao SET ativo = ? WHERE id_promocao = ?", [ativo ? 1 : 0, id]);
        res.json({ message: 'Status da promoção atualizado!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao atualizar status.' });
    } finally {
        conn.release();
    }
});

// Rota para excluir uma promoção
app.delete('/api/admin/promocoes/:id', async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();
    try {
        const [rows] = await conn.query("SELECT imagem_url FROM promocao WHERE id_promocao = ?", [id]);
        if (rows[0]?.imagem_url) {
            const imgPath = path.join(__dirname, 'public', rows[0].imagem_url);
            fs.unlink(imgPath, (err) => { if (err) console.error('Erro ao excluir imagem:', err); });
        }

        await conn.query("DELETE FROM promocao WHERE id_promocao = ?", [id]);
        res.json({ message: 'Promoção excluída com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao excluir promoção.' });
    } finally {
        conn.release();
    }
});

// ==============
// Parcerias
// ==============

// Rota para obter todas as parcerias
app.get('/api/parcerias', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [parcerias] = await connection.query(
            "SELECT id_parceria, nome, site_url, logo_url, descricao, contato FROM parceria where ativo = 1" // Apenas parcerias ativas
        );
        res.json(parcerias);
    } catch (error) {
        console.error('Erro ao buscar parcerias:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar parcerias.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter uma parceria específica
app.get('/api/parcerias/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();
        const [parceria] = await connection.query(
            "SELECT * FROM parceria WHERE id_parceria = ?",
            [id]
        );

        if (parceria.length === 0) {
            return res.status(404).json({ message: "Parceria não encontrada." });
        }

        res.json(parceria[0]);
    } catch (error) {
        console.error('Erro ao buscar parceria:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// POST: Adicionar nova parceria
app.post('/api/parceria', async (req, res) => {
    // Campos ajustados: nome, contato, site_url. Ativo padrão para 1.
    const { nome, descricao, contato, site_url, logo_url } = req.body;
    if (!nome) {
        return res.status(400).json({ message: 'O nome da parceria é obrigatório.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            "INSERT INTO parceria (nome, descricao, contato, site_url, logo_url, ativo) VALUES (?, ?, ?, ?, ?, 1)", // 'ativo' padrão para 1 (true)
            [nome, descricao, contato, site_url, logo_url]
        );
        res.status(201).json({ message: 'Parceria adicionada com sucesso!', id_parceria: result.insertId });
    } catch (error) {
        console.error('Erro ao adicionar parceria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar parceria.' });
    } finally {
        if (connection) connection.release();
    }
});

// PUT: Editar parceria existente
app.put('/api/parceria/:id', async (req, res) => {
    const { id } = req.params;
    // Campos ajustados: nome, contato, site_url
    const { nome, descricao, contato, site_url, logo_url } = req.body;

    if (!nome) {
        return res.status(400).json({ message: 'O nome da parceria é obrigatório.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            "UPDATE parceria SET nome = ?, descricao = ?, contato = ?, site_url = ?, logo_url = ? WHERE id_parceria = ?",
            [nome, descricao, contato, site_url, logo_url, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Parceria não encontrada.' });
        }
        res.json({ message: 'Parceria atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar parceria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar parceria.' });
    } finally {
        if (connection) connection.release();
    }
});

// PUT: Alternar status da parceria (ativo/inativo)
app.put('/api/parceria/:id/status', async (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body; // 'ativo' será um booleano (true/false) ou 1/0 do frontend

    // Converte para 1 ou 0 para o campo tinyint(1)
    const statusValue = ativo ? 1 : 0;

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            "UPDATE parceria SET ativo = ? WHERE id_parceria = ?",
            [statusValue, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Parceria não encontrada.' });
        }
        res.json({ message: `Status da parceria alterado para ${ativo ? 'ativo' : 'inativo'} com sucesso!` });
    } catch (error) {
        console.error('Erro ao alterar status da parceria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao alterar status da parceria.' });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE: Excluir parceria
app.delete('/api/parceria/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query("DELETE FROM parceria WHERE id_parceria = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Parceria não encontrada.' });
        }
        res.json({ message: 'Parceria excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir parceria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir parceria.' });
    } finally {
        if (connection) connection.release();
    }
});

app.put('/api/admin/contatos/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'resolvido', 'pendente', etc.

    if (!status) {
        return res.status(400).json({ message: 'Status não fornecido.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            `UPDATE contato SET status = ? WHERE id_contato = ?`,
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Contato não encontrado ou status já atualizado.' });
        }

        res.json({ message: 'Status do contato atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar status do contato:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar status do contato.' });
    } finally {
        if (connection) connection.release();
    }
});

// =================
// Aluguel de Salas
// =================

app.put('/api/admin/alugueis/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status_aluguel } = req.body; // Recebe o novo status do corpo da requisição

    if (!status_aluguel) {
        return res.status(400).json({ message: 'Status do aluguel é obrigatório.' });
    }

    // Validação básica do status_aluguel para evitar valores inválidos
    const statusValidos = ['pendente', 'aprovado', 'rejeitado', 'concluido'];
    if (!statusValidos.includes(status_aluguel)) {
        return res.status(400).json({ message: 'Status inválido. Valores permitidos: pendente, aprovado, rejeitado, concluido.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            "UPDATE aluguel_sala SET status_aluguel = ? WHERE id_aluguel = ?",
            [status_aluguel, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitação de aluguel não encontrada.' });
        }

        res.json({ message: 'Status do aluguel atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar status do aluguel:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar status do aluguel.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/salas', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [salas] = await connection.query('SELECT id_sala, nome_sala, capacidade_total FROM sala ORDER BY nome_sala');
        res.json(salas);
    } catch (error) {
        console.error('Erro ao buscar salas disponíveis:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar salas.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para registrar uma nova solicitação de aluguel de sala
app.post('/api/aluguel', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const id_usuario = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;

        // Dados recebidos do frontend
        const {
            id_sala,
            data_evento,
            horario_inicio,
            numero_convidados,
            finalidade,
            mensagem
        } = req.body;

        if (!id_sala || !data_evento || !horario_inicio || !numero_convidados || !finalidade) {
            return res.status(400).json({ message: 'Campos obrigatórios ausentes. Por favor, preencha todos os campos.' });
        }

        // Converte a data para o formato YYYY-MM-DD
        const dia_aluguel_db = new Date(data_evento).toISOString().split('T')[0];

        // Insere a solicitação de aluguel no banco de dados (sem horario_fim)
        const [result] = await connection.query(
            `INSERT INTO aluguel_sala (id_usuario, id_sala, dia_aluguel, horario_inicio, numero_convidados, finalidade, mensagem, status_aluguel)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
            [id_usuario, id_sala, dia_aluguel_db, horario_inicio, numero_convidados, finalidade, mensagem || '',]
        );

        res.status(201).json({ message: 'Solicitação de aluguel enviada com sucesso!', id_aluguel: result.insertId });

    } catch (error) {
        console.error('Erro ao processar solicitação de aluguel:', error);
        // Tratamento de erro mais específico para id_usuario NULL se a coluna for NOT NULL na DB
        if (error.code === 'ER_BAD_NULL_ERROR' && error.sqlMessage.includes("Column 'id_usuario'")) {
            return res.status(400).json({ message: 'Erro: id_usuario é obrigatório na tabela. Por favor, faça login ou altere sua tabela para aceitar nulo.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao solicitar aluguel.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/admin/usuarios', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [usuarios] = await connection.query(`
            SELECT id_usuario, nome, email, tipo, pontos_fidelidade, nivel_fidelidade, 
                   total_gasto, data_cadastro
            FROM usuario
            ORDER BY nome
        `);
        res.json(usuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/filmes/em-breve', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        // Filtra filmes onde a data de lançamento é no futuro
        const [filmesEmBreve] = await connection.query(
            "SELECT * FROM filme WHERE em_cartaz = 0",
        );
        res.json(filmesEmBreve);
    } catch (error) {
        console.error('Erro ao buscar filmes em breve:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao buscar filmes em breve.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter um filme específico
app.get('/api/filmes/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();
        const [filme] = await connection.query(
            "SELECT * FROM filme WHERE id_filme = ?",
            [id]
        );

        if (filme.length === 0) {
            return res.status(404).json({ message: "Filme não encontrado." });
        }

        res.json(filme[0]);
    } catch (error) {
        console.error('Erro ao buscar filme:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para adicionar, atualizar e excluir filmes (admin)
app.post('/api/admin/filmes', (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        let connection;
        try {
            const {
                titulo,
                sinopse,
                genero,
                duracao,
                classificacao_indicativa,
                trailer_url,
                data_lancamento,
                em_cartaz,
                em_votacao
            } = req.body;

            let poster_url = '';
            if (req.file) {
                poster_url = '/posters/' + req.file.filename;
            }

            const valuesToInsert = [
                titulo,
                sinopse,
                genero,
                duracao,
                classificacao_indicativa,
                data_lancamento,
                trailer_url,
                poster_url,
                em_cartaz,
                em_votacao // O 10º valor
            ];

            // ADICIONE ESTE CONSOLE.LOG PARA VER OS VALORES EXATOS ANTES DA QUERY
            console.log('Valores que serão inseridos:', valuesToInsert);
            console.log('Número de valores:', valuesToInsert.length);

            connection = await db.getConnection();
            const [result] = await connection.query(
                `INSERT INTO filme 
                 (titulo, sinopse, genero, duracao, classificacao_indicativa, data_lancamento, trailer_url, poster_url, em_cartaz, em_votacao) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                valuesToInsert // Usamos o array que acabamos de logar
            );

            res.status(201).json({
                message: "Filme adicionado com sucesso!",
                id: result.insertId
            });
        } catch (error) {
            console.error('Erro ao adicionar filme:', error);
            console.error(error);
            res.status(500).json({ error: 'Erro interno do servidor.' });
        } finally {
            if (connection) connection.release();
        }
    });
});

app.put('/api/admin/filmes/:id', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                error: 'Apenas imagens são permitidas (JPEG, JPG, PNG, GIF)'
            });
        }

        let connection;
        try {
            const { id } = req.params;
            const {
                titulo,
                sinopse,
                genero,
                duracao,
                classificacao_indicativa,
                trailer_url,
                em_cartaz,
                em_votacao,
                manter_poster
            } = req.body;

            connection = await getConn();

            // Obter filme existente para pegar o poster atual
            const [filmeExistente] = await connection.query(
                'SELECT poster_url FROM filme WHERE id_filme = ?',
                [id]
            );

            if (!filmeExistente.length) {
                return res.status(404).json({ error: 'Filme não encontrado' });
            }

            let poster_url = filmeExistente[0].poster_url;

            // Se enviou novo poster
            if (req.file) {
                // Remove o poster antigo se existir
                if (poster_url) {
                    const oldPath = path.join(__dirname, 'public', poster_url);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                poster_url = '/posters/' + req.file.filename;
            } else if (!manter_poster) {
                return res.status(400).json({ error: 'Poster é obrigatório' });
            }

            // Atualiza no banco de dados
            const [result] = await connection.query(
                `UPDATE filme SET 
                 titulo = ?, sinopse = ?, genero = ?, duracao = ?, 
                 classificacao_indicativa = ?, trailer_url = ?, poster_url = ?, 
                 em_cartaz = ?, em_votacao = ?
                 WHERE id_filme = ?`,
                [
                    titulo, sinopse, genero, duracao,
                    classificacao_indicativa, trailer_url, poster_url,
                    em_cartaz, em_votacao, id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Filme não encontrado' });
            }

            res.json({ message: 'Filme atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar filme:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        } finally {
            if (connection) connection.release();
        }
    });
});

app.put('/api/admin/filmes/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { titulo,
            sinopse,
            genero,
            duracao,
            classificacao_indicativa
        } = req.body;

        connection = await db.getConnection();
        const [result] = await connection.query(
            "UPDATE filme SET titulo = ?, sinopse = ?, duracao = ?, genero = ?, classificacao_indicativa = ?, url_imagem = ? WHERE id_filme = ?",
            [titulo, sinopse, duracao, genero, classificacao_indicativa, url_imagem, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Filme não encontrado." });
        }

        res.json({ message: "Filme atualizado com sucesso!" });
    } catch (error) {
        console.error('Erro ao atualizar filme:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao atualizar filme.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

app.delete('/api/admin/filmes/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await getDbConnection();

        // Primeiro verifique se há sessões com este filme
        const [sessoes] = await connection.query(
            "SELECT id_sessao FROM sessao WHERE id_filme = ?",
            [id]
        );

        if (sessoes.length > 0) {
            return res.status(400).json({
                message: "Não é possível excluir o filme pois existem sessões associadas a ele."
            });
        }

        const [result] = await connection.query(
            "DELETE FROM filme WHERE id_filme = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Filme não encontrado." });
        }

        res.json({ message: "Filme excluído com sucesso!" });
    } catch (error) {
        console.error('Erro ao excluir filme:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/api/contato', async (req, res) => {
    let connection;
    try {
        const { name, email, subject, message } = req.body;

        // Validação básica
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        connection = await db.getConnection();
        const [result] = await connection.query(
            "INSERT INTO contato (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)",
            [name, email, subject, message]
        );

        res.status(201).json({ message: "Mensagem enviada com sucesso! Em breve entraremos em contato." });

    } catch (error) {
        console.error('Erro ao salvar mensagem de contato:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao enviar mensagem de contato.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter itens de uma compra específica
app.get('/api/compras/:id/itens', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();

        const [itens] = await connection.query(`
      SELECT 
        ic.tipo_item,
        ic.nome_item,
        ic.quantidade,
        ic.preco_unitario
      FROM item_compra ic
      WHERE ic.id_compra = ?
    `, [id]);

        if (!itens.length) {
            return res.status(404).json({ message: "Nenhum item encontrado para essa compra." });
        }

        res.json(itens);
    } catch (error) {
        console.error('Erro ao buscar itens da compra:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/purchases', async (req, res) => {
    let connection;
    try {
        // Remova a linha abaixo, pois não usaremos mais o userId do header
        // const userId = req.headers['x-user-id']; 
        // if (!userId) {
        //     return res.status(400).json({ message: "ID do usuário não fornecido." });
        // }

        connection = await db.getConnection();
        // A consulta SQL agora irá buscar todas as compras, sem filtrar por id_usuario
        const [purchases] = await connection.query(
            "SELECT id_compra, data_compra, valor_total, id_usuario FROM compra"
        );

        if (purchases.length === 0) {
            return res.json([]);
        }

        const purchasesWithItems = await Promise.all(purchases.map(async (purchase) => {
            const [items] = await connection.query(
                "SELECT tipo_item, id_referencia, nome_item, quantidade, preco_unitario FROM item_compra WHERE id_compra = ?",
                [purchase.id_compra]
            );
            return { ...purchase, items };
        }));

        res.json(purchasesWithItems);

    } catch (error) {
        console.error('Erro ao buscar histórico de compras:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao carregar histórico de compras.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter uma compra específica
app.get('/api/purchases/:id', async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();

        const [compra] = await connection.query(
            "SELECT * FROM compra WHERE id_compra = ?",
            [id]
        );

        if (compra.length === 0) {
            return res.status(404).json({ message: "Compra não encontrada." });
        }

        const [itens] = await connection.query(
            "SELECT * FROM item_compra WHERE id_compra = ?",
            [id]
        );

        res.json({
            ...compra[0],
            items: itens
        });
    } catch (error) {
        console.error('Erro ao buscar compra:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// No server.js, adicione esta nova rota GET
app.get('/api/carrinho/:userId', authenticateUser, async (req, res) => {
    let connection;
    try {
        const { userId } = req.params; // Obtém o userId da URL

        if (req.userId != userId && req.user.tipo !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado. Você só pode ver seu próprio carrinho.' });
        }

        connection = await db.getConnection();
        const [itensCarrinho] = await connection.query(
            'SELECT id_carrinho, id_usuario, tipo_item, id_referencia, quantidade, preco_unitario FROM carrinho WHERE id_usuario = ?',
            [userId]
        );

        // Para cada item no carrinho, você pode querer buscar detalhes adicionais
        // dependendo do tipo_item (filme, snack, etc.)
        const itensComDetalhes = await Promise.all(itensCarrinho.map(async (item) => {
            let detalhes = {};
            if (item.tipo_item === 'filme') {
                const [filme] = await connection.query('SELECT titulo as nome_item FROM filme WHERE id_filme = ?', [item.id_referencia]);
                detalhes = filme[0] || { nome_item: 'Filme Desconhecido' };
            } else if (item.tipo_item === 'snack') {
                const [snack] = await connection.query('SELECT nome as nome_item FROM snack WHERE id_snack = ?', [item.id_referencia]);
                detalhes = snack[0] || { nome_item: 'Snack Desconhecido' };
            }
            return { ...item, ...detalhes };
        }));

        res.json(itensComDetalhes);

    } catch (error) {
        console.error('Erro ao buscar itens do carrinho:', error);
        res.status(500).json({
            error: 'Erro interno do servidor ao carregar o carrinho.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) connection.release();
    }
});

// Adicionar item ao carrinho
app.post('/api/carrinho', authenticateUser, async (req, res) => {
    const { tipo_item, id_referencia, quantidade = 1, preco_unitario } = req.body;
    const userId = req.userId;            // vem dos headers x-user-id / x-user-type

    if (!tipo_item || !id_referencia || !preco_unitario)
        return res.status(400).json({ message: 'Dados obrigatórios ausentes.' });

    const conn = await db.getConnection();
    try {
        await conn.query(
            `INSERT INTO carrinho
         (id_usuario, tipo_item, id_referencia, quantidade, preco_unitario)
       VALUES (?,?,?,?,?)`,
            [userId, tipo_item, id_referencia, quantidade, preco_unitario]
        );
        res.status(201).json({ message: 'Item adicionado ao carrinho.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Erro ao adicionar item.' });
    } finally { conn.release(); }
});

app.put('/api/carrinho/:item_id/increase', authenticateUser, async (req, res) => {
    const { item_id } = req.params;
    const userId = req.userId;
    const conn = await db.getConnection();

    try {
        const [result] = await conn.query(`
            UPDATE carrinho
            SET quantidade = quantidade + 1
            WHERE id_carrinho = ? AND id_usuario = ?
        `, [item_id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item não encontrado ou não pertence ao usuário.' });
        }

        res.json({ message: 'Quantidade aumentada com sucesso.' });
    } catch (err) {
        console.error('Erro ao aumentar quantidade:', err);
        res.status(500).json({ message: 'Erro ao aumentar quantidade.' });
    } finally {
        conn.release();
    }
});

// Diminuir quantidade de um item do carrinho
app.put('/api/carrinho/:item_id/decrease', authenticateUser, async (req, res) => {
    const { item_id } = req.params;
    const userId = req.userId;
    const conn = await db.getConnection();

    try {
        const [result] = await conn.query(`
            UPDATE carrinho
            SET quantidade = quantidade - 1
            WHERE id_carrinho = ? AND id_usuario = ? AND quantidade > 1
        `, [item_id, userId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Quantidade mínima atingida ou item não encontrado.' });
        }

        res.json({ message: 'Quantidade diminuída com sucesso.' });
    } catch (err) {
        console.error('Erro ao diminuir quantidade:', err);
        res.status(500).json({ message: 'Erro ao diminuir quantidade.' });
    } finally {
        conn.release();
    }
});

/* --------------------------------------------------
 *  VOTAÇÃO DE FILMES
 * -------------------------------------------------*/

// 1.  Lista de candidatos (exibe filmes marcados "candidato" na tabela filme)
app.get('/api/votacao/candidatos', async (req, res) => {
    const conn = await getConn();
    try {
        const [rows] = await conn.query(`
      SELECT id_filme, titulo, poster_url, genero, sinopse
      FROM filme
      WHERE em_votacao = 1
    `);
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar candidatos:', err);
        res.status(500).json({ message: 'Erro ao buscar candidatos' });
    } finally {
        conn.release();
    }
});

// ===============================================
// Rotas de VOTAÇÃO para Usuário Comum
// ===============================================

// GET Tema da votação atual
// Esta rota não precisa de autenticação de admin, apenas busca o tema da votação ativa.
app.get('/api/votacao/tema', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        // Busca a votação mais recente e ativa (ajuste o ORDER BY e WHERE se tiver status_votacao)
        // Por exemplo: "WHERE status_votacao = 'ativa' ORDER BY data_inicio DESC LIMIT 1"
        const [rows] = await connection.query("SELECT id_votacao, tema_votacao FROM votacao ORDER BY id_votacao DESC LIMIT 1");

        if (rows.length > 0) {
            res.json({ id_votacao: rows[0].id_votacao, tema_votacao: rows[0].tema_votacao });
        } else {
            res.status(200).json({ id_votacao: null, tema_votacao: null, message: "Nenhuma votação ativa no momento." });
        }
    } catch (error) {
        console.error('Erro ao buscar tema da votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar tema da votação.' });
    } finally {
        if (connection) connection.release();
    }
});


// GET Filmes em votação para uma votação específica (candidatos)
// Esta rota também não precisa de autenticação de admin.
app.get('/api/votacao/:id_votacao/filmes', async (req, res) => {
    const { id_votacao } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [filmes] = await connection.query(
            `SELECT
                f.id_filme,
                f.titulo,
                f.genero,
                f.ano_lancamento,
                f.poster_url
             FROM filme f
             JOIN votacao_filmes vf ON f.id_filme = vf.id_filme
             WHERE vf.id_votacao = ?
             ORDER BY f.titulo ASC`, // Ou ORDER BY f.votos DESC, se quiser ordenar pelos mais votados
            [id_votacao]
        );
        res.json(filmes);
    } catch (error) {
        console.error('Erro ao buscar filmes da votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar filmes da votação.' });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/api/votacao/votar', authenticateUser, async (req, res) => {
    const { id_votacao, id_filme } = req.body;
    const userId = req.userId; // Obtém o userId do middleware authenticateUser
    let connection;

    if (!id_votacao || !id_filme || !userId) {
        return res.status(400).json({ message: 'Dados da votação incompletos.' });
    }

    try {
        connection = await db.getConnection();

        // 1. Verificar se o usuário já votou nesta votação usando a tabela `votos_usuario`
        const [votoExistente] = await connection.query(
            'SELECT * FROM votos_usuario WHERE id_usuario = ? AND id_votacao = ?',
            [userId, id_votacao]
        );

        if (votoExistente.length > 0) {
            return res.status(409).json({ message: 'Você já votou nesta sessão de votação.' });
        }

        // 2. Registrar o voto do usuário na tabela `votos_usuario`
        await connection.query(
            'INSERT INTO votos_usuario (id_votacao, id_usuario, id_filme_votado) VALUES (?, ?, ?)',
            [id_votacao, userId, id_filme]
        );

        // 3. Incrementar o contador de votos para o filme na tabela `votacao_filmes`
        const [result] = await connection.query(
            'UPDATE votacao_filmes SET votos = votos + 1 WHERE id_votacao = ? AND id_filme = ?',
            [id_votacao, id_filme]
        );

        if (result.affectedRows === 0) {
            // Isso pode ocorrer se a combinação id_votacao e id_filme não existir em votacao_filmes
            // (por exemplo, filme não foi adicionado como candidato para aquela votação).
            // O voto do usuário foi registrado em `votos_usuario`, mas o contador geral não.
            console.warn(`[WARN] Não foi possível incrementar votos para id_votacao: ${id_votacao}, id_filme: ${id_filme}. Verifique se o filme está listado em votacao_filmes para esta votação.`);
            return res.status(404).json({ message: 'Filme não encontrado na votação atual para atualizar o contador. O voto do usuário foi registrado, mas o total de votos do filme não foi incrementado.' });
        }

        res.status(200).json({ message: 'Voto registrado com sucesso!' });

    } catch (error) {
        console.error('Erro ao registrar voto:', error);
        // Em caso de erro de UNIQUE KEY (violado pelo 'votoExistente'), já tratamos.
        // Qualquer outro erro é um erro interno do servidor.
        res.status(500).json({ message: 'Erro interno do servidor ao registrar o voto.' });
    } finally {
        if (connection) connection.release();
    }
});

// GET: Retorna a parcial de resultados de uma votação específica (Pode ou não requerer autenticação)
app.get('/api/votacao/resultado/:id_votacao', authenticateUser, async (req, res) => { // Exemplo com authenticateUser, remova se for público
    const { id_votacao } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        // Soma os votos de votacao_filmes e traz o título do filme
        const [results] = await connection.query(
            `SELECT
                f.titulo,
                vf.votos
             FROM votacao_filmes vf
             JOIN filme f ON vf.id_filme = f.id_filme
             WHERE vf.id_votacao = ?
             ORDER BY vf.votos DESC, f.titulo ASC`,
            [id_votacao]
        );
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar resultados da votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar resultados da votação.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota pública para resultado da votação
app.get('/api/admin/votacao/resultados', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();

        // Resultados da votação (filmes e votos)
        const rodada = new Date().toISOString().slice(0, 7);
        const [resultados] = await connection.query(`
            SELECT f.titulo, COUNT(*) AS votos
            FROM votacao_filme v
            JOIN filme f ON f.id_filme = v.id_filme
            WHERE rodada = ?
            GROUP BY v.id_filme
            ORDER BY votos DESC
        `, [rodada]);

        res.json(resultados); // Agora retorna um array!
    } catch (error) {
        console.error('Erro ao buscar resultados da votação:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar resultados da votação.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter o tema da votação atual
app.get('/api/admin/votacao/tema', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        // Assumindo que você tem uma única votação ativa ou quer a mais recente
        const [rows] = await connection.query("SELECT id_votacao, tema_votacao FROM votacao ORDER BY id_votacao DESC LIMIT 1");

        if (rows.length > 0) {
            res.json({ id_votacao: rows[0].id_votacao, tema_votacao: rows[0].tema_votacao });
        } else {
            // Se não houver votação, pode retornar null ou um objeto vazio para o frontend lidar
            res.json({ id_votacao: null, tema_votacao: null });
        }
    } catch (error) {
        console.error('Erro ao buscar tema da votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar tema da votação.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para atualizar o tema da votação
app.put('/api/admin/votacao/tema/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { tema_votacao } = req.body;
    let connection;

    if (tema_votacao === undefined || tema_votacao === null) { // Permite string vazia, mas não undefined/null
        return res.status(400).json({ message: 'O tema da votação é obrigatório.' });
    }

    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            "UPDATE votacao SET tema_votacao = ? WHERE id_votacao = ?",
            [tema_votacao, id]
        );

        if (result.affectedRows === 0) {
            // Isso pode ocorrer se o ID da votação não existir ou o tema_votacao já for o mesmo.
            // Para ser mais preciso, você pode buscar antes de atualizar.
            const [existingVotacao] = await connection.query("SELECT id_votacao FROM votacao WHERE id_votacao = ?", [id]);
            if (existingVotacao.length === 0) {
                return res.status(404).json({ message: 'Votação não encontrada.' });
            } else {
                return res.status(200).json({ message: 'Tema da votação já estava atualizado.' });
            }
        }
        res.json({ message: 'Tema da votação atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar tema da votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar tema da votação.' });
    } finally {
        if (connection) connection.release();
    }
});

// ===============================================
// Rotas Admin - Dashboard e Gerenciamento
// ===============================================

// Listar todas as mensagens de contato
app.get('/api/admin/contatos', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [contatos] = await connection.query(
            "SELECT * FROM contato ORDER BY data_envio DESC"
        );
        res.json(contatos);
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter uma mensagem de contato específica
app.get('/api/admin/contatos/:id', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();
        const [contato] = await connection.query(
            "SELECT * FROM contato WHERE id_contato = ?",
            [id]
        );

        if (contato.length === 0) {
            return res.status(404).json({ message: "Mensagem não encontrada." });
        }

        res.json(contato[0]);
    } catch (error) {
        console.error('Erro ao buscar mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Excluir mensagem de contato
app.delete('/api/admin/contatos/:id', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await db.getConnection();
        const [result] = await connection.query(
            "DELETE FROM contato WHERE id_contato = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Mensagem não encontrada." });
        }

        res.json({ message: "Mensagem excluída com sucesso!" });
    } catch (error) {
        console.error('Erro ao excluir mensagem:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// ===============================================
// Rotas de Aluguel de Sala
// ===============================================

app.get('/api/admin/alugueis', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [alugueis] = await connection.query(
            "SELECT id_aluguel, s.nome_sala, u.nome AS nome_usuario, dia_aluguel, horario_inicio, finalidade, mensagem, status_aluguel " +
            "FROM aluguel_sala als " +
            "JOIN sala s ON als.id_sala = s.id_sala " +
            "JOIN usuario u ON als.id_usuario = u.id_usuario " +
            "ORDER BY dia_aluguel DESC, horario_inicio DESC"
        );
        res.json(alugueis);
    } catch (error) {
        console.error('Erro ao buscar aluguéis para admin:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar aluguéis.' });
    } finally {
        if (connection) connection.release();
    }
});

// Detalhes de um aluguel específico (para loadAluguelDetails em admin.js)
app.get('/api/admin/alugueis/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [alugueis] = await connection.query(
            `SELECT
                a.id_aluguel,
                a.id_sala,
                s.nome_sala,
                a.id_usuario,
                u.nome AS nome_usuario,
                a.dia_aluguel,
                a.horario_inicio,
                a.finalidade,
                a.mensagem,
                a.status_aluguel
             FROM
                aluguel_sala a
             JOIN
                sala s ON a.id_sala = s.id_sala
             JOIN
                usuario u ON a.id_usuario = u.id_usuario
             WHERE
                a.id_aluguel = ?`,
            [id]
        );

        if (alugueis.length === 0) {
            return res.status(404).json({ message: 'Aluguel não encontrado.' });
        }
        
        res.json(alugueis[0]);
    } catch (error) {
        console.error('Erro ao buscar detalhes do aluguel:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar aluguel.' });
    } finally {
        if (connection) connection.release();
    }
});

// Atualizar status do aluguel
app.put('/api/admin/alugueis/:id', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { status_aluguel } = req.body;

        if (!status_aluguel || !['pendente', 'confirmado', 'cancelado'].includes(status_aluguel)) {
            return res.status(400).json({ message: "Status inválido." });
        }

        connection = await db.getConnection();
        const [result] = await connection.query(
            "UPDATE aluguel_sala SET status_aluguel = ? WHERE id_aluguel = ?",
            [status_aluguel, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Aluguel não encontrado." });
        }

        res.json({ message: "Status do aluguel atualizado com sucesso!" });
    } catch (error) {
        console.error('Erro ao atualizar aluguel:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Listar todos os filmes (admin)
app.get('/api/admin/filmes', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        connection = await getDbConnection();
        const [filmes] = await connection.query(
            "SELECT * FROM filme ORDER BY titulo ASC"
        );
        res.json(filmes);
    } catch (error) {
        console.error('Erro ao buscar filmes:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Listar filmes em votação
app.get('/api/admin/filmes/votacao', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        connection = await getDbConnection();
        const [filmes] = await connection.query(
            "SELECT * FROM filme WHERE em_votacao = 1"
        );
        res.json(filmes);
    } catch (error) {
        console.error('Erro ao buscar filmes em votação:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Atualizar a rota PUT para filmes
app.put('/api/admin/filmes/:id/cartaz', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { em_cartaz } = req.body;

        connection = await getConn();
        const [result] = await connection.query(
            "UPDATE filme SET em_cartaz = ? WHERE id_filme = ?",
            [em_cartaz, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Filme não encontrado." });
        }

        res.json({
            message: em_cartaz ?
                "Filme adicionado ao cartaz com sucesso!" :
                "Filme removido do cartaz com sucesso!"
        });
    } catch (error) {
        console.error('Erro ao atualizar status do cartaz:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Atualizar status de votação do filme
app.put('/api/admin/filmes/:id/votacao', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { em_votacao } = req.body;

        connection = await getConn();
        await connection.beginTransaction();

        // Atualizar status do filme
        const [result] = await connection.query(
            "UPDATE filme SET em_votacao = ? WHERE id_filme = ?",
            [em_votacao, id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Filme não encontrado." });
        }

        // Se estiver removendo da votação, apagar os votos associados
        if (!em_votacao) {
            await connection.query(
                "DELETE FROM votacao_filme WHERE id_filme = ?",
                [id]
            );
        }

        await connection.commit();

        res.json({
            message: em_votacao ?
                "Filme adicionado à votação com sucesso!" :
                "Filme removido da votação com sucesso!"
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao atualizar status de votação:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

app.post('/api/admin/votacao/rodadas', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        const { nome, data_inicio, data_fim } = req.body;

        connection = await getConn();
        const [result] = await connection.query(
            "INSERT INTO rodada_votacao (nome, data_inicio, data_fim) VALUES (?, ?, ?)",
            [nome, data_inicio, data_fim]
        );

        res.status(201).json({
            message: "Rodada de votação criada com sucesso!",
            id: result.insertId
        });
    } catch (error) {
        console.error('Erro ao criar rodada de votação:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// Resultados da votação
app.get('/api/admin/votacao/resultados', authenticateAdmin, async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();

        const [resultados] = await connection.query(`
            SELECT
                (SELECT COUNT(*) FROM usuario) as totalUsuarios,
                (SELECT IFNULL(SUM(valor_total), 0) FROM compra) as totalVendas,
                (SELECT COUNT(*) FROM filme WHERE em_cartaz = 1) as filmesEmCartaz,
                (SELECT COUNT(*) FROM filme WHERE em_votacao = 1) as filmesEmVotacao,
                (SELECT COUNT(*) FROM aluguel_sala WHERE status_aluguel = 'pendente') as alugueis_pendentes,
                (SELECT COUNT(*) FROM contato) as totalContatos
        `);

        // Extrair os dados do primeiro (e único) resultado
        const dashboardData = resultados[0];

        res.json({
            totalVendas: dashboardData.totalVendas,
            totalUsuarios: dashboardData.totalUsuarios,
            filmesEmVotacao: dashboardData.filmesEmVotacao,
            filmesEmCartaz: dashboardData.filmesEmCartaz,
            alugueisPendentes: dashboardData.alugueis_pendentes,
            contatosPendentes: dashboardData.totalContatos, // Usando o nome da coluna da query
            // Se você tiver mais métricas como 'snacksVendidos',
            // adicione-as aqui também, garantindo que o SQL as selecione
            snacksVendidos: 0 // Placeholder, se não houver query ainda
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao buscar dados do dashboard.' });
    } finally {
        if (connection) connection.release();
    }
});

// ===============================================
// Rotas de Admin - Gerenciamento de Filmes na Votação
// ===============================================

// GET filmes atualmente em uma votação específica
app.get('/api/admin/votacao/:id_votacao/filmes', authenticateAdmin, async (req, res) => {
    const { id_votacao } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [filmes] = await connection.query(
            `SELECT
                f.id_filme,
                f.titulo,
                f.genero,
                f.data_lancamento,
                vf.votos
             FROM filme f
             JOIN votacao_filmes vf ON f.id_filme = vf.id_filme
             WHERE vf.id_votacao = ?
             ORDER BY vf.votos DESC, f.titulo ASC`,
            [id_votacao]
        );
        res.json(filmes);
    } catch (error) {
        console.error('Erro ao buscar filmes da votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar filmes da votação.' });
    } finally {
        if (connection) connection.release();
    }
});

// GET filmes disponíveis para adicionar à votação (filmes que NÃO estão na votação atual)
app.get('/api/admin/filmes/available-for-voting/:id_votacao', authenticateAdmin, async (req, res) => {
    const { id_votacao } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [filmes] = await connection.query(
            `SELECT id_filme, titulo, genero, data_lancamento
             FROM filme
             WHERE id_filme NOT IN (
                 SELECT id_filme FROM votacao_filmes WHERE id_votacao = ?
             ) ORDER BY titulo ASC`,
            [id_votacao]
        );
        res.json(filmes);
    } catch (error) {
        console.error('Erro ao buscar filmes disponíveis para votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar filmes disponíveis.' });
    } finally {
        if (connection) connection.release();
    }
});

// POST para adicionar filmes à votação
app.post('/api/admin/votacao/:id_votacao/add-filmes', authenticateAdmin, async (req, res) => {
    const { id_votacao } = req.params;
    const { filmes_ids } = req.body; // array de IDs de filmes

    if (!Array.isArray(filmes_ids) || filmes_ids.length === 0) {
        return res.status(400).json({ message: 'Nenhum filme selecionado para adicionar.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const values = filmes_ids.map(filmeId => [id_votacao, filmeId, 0]); // Inicializa votos com 0

        // Usar INSERT IGNORE para evitar erros se um filme já estiver na votação
        const [result] = await connection.query(
            "INSERT IGNORE INTO votacao_filmes (id_votacao, id_filme, votos) VALUES ?",
            [values]
        );

        await connection.commit();
        res.status(200).json({ message: `${result.affectedRows} filme(s) adicionado(s) à votação.` });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao adicionar filmes à votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar filmes à votação.' });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE para remover um filme da votação
app.delete('/api/admin/votacao/:id_votacao/filmes/:id_filme', authenticateAdmin, async (req, res) => {
    const { id_votacao, id_filme } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            "DELETE FROM votacao_filmes WHERE id_votacao = ? AND id_filme = ?",
            [id_votacao, id_filme]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Filme não encontrado nesta votação.' });
        }
        res.json({ message: 'Filme removido da votação com sucesso.' });
    } catch (error) {
        console.error('Erro ao remover filme da votação:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao remover filme da votação.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para resetar votos de uma votação 
app.put('/api/admin/votacao/:id_votacao/reset-votos', authenticateAdmin, async (req, res) => {
    const { id_votacao } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Zera os votos na tabela votacao_filmes
        await connection.query(
            "UPDATE votacao_filmes SET votos = 0 WHERE id_votacao = ?",
            [id_votacao]
        );

        // 2. Remove todos os registros da tabela votos_usuario para essa votação
        await connection.query(
            "DELETE FROM votos_usuario WHERE id_votacao = ?",
            [id_votacao]
        );

        await connection.commit();
        res.json({ message: 'Todos os votos foram resetados com sucesso!' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Erro ao resetar votos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao resetar votos.' });
    } finally {
        if (connection) connection.release();
    }
});

// ===============================================
// Rotas de Contato
// ===============================================

app.get('/api/contatos', async (req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
    let connection;
    try {
        connection = await db.getConnection();
        const [contatos] = await connection.query(
            "SELECT * FROM contato ORDER BY data_envio DESC"
        );
        res.json(contatos);
    } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        if (connection) connection.release();
    }
});

// ===============================================
// Rotas de Gerenciamento de Parcerias (Admin)
// ===============================================

// Rota para listar todas as parcerias (admin)
app.get('/api/admin/parcerias', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        const [parcerias] = await connection.query(
            "SELECT id_parceria, nome, descricao, logo_url, site_url, contato, ativo FROM parceria ORDER BY nome ASC"
        );
        res.json(parcerias);
    } catch (error) {
        console.error('Erro ao buscar parcerias (admin):', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar parcerias.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter detalhes de uma única parceria (para edição)
app.get('/api/admin/parcerias/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [parcerias] = await connection.query(
            'SELECT id_parceria, nome, descricao, logo_url, site_url, contato, ativo FROM parceria WHERE id_parceria = ?',
            [id]
        );

        if (parcerias.length === 0) {
            return res.status(404).json({ message: 'Parceria não encontrada.' });
        }

        res.json(parcerias[0]);
    } catch (error) {
        console.error(`Erro ao buscar parceria ${id}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar parceria.' });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para adicionar uma nova parceria
app.post('/api/admin/parcerias', authenticateAdmin, uploadParcerias.single('logo_file'), async (req, res) => {
    const { nome, descricao, site_url, contato } = req.body;
    const ativo = req.body.ativo === 'true' || req.body.ativo === '1';

    let logo_url = null;
    if (req.file) {
        logo_url = `/assets/img/parcerias/${req.file.filename}`;
    }

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            'INSERT INTO parceria (nome, descricao, logo_url, site_url, contato, ativo) VALUES (?, ?, ?, ?, ?, ?)',
            [nome, descricao, logo_url, site_url, contato, ativo]
        );
        res.status(201).json({ message: 'Parceria adicionada com sucesso!', id: result.insertId, logo_url: logo_url });
    } catch (error) {
        console.error('Erro ao adicionar parceria:', error);
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Erro ao excluir arquivo de logo após falha na inserção:', err);
            });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao adicionar parceria.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.put('/api/admin/parcerias/:id', authenticateAdmin, uploadParcerias.single('logo_file'), async (req, res) => {
    console.log('🔍 === DEBUGGING BACKEND PUT ===');
    console.log('📝 ID recebido:', req.params.id);
    console.log('📁 Arquivo recebido:', req.file ? 'SIM' : 'NÃO');
    if (req.file) {
        console.log('📁 Detalhes do arquivo:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });
    }
    console.log('📋 Body recebido:', req.body);
    console.log('🔍 ========================');

    const { id } = req.params;

    if (!id || isNaN(id)) {
        console.log('❌ ID inválido:', id);
        return res.status(400).json({ message: 'ID de parceria inválido' });
    }

    const { nome, descricao, site_url, contato, logo_url_existing } = req.body;
    const ativo = req.body.ativo === 'true' || req.body.ativo === '1';

    let connection;
    try {
        connection = await db.getConnection();
        console.log('✅ Conexão com o banco obtida');

        const [existingParceria] = await connection.query(
            'SELECT id_parceria, logo_url FROM parceria WHERE id_parceria = ?',
            [id]
        );

        console.log('🔍 Parceria existente encontrada:', existingParceria.length > 0 ? 'SIM' : 'NÃO');
        if (existingParceria.length > 0) {
            console.log('📝 Dados da parceria atual:', existingParceria[0]);
        }

        if (existingParceria.length === 0) {
            console.log('❌ Parceria não encontrada para ID:', id);
            return res.status(404).json({ message: 'Parceria não encontrada' });
        }

        let logo_url_to_save;
        let old_logo_path = null;

        if (existingParceria[0].logo_url) {
            old_logo_path = path.join(__dirname, 'public', existingParceria[0].logo_url);
            console.log('📁 Caminho da logo antiga:', old_logo_path);
        }

        if (req.file) {
            // ✅ CORRIGIDO: Usar o caminho correto
            logo_url_to_save = `/assets/img/parcerias/${req.file.filename}`;
            console.log('📁 Nova logo será salva como:', logo_url_to_save);

            if (old_logo_path && fs.existsSync(old_logo_path) &&
                !old_logo_path.includes('placeholder')) {
                console.log('🗑️ Tentando excluir logo antiga:', old_logo_path);
                fs.unlink(old_logo_path, (err) => {
                    if (err) console.error('❌ Erro ao excluir logo antiga:', err);
                    else console.log('✅ Logo antiga excluída com sucesso');
                });
            }
        } else {
            logo_url_to_save = logo_url_existing || existingParceria[0].logo_url;
            console.log('📁 Mantendo logo existente:', logo_url_to_save);
        }

        console.log('💾 Preparando UPDATE com dados:');
        console.log('   - nome:', nome);
        console.log('   - descricao:', descricao);
        console.log('   - logo_url:', logo_url_to_save);
        console.log('   - site_url:', site_url);
        console.log('   - contato:', contato);
        console.log('   - ativo:', ativo);
        console.log('   - id:', id);

        const [result] = await connection.query(
            'UPDATE parceria SET nome = ?, descricao = ?, logo_url = ?, site_url = ?, contato = ?, ativo = ? WHERE id_parceria = ?',
            [nome, descricao, logo_url_to_save, site_url, contato, ativo, id]
        );

        console.log('💾 Resultado do UPDATE:', result);

        if (result.affectedRows === 0) {
            console.log('❌ Nenhuma linha foi afetada no UPDATE');
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Erro ao excluir arquivo recém-carregado:', err);
                });
            }
            return res.status(404).json({ message: 'Nenhuma parceria foi atualizada' });
        }

        console.log('✅ Parceria atualizada com sucesso!');
        res.status(200).json({
            message: 'Parceria atualizada com sucesso!',
            new_logo_url: logo_url_to_save
        });

    } catch (error) {
        console.error('❌ ERRO COMPLETO:', error);
        console.error('❌ STACK TRACE:', error.stack);
        console.error('❌ CÓDIGO DO ERRO:', error.code);
        console.error('❌ ERRNO:', error.errno);

        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Erro ao excluir arquivo de logo:', err);
            });
        }
        res.status(500).json({
            message: 'Erro interno do servidor',
            error: error.message
        });
    } finally {
        if (connection) {
            console.log('🔌 Liberando conexão com o banco');
            connection.release();
        }
    }
});

// Rota para atualizar o status de uma parceria (ativar/desativar)
app.put('/api/admin/parcerias/:id/status', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body; // 'ativo' virá como booleano do frontend

    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            'UPDATE parceria SET ativo = ? WHERE id_parceria = ?',
            [ativo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Parceria não encontrada.' });
        }

        res.status(200).json({ message: `Parceria ${ativo ? 'habilitada' : 'desabilitada'} com sucesso!`, id: id, newStatus: ativo });
    } catch (error) {
        console.error('❌ ERRO COMPLETO:', error); // ✅ Adicione este log
        console.error('❌ STACK:', error.stack);   // ✅ E este também
        console.error(`Erro ao mudar status da parceria ${id}:`, error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar status da parceria.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// Rota para excluir uma parceria
app.delete('/api/admin/parcerias/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await db.getConnection();
        const [result] = await connection.query(
            'DELETE FROM parceria WHERE id_parceria = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Parceria não encontrada para exclusão.' });
        }

        res.status(200).json({ message: 'Parceria excluída com sucesso!' });
    } catch (error) {
        console.error(`Erro ao excluir parceria ${id}:`, error);
        // Erro 23000 é para FOREIGN KEY constraint (MySQL)
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            res.status(409).json({ message: 'Não é possível excluir esta parceria, pois há registros associados a ela (ex: em outras tabelas do banco de dados).' });
        } else {
            res.status(500).json({ message: 'Erro interno do servidor ao excluir parceria.' });
        }
    } finally {
        if (connection) connection.release();
    }
});

// Rota para obter o dashboard de administração
app.get('/api/admin/dashboard', async (req, res) => {
    let connection;
    try {
        // Use seu pool de conexões existente
        connection = await db.getConnection();

        // Query para dados totais principais
        const [dadosTotais] = await connection.query(`
            SELECT 
                IFNULL((SELECT SUM(valor_total) FROM compra), 0) AS total_vendas,
                (SELECT COUNT(*) FROM usuario WHERE tipo = 'comum') AS total_usuarios,
                (SELECT COUNT(*) FROM filme WHERE em_cartaz = 1) AS filmes_cartaz,
                (SELECT COUNT(*) FROM filme) AS total_filmes,
                (SELECT COUNT(*) FROM aluguel_sala WHERE status_aluguel = 'pendente') AS alugueis_pendentes,
                (SELECT COUNT(*) FROM contato WHERE status = 'pendente') AS contatos_pendentes,
                IFNULL((SELECT SUM(quantidade) FROM item_compra WHERE tipo_item = 'snack'), 0) AS snacks_vendidos,
                (SELECT COUNT(*) FROM filme WHERE em_votacao = 1) AS filmes_votacao,
                
                -- Novos cálculos
                IFNULL((
                    SELECT AVG(valor_total) 
                    FROM compra 
                    WHERE valor_total > 0
                ), 0) AS ticket_medio,
                
                IFNULL((
                    SELECT AVG(
                        CASE 
                            WHEN s.capacidade_total > 0 AND a.numero_convidados IS NOT NULL
                            THEN (a.numero_convidados * 100.0 / s.capacidade_total)
                            ELSE 0 
                        END
                    )
                    FROM aluguel_sala a
                    JOIN sala s ON a.id_sala = s.id_sala
                    WHERE a.status_aluguel = 'confirmado'
                    AND a.numero_convidados IS NOT NULL
                ), 0) AS taxa_ocupacao
        `);

        // Query para filme mais popular (por votos)
        const [filmeMaisPopular] = await connection.query(`
            SELECT 
                f.titulo,
                COUNT(v.id_voto) as votos
            FROM filme f
            LEFT JOIN votos_usuario v ON f.id_filme = v.id_filme_votado
            WHERE f.em_votacao = 1
            GROUP BY f.id_filme, f.titulo
            ORDER BY votos DESC
            LIMIT 1
        `);

        // ✅ CORRIGIDA: Query para snack mais vendido
        const [snackMaisVendido] = await connection.query(`
            SELECT 
                nome_item,
                SUM(quantidade) as quantidade
            FROM item_compra
            WHERE tipo_item = 'snack'
            GROUP BY nome_item
            ORDER BY quantidade DESC
            LIMIT 1
        `);

        // Query para vendas por mês (últimos 12 meses)
        const [vendasPorMes] = await connection.query(`
            SELECT 
                DATE_FORMAT(data_compra, '%m/%Y') AS mes_ano,
                SUM(valor_total) AS total_vendas,
                COUNT(*) as total_compras
            FROM compra
            WHERE data_compra >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY mes_ano
            ORDER BY STR_TO_DATE(CONCAT('01/', mes_ano), '%d/%m/%Y')
        `);

        // ✅ JÁ ESTAVA CORRETA: Query para usuários por mês (últimos 12 meses)
        const [usuariosPorMes] = await connection.query(`
            SELECT 
                DATE_FORMAT(data_cadastro, '%m/%Y') AS mes_ano,
                COUNT(*) AS total_usuarios
            FROM usuario
            WHERE tipo = 'comum' 
            AND data_cadastro >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            AND data_cadastro IS NOT NULL
            GROUP BY YEAR(data_cadastro), MONTH(data_cadastro), mes_ano
            ORDER BY YEAR(data_cadastro), MONTH(data_cadastro)
        `);

        // Query para top 3 filmes por votos
        // const [topFilmes] = await connection.query(`
        //     SELECT 
        //         f.titulo, 
        //         COUNT(DISTINCT c.id) as total_vendas
        //     FROM filme f
        //     LEFT JOIN compra c ON f.id_filme = c.id_filme  -- Certifique-se do nome correto da coluna
        //     WHERE f.em_cartaz = 1
        //     GROUP BY f.id_filme, f.titulo
        //     HAVING total_vendas >= 0
        //     ORDER BY total_vendas DESC
        //     LIMIT 5
        // `);

        // ✅ CORRIGIDA: Query para top 5 snacks vendidos
        const [topSnacks] = await connection.query(`
            SELECT 
                nome_item,
                SUM(quantidade) as quantidade
            FROM item_compra
            WHERE tipo_item = 'snack'
            GROUP BY nome_item
            HAVING quantidade > 0
            ORDER BY quantidade DESC
            LIMIT 5
        `);

        // Query para aluguéis por status
        const [aluguelPorStatus] = await connection.query(`
            SELECT 
                status_aluguel as status,
                COUNT(*) as quantidade
            FROM aluguel_sala
            GROUP BY status_aluguel
            HAVING quantidade > 0
        `);

        // ✅ CORRIGIDA: Query para dados de produtos mais vendidos (geral)
        const [produtosMaisVendidos] = await connection.query(`
            SELECT 
                nome_item,
                tipo_item,
                SUM(quantidade) as quantidade_total,
                SUM(preco_unitario * quantidade) as receita_total
            FROM item_compra
            GROUP BY nome_item, tipo_item
            ORDER BY quantidade_total DESC
            LIMIT 10
        `);

        // Query para análise temporal de crescimento
        const [crescimentoMensal] = await connection.query(`
            SELECT 
                DATE_FORMAT(data_compra, '%m/%Y') AS mes_ano,
                SUM(valor_total) AS vendas,
                COUNT(DISTINCT id_usuario) AS usuarios_ativos,
                COUNT(*) AS total_transacoes,
                AVG(valor_total) AS ticket_medio_mes
            FROM compra
            WHERE data_compra >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY mes_ano
            ORDER BY STR_TO_DATE(CONCAT('01/', mes_ano), '%d/%m/%Y')
        `);

        // ✅ DEBUG: Adicione logs para verificar os dados
        console.log('=== DEBUG DASHBOARD ===');
        console.log('Dados totais:', dadosTotais[0]);
        console.log('Snack mais vendido:', snackMaisVendido);
        console.log('Usuários por mês:', usuariosPorMes.length, 'registros');
        console.log('Top snacks:', topSnacks.length, 'registros');
        console.log('========================');

        // Formatar resposta completa
        const dashboardData = {
            // Métricas principais - CONVERTER TUDO PARA NUMBER
            totalVendas: parseFloat(dadosTotais[0].total_vendas || 0),
            totalUsuarios: parseInt(dadosTotais[0].total_usuarios || 0),
            filmesVotacao: parseInt(dadosTotais[0].filmes_votacao || 0),
            totalFilmes: parseInt(dadosTotais[0].total_filmes || 0),
            alugueisPendentes: parseInt(dadosTotais[0].alugueis_pendentes || 0),
            contatosPendentes: parseInt(dadosTotais[0].contatos_pendentes || 0),
            snacksVendidos: parseInt(dadosTotais[0].snacks_vendidos || 0),

            // Novas métricas
            ticketMedio: parseFloat(dadosTotais[0].ticket_medio || 0),
            taxaOcupacao: parseFloat(dadosTotais[0].taxa_ocupacao || 0),

            // Filme e snack mais populares
            filmeMaisPopular: filmeMaisPopular.length > 0 ? {
                titulo: filmeMaisPopular[0].titulo,
                votos: parseInt(filmeMaisPopular[0].votos || 0)
            } : null,

            // ✅ CORRIGIDO: Snack mais vendido
            snackMaisVendido: snackMaisVendido.length > 0 ? {
                nome: snackMaisVendido[0].nome_item,
                quantidade: parseInt(snackMaisVendido[0].quantidade || 0)
            } : null,

            // Dados para gráficos principais
            vendasPorMes: vendasPorMes.map(item => ({
                mes_ano: item.mes_ano,
                total_vendas: Number(item.total_vendas || 0),
                total_compras: Number(item.total_compras || 0)
            })),

            usuariosPorMes: usuariosPorMes.map(item => ({
                mes_ano: item.mes_ano,
                total_usuarios: Number(item.total_usuarios || 0)
            })),

            // Dados para novos gráficos
            // topFilmes: filmesParaGrafico.map(item => ({
            //     titulo: item.titulo,  // Mantém 'titulo' como chave
            //     total_vendas: Number(item.total_vendas || 0)
            // })),

            // ✅ CORRIGIDO: Top snacks
            topSnacks: topSnacks.map(item => ({
                nome: item.nome_item,
                quantidade: Number(item.quantidade || 0)
            })),

            aluguelPorStatus: aluguelPorStatus.map(item => ({
                status: item.status,
                quantidade: Number(item.quantidade || 0)
            })),

            // ✅ CORRIGIDO: Produtos mais vendidos
            produtosMaisVendidos: produtosMaisVendidos.map(item => ({
                nome: item.nome_item,
                tipo: item.tipo_item,
                quantidade: Number(item.quantidade_total || 0),
                receita: Number(item.receita_total || 0)
            })),

            crescimentoMensal: crescimentoMensal.map(item => ({
                mes_ano: item.mes_ano,
                vendas: Number(item.vendas || 0),
                usuarios_ativos: Number(item.usuarios_ativos || 0),
                transacoes: Number(item.total_transacoes || 0),
                ticket_medio: Number(item.ticket_medio_mes || 0)
            }))
        };

        console.log('Dashboard data completa:', dashboardData); // Para debug
        res.json(dashboardData);

    } catch (error) {
        console.error('Erro na dashboard:', error);
        console.error('Stack trace:', error.stack); // ✅ Para debug mais detalhado
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message,
            // Dados padrão em caso de erro
            totalVendas: 0,
            totalUsuarios: 0,
            filmesVotacao: 0,
            totalFilmes: 0,
            alugueisPendentes: 0,
            contatosPendentes: 0,
            snacksVendidos: 0,
            ticketMedio: 0,
            taxaOcupacao: 0,
            filmeMaisPopular: null,
            snackMaisVendido: null,
            vendasPorMes: [],
            usuariosPorMes: [],
            // topFilmes: [],
            topSnacks: [],
            aluguelPorStatus: [],
            produtosMaisVendidos: [],
            crescimentoMensal: []
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Rota adicional para relatórios mais detalhados (opcional)
app.get('/api/admin/dashboard/detalhado', async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();

        // Análise por período personalizado
        const periodo = req.query.periodo || '30'; // dias

        // Métricas avançadas
        const [metricas] = await connection.query(`
            SELECT 
                -- Receita por categoria
                SUM(CASE WHEN ic.tipo_item = 'ingresso' THEN ic.preco_unitario * ic.quantidade ELSE 0 END) as receita_ingressos,
                SUM(CASE WHEN ic.tipo_item = 'snack' THEN ic.preco_unitario * ic.quantidade ELSE 0 END) as receita_snacks,
                
                -- Análise de clientes
                COUNT(DISTINCT c.id_usuario) as clientes_unicos,
                COUNT(DISTINCT CASE WHEN c.data_compra >= DATE_SUB(CURDATE(), INTERVAL ? DAY) 
                    THEN c.id_usuario ELSE NULL END) as clientes_periodo,
                
                -- Análise temporal
                AVG(CASE WHEN DAYNAME(c.data_compra) IN ('Saturday', 'Sunday') 
                    THEN c.valor_total ELSE NULL END) as ticket_medio_fim_semana,
                AVG(CASE WHEN DAYNAME(c.data_compra) NOT IN ('Saturday', 'Sunday') 
                    THEN c.valor_total ELSE NULL END) as ticket_medio_semana
                    
            FROM compra c
            LEFT JOIN item_compra ic ON c.id_compra = ic.id_compra
            WHERE c.data_compra >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        `, [periodo, periodo]);

        // Análise de sazonalidade
        const [sazonalidade] = await connection.query(`
            SELECT 
                DAYNAME(data_compra) as dia_semana,
                HOUR(data_compra) as hora,
                COUNT(*) as total_vendas,
                SUM(valor_total) as receita_total,
                AVG(valor_total) as ticket_medio
            FROM compra
            WHERE data_compra >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY dia_semana, hora
            ORDER BY 
                CASE DAYNAME(data_compra)
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                    WHEN 'Sunday' THEN 7
                END, hora
        `, [periodo]);

        // Taxa de conversão por filme
        const [conversaoFilmes] = await connection.query(`
            SELECT 
                f.titulo,
                COUNT(DISTINCT v.id_usuario) as votantes,
                COUNT(DISTINCT ic.id_compra) as compras_ingressos,
                CASE 
                    WHEN COUNT(DISTINCT v.id_usuario) > 0 
                    THEN (COUNT(DISTINCT ic.id_compra) * 100.0 / COUNT(DISTINCT v.id_usuario))
                    ELSE 0 
                END as taxa_conversao
            FROM filme f
            LEFT JOIN voto v ON f.id_filme = v.id_filme
            LEFT JOIN item_compra ic ON ic.id_item_compra IN (
                SELECT id_item_compra FROM produto WHERE nome LIKE CONCAT('%', f.titulo, '%')
            )
            WHERE f.em_votacao = 1 OR f.em_cartaz = 1
            GROUP BY f.id_filme, f.titulo
            HAVING votantes > 0
            ORDER BY taxa_conversao DESC
        `);

        res.json({
            periodo: periodo,
            metricas: {
                receitaIngressos: Number(metricas[0]?.receita_ingressos || 0),
                receitaSnacks: Number(metricas[0]?.receita_snacks || 0),
                clientesUnicos: Number(metricas[0]?.clientes_unicos || 0),
                clientesPeriodo: Number(metricas[0]?.clientes_periodo || 0),
                ticketMedioFimSemana: Number(metricas[0]?.ticket_medio_fim_semana || 0),
                ticketMedioSemana: Number(metricas[0]?.ticket_medio_semana || 0)
            },
            sazonalidade: sazonalidade.map(item => ({
                diaSemana: item.dia_semana,
                hora: Number(item.hora),
                totalVendas: Number(item.total_vendas),
                receitaTotal: Number(item.receita_total),
                ticketMedio: Number(item.ticket_medio)
            })),
            conversaoFilmes: conversaoFilmes.map(item => ({
                titulo: item.titulo,
                votantes: Number(item.votantes),
                compras: Number(item.compras_ingressos),
                taxaConversao: Number(item.taxa_conversao || 0)
            }))
        });

    } catch (error) {
        console.error('Erro no dashboard detalhado:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// Rota para exportar dados em diferentes formatos
app.get('/api/admin/dashboard/export/:formato', async (req, res) => {
    const formato = req.params.formato; // json, csv, xlsx

    try {
        // Reutiliza a lógica da dashboard principal
        const dashboardResponse = await fetch('/api/admin/dashboard', {
            headers: req.headers
        });
        const data = await dashboardResponse.json();

        switch (formato.toLowerCase()) {
            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=dashboard-data.csv');

                // Converte dados para CSV (implementação simplificada)
                let csvContent = 'Métrica,Valor\n';
                csvContent += `Total de Vendas,${data.totalVendas}\n`;
                csvContent += `Total de Usuários,${data.totalUsuarios}\n`;
                csvContent += `Ticket Médio,${data.ticketMedio}\n`;
                csvContent += `Taxa de Ocupação,${data.taxaOcupacao}%\n`;

                res.send(csvContent);
                break;

            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=dashboard-data.json');
                res.json(data);
                break;

            default:
                res.status(400).json({ error: 'Formato não suportado. Use: json, csv' });
        }

    } catch (error) {
        console.error('Erro na exportação:', error);
        res.status(500).json({
            error: 'Erro ao exportar dados',
            message: error.message
        });
    }
});

// ========================
// FeeBack
// ========================

app.post('/api/feedback', authenticateUser, async (req, res) => {
    const { id_sessao, tipo_problema, mensagem } = req.body;
    const userId = req.userId;

    if (!id_sessao || !tipo_problema || !mensagem) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    const conn = await getConn();
    try {
        // Verifica se a sessão existe
        const [sessao] = await conn.query(
            'SELECT id_sessao FROM sessao WHERE id_sessao = ?',
            [id_sessao]
        );

        if (sessao.length === 0) {
            return res.status(404).json({ message: 'Sessão não encontrada.' });
        }

        // Insere o feedback
        const [result] = await conn.query(
            'INSERT INTO feedback (id_usuario, id_sessao, tipo_problema, mensagem) VALUES (?, ?, ?, ?)',
            [userId, id_sessao, tipo_problema, mensagem]
        );

        res.status(201).json({
            message: 'Feedback registrado com sucesso!',
            id_feedback: result.insertId
        });
    } catch (error) {
        console.error('Erro ao registrar feedback:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao registrar feedback.' });
    } finally {
        conn.release();
    }
});


app.get('/api/admin/feedbacks', authenticateAdmin, async (req, res) => {
    console.log('🔍 Rota /admin/feedbacks foi chamada');
    console.log('🔍 User ID:', req.userId);
    console.log('🔍 Headers:', req.headers);
    
    const conn = await getConn();
    try {
        console.log('🔍 Conectado ao banco, executando query...');
        const [feedbacks] = await conn.query(`
            SELECT 
                f.id_feedback,
                f.id_sessao,
                f.tipo_problema,
                f.mensagem,
                f.data_hora,
                f.status_feedback,
                u.nome AS nome_usuario,
                u.email AS email_usuario,
                fl.titulo AS filme_titulo
            FROM feedback f
            JOIN usuario u ON f.id_usuario = u.id_usuario
            LEFT JOIN sessao s ON f.id_sessao = s.id_sessao
            LEFT JOIN filme fl ON s.id_filme = fl.id_filme
            ORDER BY f.data_hora DESC
        `);
        
        console.log('🔍 Query executada, resultados:', feedbacks.length);
        console.log('🔍 Primeiros 2 feedbacks:', feedbacks.slice(0, 2));
        
        res.json(feedbacks);
    } catch (error) {
        console.error('❌ Erro na query:', error);
        res.status(500).json({ message: 'Erro interno ao buscar feedbacks.' });
    } finally {
        conn.release();
    }
});

app.put('/api/admin/feedbacks/:id/status', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const { status_feedback } = req.body;

    if (!status_feedback || !['aberto', 'em_progresso', 'resolvido'].includes(status_feedback)) {
        return res.status(400).json({ message: 'Status inválido.' });
    }

    const conn = await getConn();
    try {
        const [result] = await conn.query(
            'UPDATE feedback SET status_feedback = ? WHERE id_feedback = ?',
            [status_feedback, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Feedback não encontrado.' });
        }

        res.json({ message: 'Status atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar status do feedback:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar status.' });
    } finally {
        conn.release();
    }
});

app.patch('/api/admin/feedbacks/:id', async (req, res) => {
    const { id } = req.params;
    const { status_feedback } = req.body;

    if (!status_feedback || !['aberto', 'em_progresso', 'resolvido'].includes(status_feedback)) {
        return res.status(400).json({ message: 'Status inválido.' });
    }

    const conn = await getConn();
    try {
        const [result] = await conn.query(
            'UPDATE feedback SET status_feedback = ? WHERE id_feedback = ?',
            [status_feedback, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Feedback não encontrado.' });
        }

        res.json({ message: 'Status atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar status do feedback:', error);
        res.status(500).json({ message: 'Erro interno ao atualizar status.' });
    } finally {
        conn.release();
    }
});

// ===============
// Dashboard
// ===============

app.get('/api/admin/dashboard/relatorio', async (req, res) => {
    let connection;

    try {
        connection = await db.getConnection();

        // Busca os mesmos dados da dashboard
        const [dadosTotais] = await connection.query(`
            SELECT 
                IFNULL((SELECT SUM(valor_total) FROM compra), 0) AS total_vendas,
                (SELECT COUNT(*) FROM usuario WHERE tipo = 'comum') AS total_usuarios,
                (SELECT COUNT(*) FROM filme WHERE em_cartaz = 1) AS filmes_cartaz,
                (SELECT COUNT(*) FROM filme) AS total_filmes,
                (SELECT COUNT(*) FROM aluguel_sala WHERE status_aluguel = 'pendente') AS alugueis_pendentes,
                (SELECT COUNT(*) FROM contato WHERE status = 'pendente') AS contatos_pendentes,
                IFNULL((SELECT SUM(quantidade) FROM item_compra WHERE tipo_item = 'snack'), 0) AS snacks_vendidos,
                (SELECT COUNT(*) FROM filme WHERE em_votacao = 1) AS filmes_votacao
        `);

        const [vendasPorMes] = await connection.query(`
            SELECT 
                DATE_FORMAT(data_compra, '%m/%Y') AS mes_ano,
                SUM(valor_total) AS total_vendas
            FROM compra
            WHERE data_compra >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY mes_ano
            ORDER BY STR_TO_DATE(CONCAT('01/', mes_ano), '%d/%m/%Y')
        `);

        const [usuariosPorMes] = await connection.query(`
            SELECT 
                DATE_FORMAT(data_cadastro, '%m/%Y') AS mes_ano,
                COUNT(*) AS total_usuarios
            FROM usuario
            WHERE tipo = 'comum' 
            AND data_cadastro >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY mes_ano
            ORDER BY STR_TO_DATE(CONCAT('01/', mes_ano), '%d/%m/%Y')
        `);

        // Dados adicionais para o relatório
        // const [topFilmes] = await connection.query(`
        //     SELECT 
        //         f.titulo, 
        //         COUNT(c.id) as total_vendas
        //     FROM filme f
        //     LEFT JOIN compra c ON f.id = c.filme_id
        //     WHERE f.em_cartaz = 1
        //     GROUP BY f.id, f.titulo
        //     ORDER BY total_vendas DESC
        //     LIMIT 5
        // `);

        const [ultimasCompras] = await connection.query(`
            SELECT 
                u.nome as usuario_nome,
                f.titulo as filme_titulo,
                c.valor_total,
                DATE_FORMAT(c.data_compra, '%d/%m/%Y %H:%i') as data_compra
            FROM compra c
            JOIN usuario u ON c.usuario_id = u.id
            LEFT JOIN filme f ON c.filme_id = f.id
            ORDER BY c.data_compra DESC
            LIMIT 10
        `);

        // Cria o PDF
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });

        // Headers para download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-dashboard.pdf');

        // Pipe o PDF para a resposta
        doc.pipe(res);

        // === CABEÇALHO ===
        doc.fontSize(24)
            .font('Helvetica-Bold')
            .fillColor('#1a1a1a')
            .text('CineVille', 50, 50);

        doc.fontSize(16)
            .font('Helvetica')
            .fillColor('#666')
            .text('Relatório Dashboard', 50, 80);

        const now = new Date();
        doc.fontSize(12)
            .text(`Gerado em: ${now.toLocaleString('pt-BR')}`, 50, 100);

        // Linha separadora
        doc.moveTo(50, 130)
            .lineTo(550, 130)
            .strokeColor('#ccc')
            .stroke();

        let yPos = 160;

        // === MÉTRICAS PRINCIPAIS ===
        doc.fontSize(18)
            .font('Helvetica-Bold')
            .fillColor('#1a1a1a')
            .text('Métricas Principais', 50, yPos);

        yPos += 40;

        const metricas = [
            { label: 'Total de Vendas', value: `R$ ${Number(dadosTotais[0].total_vendas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
            { label: 'Total de Usuários', value: dadosTotais[0].total_usuarios || 0 },
            { label: 'Filmes em Votação', value: dadosTotais[0].filmes_votacao || 0 },
            { label: 'Total de Filmes', value: dadosTotais[0].total_filmes || 0 },
            { label: 'Aluguéis Pendentes', value: dadosTotais[0].alugueis_pendentes || 0 },
            { label: 'Contatos Pendentes', value: dadosTotais[0].contatos_pendentes || 0 },
            { label: 'Snacks Vendidos', value: dadosTotais[0].snacks_vendidos || 0 }
        ];

        // Grid de métricas (2 colunas)
        for (let i = 0; i < metricas.length; i++) {
            const metrica = metricas[i];
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = 50 + (col * 250);
            const y = yPos + (row * 60);

            // Box da métrica
            doc.rect(x, y, 220, 50)
                .fillAndStroke('#f8f9fa', '#e9ecef');

            doc.fontSize(10)
                .fillColor('#666')
                .text(metrica.label, x + 10, y + 10);

            doc.fontSize(16)
                .font('Helvetica-Bold')
                .fillColor('#1a1a1a')
                .text(metrica.value.toString(), x + 10, y + 25);
        }

        yPos += Math.ceil(metricas.length / 2) * 60 + 40;

        // Verifica se precisa de nova página
        if (yPos > 650) {
            doc.addPage();
            yPos = 50;
        }

        // === VENDAS POR MÊS ===
        doc.fontSize(18)
            .font('Helvetica-Bold')
            .fillColor('#1a1a1a')
            .text('Vendas por Mês (Últimos 6 meses)', 50, yPos);

        yPos += 30;

        if (vendasPorMes.length > 0) {
            doc.fontSize(12)
                .font('Helvetica');

            vendasPorMes.forEach((venda, index) => {
                const valor = Number(venda.total_vendas || 0);
                doc.fillColor('#1a1a1a')
                    .text(`${venda.mes_ano}: `, 70, yPos + (index * 20))
                    .fillColor('#28a745')
                    .text(`R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 150, yPos + (index * 20));
            });

            yPos += vendasPorMes.length * 20 + 30;
        } else {
            doc.fontSize(12)
                .fillColor('#666')
                .text('Nenhuma venda registrada no período', 70, yPos);
            yPos += 40;
        }

        // === TOP 5 FILMES ===
        if (yPos > 600) {
            doc.addPage();
            yPos = 50;
        }

        doc.fontSize(18)
            .font('Helvetica-Bold')
            .fillColor('#1a1a1a')
            .text('Top 5 Filmes Mais Vendidos', 50, yPos);

        yPos += 30;

        if (topFilmes.length > 0) {
            doc.fontSize(12)
                .font('Helvetica');

            topFilmes.forEach((filme, index) => {
                doc.fillColor('#1a1a1a')
                    .text(`${index + 1}. ${filme.titulo}: `, 70, yPos + (index * 20))
                    .fillColor('#007bff')
                    .text(`${filme.total_vendas} vendas (R$ ${Number(filme.receita_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`, 300, yPos + (index * 20));
            });

            yPos += topFilmes.length * 20 + 30;
        } else {
            doc.fontSize(12)
                .fillColor('#666')
                .text('Nenhum filme vendido no período', 70, yPos);
            yPos += 40;
        }

        // === ÚLTIMAS COMPRAS ===
        if (yPos > 500) {
            doc.addPage();
            yPos = 50;
        }

        doc.fontSize(18)
            .font('Helvetica-Bold')
            .fillColor('#1a1a1a')
            .text('Últimas 10 Compras', 50, yPos);

        yPos += 30;

        if (ultimasCompras.length > 0) {
            doc.fontSize(10)
                .font('Helvetica');

            // Cabeçalho da tabela
            doc.fillColor('#666')
                .text('Usuário', 50, yPos)
                .text('Filme', 150, yPos)
                .text('Valor', 350, yPos)
                .text('Data', 450, yPos);

            yPos += 20;

            // Linha separadora
            doc.moveTo(50, yPos)
                .lineTo(550, yPos)
                .strokeColor('#ccc')
                .stroke();

            yPos += 10;

            ultimasCompras.forEach((compra, index) => {
                const y = yPos + (index * 18);

                doc.fillColor('#1a1a1a')
                    .text(compra.usuario_nome || 'N/A', 50, y)
                    .text(compra.filme_titulo || 'Snack', 150, y)
                    .text(`R$ ${Number(compra.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 350, y)
                    .text(compra.data_compra, 450, y);
            });
        } else {
            doc.fontSize(12)
                .fillColor('#666')
                .text('Nenhuma compra registrada', 70, yPos);
        }

        // === RODAPÉ ===
        doc.fontSize(8)
            .fillColor('#999')
            .text('Este relatório foi gerado automaticamente pelo sistema CineVille', 50, 750, {
                align: 'center',
                width: 500
            });

        // Finaliza o PDF
        doc.end();

        console.log('✅ Relatório PDF gerado com sucesso');

    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

// ===============================================
// ROTAS PARA GERENCIAMENTO DE SESSÕES
// ===============================================

// Listar todas as sessões
app.get('/api/admin/sessoes', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.*,
                f.titulo as filme_nome
            FROM sessao s
            LEFT JOIN filme f ON s.id_filme = f.id_filme
            ORDER BY s.data_hora DESC
        `;

        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar sessões:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar sessão por ID
app.get('/api/admin/sessoes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                s.*,
                f.titulo as filme_nome
            FROM sessao s
            LEFT JOIN filme f ON s.id_filme = f.id_filme
            WHERE s.id_sessao = ?
        `;

        const [rows] = await db.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Sessão não encontrada' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar sessão:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Criar nova sessão
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
                   value="${sessao ? sessao.valor_ingresso : ''}" required 
                   placeholder="Ex: 25.00">
        </div>
        
        <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-save-sessao">
                ${sessao ? 'Atualizar Sessão' : 'Criar Sessão'}
            </button>
        </div>
    </form>
    `;

    // Carregar filmes disponíveis
    loadFilmesForSelect(sessao?.id_filme);

    // Configurar o evento do botão salvar
    document.getElementById('btn-save-sessao').onclick = () => saveSessao(sessao);
    
    adminModal.show();
}

// Atualizar sessão
app.put('/api/admin/sessoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { id_filme, id_sala, data_hora, tipo_exibicao, valor_ingresso } = req.body;

        // Validações
        if (!id_filme || !id_sala || !data_hora || !tipo_exibicao || !valor_ingresso) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        // Verificar se a sessão existe
        const [sessionRows] = await db.execute('SELECT id_sessao FROM sessao WHERE id_sessao = ?', [id]);
        if (sessionRows.length === 0) {
            return res.status(404).json({ message: 'Sessão não encontrada' });
        }

        // Validar se o filme existe
        const [filmeRows] = await db.execute('SELECT id_filme FROM filme WHERE id_filme = ?', [id_filme]);
        if (filmeRows.length === 0) {
            return res.status(400).json({ message: 'Filme não encontrado' });
        }

        // Validar se a data não é no passado
        const sessionDate = new Date(data_hora);
        const now = new Date();
        if (sessionDate < now) {
            return res.status(400).json({ message: 'A data e hora da sessão não pode ser no passado' });
        }

        // Validar se não há conflito de horário na mesma sala (excluindo a sessão atual)
        const conflictQuery = `
            SELECT id_sessao 
            FROM sessao 
            WHERE id_sala = ? 
            AND id_sessao != ?
            AND ABS(TIMESTAMPDIFF(MINUTE, data_hora, ?)) < 180
        `;

        const [conflictRows] = await db.execute(conflictQuery, [id_sala, id, data_hora]);
        if (conflictRows.length > 0) {
            return res.status(400).json({
                message: 'Conflito de horário: já existe uma sessão próxima a este horário na mesma sala'
            });
        }

        // Validar tipos de exibição permitidos
        const tiposPermitidos = ['2D Dublado', '2D Legendado', '3D Dublado', '3D Legendado', 'IMAX Dublado', 'IMAX Legendado'];
        if (!tiposPermitidos.includes(tipo_exibicao)) {
            return res.status(400).json({ message: 'Tipo de exibição inválido' });
        }

        // Validar valor do ingresso
        if (isNaN(valor_ingresso) || valor_ingresso <= 0) {
            return res.status(400).json({ message: 'Valor do ingresso deve ser um número positivo' });
        }

        // Validar sala (assumindo salas de 1 a 4)
        if (![1, 2, 3, 4].includes(parseInt(id_sala))) {
            return res.status(400).json({ message: 'Sala inválida' });
        }

        const updateQuery = `
            UPDATE sessao 
            SET id_filme = ?, id_sala = ?, data_hora = ?, tipo_exibicao = ?, valor_ingresso = ?
            WHERE id_sessao = ?
        `;

        await db.execute(updateQuery, [
            id_filme,
            id_sala,
            data_hora,
            tipo_exibicao,
            valor_ingresso,
            id
        ]);

        res.json({ message: 'Sessão atualizada com sucesso' });

    } catch (error) {
        console.error('Erro ao atualizar sessão:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Excluir sessão
app.delete('/api/admin/sessoes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se a sessão existe
        const [sessionRows] = await db.execute('SELECT id_sessao FROM sessao WHERE id_sessao = ?', [id]);
        if (sessionRows.length === 0) {
            return res.status(404).json({ message: 'Sessão não encontrada' });
        }

        // Verificar se existem ingressos vendidos para esta sessão
        const [ticketRows] = await db.execute('SELECT COUNT(*) as count FROM ingresso WHERE id_sessao = ?', [id]);
        if (ticketRows[0].count > 0) {
            return res.status(400).json({
                message: 'Não é possível excluir a sessão pois já existem ingressos vendidos para ela'
            });
        }

        await db.execute('DELETE FROM sessao WHERE id_sessao = ?', [id]);

        res.json({ message: 'Sessão excluída com sucesso' });

    } catch (error) {
        console.error('Erro ao excluir sessão:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar sessões por filme
app.get('/api/admin/sessoes/filme/:id_filme', async (req, res) => {
    try {
        const { id_filme } = req.params;

        const query = `
            SELECT 
                s.*,
                f.titulo as filme_nome
            FROM sessao s
            LEFT JOIN filme f ON s.id_filme = f.id_filme
            WHERE s.id_filme = ?
            ORDER BY s.data_hora ASC
        `;

        const [rows] = await db.execute(query, [id_filme]);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar sessões do filme:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar sessões por sala
app.get('/api/admin/sessoes/sala/:id_sala', async (req, res) => {
    try {
        const { id_sala } = req.params;

        const query = `
            SELECT 
                s.*,
                f.titulo as filme_nome
            FROM sessao s
            LEFT JOIN filme f ON s.id_filme = f.id_filme
            WHERE s.id_sala = ?
            ORDER BY s.data_hora ASC
        `;

        const [rows] = await db.execute(query, [id_sala]);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar sessões da sala:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar sessões por data
app.get('/api/admin/sessoes/data/:data', async (req, res) => {
    try {
        const { data } = req.params;

        const query = `
            SELECT 
                s.*,
                f.titulo as filme_nome
            FROM sessao s
            LEFT JOIN filme f ON s.id_filme = f.id_filme
            WHERE DATE(s.data_hora) = ?
            ORDER BY s.data_hora ASC
        `;

        const [rows] = await db.execute(query, [data]);
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar sessões da data:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// ===============================================
// Tratamento de erros global (inalterado)
// ===============================================

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        error: 'Ocorreu um erro inesperado no servidor.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});