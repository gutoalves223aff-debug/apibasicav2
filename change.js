const express = require('express');
const change = express.Router();
const jwt = require('jsonwebtoken');
const mysql = require('./mysql');
const bcrypt = require('bcrypt')



change.patch('/change/password', async (req, res) => {
    const headerToken = req.headers['authorization'];
    if (!headerToken) {
        return res.status(401).json({ message: 'É NECESSÁRIO UM TOKEN VÁLIDO!' })
    };

    try {

        const RemoverBearer = headerToken.replace('Bearer', '').trim()

        const decode = jwt.decode(RemoverBearer, process.env.JWT_KEY);
        console.log(decode)
        if (decode === null) {
            return res.status(401).json({ message: 'TOKEN INVÁLIDO!' })
        }
        const { senha, confirm_senha } = req.body;
        if (senha != confirm_senha) {
            res.status(409).json({ message: 'SENHA DE CONFIRMAÇÃO DIFERENTE' })
        } else {
            const hashSenha = await bcrypt.hash(senha, 10);
            console.log(hashSenha)
            const query = 'update users set senha =? where email = ?';
            const email = [hashSenha, decode.email];

            try {

                const mysqlQuery = await mysql();
                const response = await mysqlQuery.query(query, email);
                res.status(200).json({message: 'SENHA ALTERADA COM SUCESSO!'})

            } catch (err) {
                console.log(err.message)
            }
        }



    } catch (e) {
        console.log(e.message)
    }
})


module.exports = change;