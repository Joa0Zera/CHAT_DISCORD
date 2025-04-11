const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middlewares essenciais
app.use(express.urlencoded({ extended: true })); // Para processar dados do formulário
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração simplificada de sessão
app.use(session({
  secret: 'segredo123',
  resave: false,
  saveUninitialized: true
}));

/// Rotas
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Rota de login (GET)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para obter o nome do usuário
app.get('/get-username', (req, res) => {
  res.json({ username: req.session.username || 'Usuário' });
});

// Rota do chat (protegida por sessão)
app.get('/chat', (req, res) => {
  if (!req.session.username) {
      return res.redirect('/login'); // Força o login se não houver nome
  }

  // Rota de logout (para limpar a sessão)
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Rota de login (POST) - Já deve existir
app.post('/login', (req, res) => {
  req.session.username = req.body.username; // Armazena o nome do usuário
  res.redirect('/chat');
});

// Rota do chat (com sessão)
app.get('/chat', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Socket.io Configuration (CORRIGIDO)
io.on('connection', (socket) => {
  console.log('↔ Usuário conectado:', socket.id);

  socket.on('chat message', (data) => {
      // Adiciona ID único se não existir
      if (!data.id) {
          data.id = Date.now(); // Timestamp como ID único
      }

      // Objeto final da mensagem
      const messageData = {
          id: data.id, // Mantém o ID original ou adiciona novo
          text: data.text || '[mensagem vazia]',
          username: data.username || 'Usuário',
          time: new Date().toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
          })
      };

      // Envia para TODOS (incluindo remetente)
      io.emit('chat message', messageData);
  });
});

// Inicia o servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});