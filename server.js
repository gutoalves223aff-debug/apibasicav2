require('dotenv').config({quiet: true})
const express = require('express');
const app = express();
app.use(express.json());


// ROTA RESPONSÁVEL PELO REGISTRO DA NOSSA API
const RegisterRouter = require('./register');
app.use('/v1', RegisterRouter);

// ROTA RESPONSÁVEL PELA FUNÇÃO DE LOGIN
const login = require('./login');
app.use('/v1', login);

// ROTA RESPONSÁVEL PELA ALTERAÇÃO DE SENHA
const change = require('./change');
app.use('/v1', change);


// ROTA PARA LISTAR TODOS USUARIOS 
const users = require('./users');
app.use('/v1', users);




app.listen(process.env.PORTA_EXPRESS_API, () => {
    console.log(`SERVIDOR EXPRESS RODANDO NORMALMENTE NA PORTA ${process.env.PORTA_EXPRESS_API}`);
})