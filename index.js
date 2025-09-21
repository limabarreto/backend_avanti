import express from "express";
import pg from "pg";

const app = express();

// Desestrutura Pool do pg
const { Pool } = pg;

// Cria uma instância do Pool para conectar ao banco
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "1123",
    database: "avanti",
});

// Permite que o Express entenda JSON
app.use(express.json());


const usuarios = [
    {id:1, nome: "Maria", idade: 25 },
    {id:2, nome: "Joao", idade: 40 },
    {id:3, nome: "Jose", idade: 30 },
    {id:4, nome: "Paula", idade: 50}
];

app.get ("/usuarios", async (request, response) =>{
    const {rows} = await pool.query('SELECT * FROM usuarios');

    return response.json(rows).send();
})

app.post("/usuarios", async (request, response) => {
    const { nome, email, telefone } = request.body;

    try {
        const usuario = await pool.query(
            'INSERT INTO usuarios (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *',
            [nome, email, telefone]  // ← aqui a vírgula separa os parâmetros
        );

        return response.status(201).json(usuario.rows[0]); // retorna apenas o usuário criado
    } catch (err) {
        console.error(err);
        return response.status(500).json({ error: "Erro ao criar usuário" });
    }
});


app.put("/usuarios/:id", async (request, response) =>{
    const {id} = request.params;
    const {nome, email, telefone} = request.body;

    const usuario = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id])

    if(usuario.rowCount < 1){
        return response.status(404).json("Usuario não encontrado");
    }
    const u = await pool.query('UPDATE usuarios SET nome = $1, email = $2, telefone = $3 WHERE id = $4 returning *', [nome, email, telefone, id])

    return response.status(200).json(u.rows[0]);

})


app.delete("/usuarios/:id", async (request, response) => {
    const { id } = request.params;

    const usuario = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);

    if (usuario.rowCount < 1) {
        return response.status(404).json("Usuario não encontrado");
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

    return response.status(204).send(); // sucesso, sem conteúdo
});

    
app.listen(8080, () => {
    console.log("Running por 8080")
})

