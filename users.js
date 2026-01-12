const express = require('express');
const users = express.Router();
const jwt = require('jsonwebtoken');
const mysql = require('./mysql');


users.get('/users', async (req, res) => {
    const header = req.headers['authorization']
    if (!header) {
        return res.status(401).json({ message: 'TOKEN AUSENTE!' })
    };

    const RemoverEspaco = header.replace('Bearer', '').trim();

    try {

        const decode = jwt.decode(RemoverEspaco);
        if (decode === null) {
            return res.status(401).json({ message: 'TOKEN INVÁLIDO!' })
        } else if (decode.role === 'user') {
            return res.status(401).json({ message: 'USUARIO NÃO POSSUI PERMISSÃO PARA ACESSAR AREA!' })
        } else if (decode.role === 'adm') {

            try {
                const mysqlQuery = await mysql();
                const query = 'SELECT * FROM users';
                const [ValidateQuery] = await mysqlQuery.query(query);
                res.status(200).json(ValidateQuery)

            } catch (err) {
                console.log(err.message)
            }



        }

    } catch (e) {
        console.log(e.message)
    }

})



module.exports = users;