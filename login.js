
// COMO VAMOS UTILIZAR A FUNÇÃO ROUTER DO EXPRESS TEMOS QUE CHAMAR ELE NOVAMENTE PARA QUE POSSAMOS UTILIZAR A FUNÇÃO ROUTER
const express = require('express');

// COMO VAMOS PRECISAR NOVAMENTE REALIZAR ALGUMAS VERIFICAÇÕES DE INPUT VAMOS TER QUE CHAMAR NOVAMENTE O MODULO JOI
const FormatoInput = require('joi');



// MESMO ESQUEMA VOU CHAMAR A FUNÇÃO ROTA DENTRO DO EXPRESS QUE SERÁ RESPONSÁVEL PELA INTEGRAÇÃO COM NOSSO ARQUIVO RESPONSÁVEL POR GERENCIAR AS ROTAS
const login = express.Router();

// AGORA VOU CRIAR UMA ROTA PRA FAZER LOGIN COM VERBO POST


// COMO VAMOS PRECISAR COMUNICAR COM MYSQL VAMOS TER QUE CHAMAR NOVAMENTE NOSSA FUNÇÃO RESPONSÁVEL POR REALIZAR A CONEXÃO COM BANCO DE DADOS;

const MySqlQuery = require('./mysql');

// COMO VAMOS TER QUE COMPARAR AS SENHAS PARA VALDIAR SE O LOGIN ESTÁ VALIDO VAMOS TER QUE CHAMAR MODULO BCRYPT NOVAMENTE 
const bcrypt = require('bcrypt');

// AGORA VOU IMPORTAR MODULO DO JSON WEBTOKEN QUE SERÁ RESPONSÁVEL POR GARANTIR QUE A GENTE SE AUTENTIQUE DE FORMA SEGURA
const jwt = require('jsonwebtoken');



login.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const ValidarPaylodLogin = FormatoInput.object({

        email: FormatoInput.string()
            .pattern(new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'))
            .min(3)
            .max(100)
            .required(),

        senha: FormatoInput.string()
            .min(5)
            .max(100)
            .required()



    });

    const VerificarFormatoPayload = ValidarPaylodLogin.validate({email: email, senha: senha });


    if (VerificarFormatoPayload.error) {


        if (VerificarFormatoPayload.error.details[0].type === 'string.pattern.base') {
            return res.status(400).json({ message: 'INSIRA UM ENDEREÇO DE EMAIL VALIDO NO FORMATO EXEMPLO@EXEMPLO.COM' })
        };

        if (VerificarFormatoPayload.error.details[0].path[0] === 'senha' && (VerificarFormatoPayload.error.details[0].type === 'string.max' || VerificarFormatoPayload.error.details[0].type === 'string.min')) {
            return res.status(400).json({ message: 'INSIRA UMA SENHA ENTRE 5 E 30 CARACTERES!' })
        }

        if (VerificarFormatoPayload.error.details[0].path[0] === 'email' && (VerificarFormatoPayload.error.details[0].type === 'string.max' || VerificarFormatoPayload.error.details[0].type === 'string.min')) {
            return res.status(400).json({ message: 'INSIRA UM EMAIL ENTRE 5 E 100 CARACTERES!' })
        }

        if (VerificarFormatoPayload.error.details[0].type === 'string.empty') {
            res.status(400).json({ message: 'PREENCHA TODOS CAMPOS NECESSÁRIOS!' })
        }
    };

    try {

        const MysqlQuerySyntaxe = await MySqlQuery();
        const query = 'SELECT * from users where email = ?';
        const values = [email];

        const [BuscarNoMysql] = await MysqlQuerySyntaxe.query(query, values);
        if(BuscarNoMysql.length === 0){
           return  res.status(404).json({message: 'USUARIO NÃO ENCONTRADO NO SISTEMA!'})
        };

        const CompararSenhas = await bcrypt.compare(senha, BuscarNoMysql[0].senha);
        
        if(CompararSenhas === true){

            const token = jwt.sign({nome: BuscarNoMysql[0].nome, email: BuscarNoMysql[0].email, role: BuscarNoMysql[0].role }, process.env.JWT_KEY, {expiresIn: process.env.JWT_EXPIRATE} );
            return res.status(200).json({message: `LOGIN EFETUADO COM SUCESSO!! TOKEN ==> ${token}`})       
        }else if(CompararSenhas === false){
            return res.status(401).json({message: 'USUARIO OU SENHA INVÁLIDOS!'})
        };
        

    }catch(err){
        console.log(err.message)
    }




})



// EXPORTAR A FUNÇÃO PARA QUE POSSAMOS UTILIZAR NO ARQUIVO PRINCIPAL SERVER.JS RESPONSÁVEL PELO FUNCIONAMENTO DA API
module.exports = login;
