const express = require('express');
const app = express();

app.use(express.json());

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Rota específica de usuário
app.get('/api/usuario/debug', (req, res) => {
  res.json({ message: 'Rota de usuário funcionando!' });
});

// Catch-all para outras rotas
app.get('*', (req, res) => {
  res.json({ 
    message: 'Servidor de teste', 
    url: req.originalUrl,
    method: req.method 
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor de teste rodando na porta ${PORT}`);
}); 