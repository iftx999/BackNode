const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

const port = 3000;

// Configuração do banco de dados
const pool = new Pool({
  user: 'seu-usuario',
  host: 'localhost',
  database: 'seu-banco-de-dados',
  password: 'sua-senha',
  port: 5432,
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Rotas para Curso
app.get('/cursos', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM cursos');
    const cursos = result.rows;
    client.release();
    res.json(cursos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter cursos');
  }
});

app.post('/cursos', async (req, res) => {
  const { nome } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO cursos (nome) VALUES ($1) RETURNING *', [nome]);
    const curso = result.rows[0];
    client.release();
    res.json(curso);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar curso');
  }
});

app.put('/cursos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('UPDATE cursos SET nome = $1 WHERE id = $2 RETURNING *', [nome, id]);
    const curso = result.rows[0];
    client.release();
    res.json(curso);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar curso');
  }
});

app.delete('/cursos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const alunoResult = await client.query('SELECT * FROM alunos WHERE curso_id = $1', [id]);
    if (alunoResult.rowCount > 0) {
      res.status(400).send('Não é possível excluir o curso pois existem alunos matriculados');
    } else {
      const result = await client.query('DELETE FROM cursos WHERE id = $1', [id]);
      client.release();
      res.send('Curso excluído com sucesso');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir curso');
  }
});

// Rotas para Aluno
app.get('/alunos', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM alunos');
    const alunos = result.rows;
    client.release();
    res.json(alunos);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao obter alunos');
  }
});

app.post('/alunos', async (req, res) => {
  const { nome } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO alunos (nome) VALUES ($1) RETURNING *', [nome]);
    const aluno = result.rows[0];
    client.release();
    res.json(aluno);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar aluno');
  }
});

app.put('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('UPDATE alunos SET nome = $1 WHERE id = $2 RETURNING *', [nome, id]);
    const aluno = result.rows[0];
    client.release();
    res.json(aluno);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar aluno');
  }
});

app.delete('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const matriculaResult = await client.query('SELECT * FROM matriculas WHERE aluno_id = $1', [id]);
    if (matriculaResult.rowCount > 0) {
      res.status(400).send('Não é possível excluir o aluno pois ele está matriculado em algum curso');
    } else {
      const result = await client.query('DELETE FROM alunos WHERE id = $1', [id]);
      client.release();
      res.send('Aluno excluído com sucesso');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir aluno');
  }
});

// Rotas para Matrícula
app.post('/matriculas', async (req, res) => {
  const { alunoId, cursoId } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('INSERT INTO matriculas (aluno_id, curso_id) VALUES ($1, $2) RETURNING *', [alunoId, cursoId]);
    const matricula = result.rows[0];
    client.release();
    res.json(matricula);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar matrícula');
  }
});

app.delete('/matriculas', async (req, res) => {
  const { alunoId, cursoId } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query('DELETE FROM matriculas WHERE aluno_id = $1 AND curso_id = $2', [alunoId, cursoId]);
    client.release();
    res.send('Matrícula excluída com sucesso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao excluir matrícula');
  }
});

app.listen(port, () => {
  console.log(`Servidor está executando na porta ${port}`);
});
