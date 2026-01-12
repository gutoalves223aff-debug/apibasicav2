
// AQUI VOU ESTÁ IMPORTANDO MODULO QUE VAI SER RESPONSÁVEL A AUXILIAR VALIDAÇÃO DOS DADOS QUE SERÃO ENVIADOS AO SERVIDOR, TEM COMO FAZER NA MÃO TAMBÉM PORÉM SERIA MAIS VERBOSO
const validarFormato = require('joi');

// AQUI ESTOU CHAMANDO NOSSA CONEXÃO COM MYSQL, COMO ESTOU DIVIDINDO OS ARQUIVOS EM PARTES, PRECISAMOS NOS COMUNICAR COM ELE
const MySqlQuery = require('./mysql');

// AQUI ESTOU UTILIZANDO O FRAMEWORK EXPRESS PRA DESENVOLVER ESSA API
const express = require('express');


// AGORA VOU CHAMAR O MODULO BCRYPT QUE SERÁ RESPONSÁVEL PELA CRIPTOGRAFIA DAS SENHAS PARA ARMAZENARMOS NO BANCO DE DADOS DE FORMA SEGURA
const bcrypt = require('bcrypt');


// AQUI ESTAMOS CHAMANDO A FUNÇÃO EXPRESS ROUTER, FARA O PAPEL DE COMUNICAR, SERIA  A MESMA COISA DE EU CHAMAR O EXPRESS DIRETO, A DIFERENÇA QUE AQUI ESTOU UTILIZANDO A ROTA
// COMO ESTOU DIVIDINDO OS ARQUIVOS EM PARTES, AI PRA MIM NÃO TER QUE FICAR TODA HORA INICIALIZANDO EXPRESS EM CADA PARTE DIFERENTE, ASSIM INCLUSIVE FICA MAIS FÁCIL DE DAR MANUNTENÇÃO
//TENDO EM VISTA QUE TODOS ENDPOINTS FICARAM EM UM UNICO ARQUIVO .JS RESPONSÁVEL POR GERENCIAR NOSSAS CONEXÕES E ROTAS

const RouterRegister = express.Router();

// ABAIXO VOU ESTÁ CRIANDO UMA ROTA RESPONSÁVEL PELO CADASTRO, NA QUAL SERÁ EXIGIDO NOME, EMAIL E SENHA UMA CRIAÇÃO BÁSICA MESMO;
RouterRegister.post('/register/', async (req, res) => {

    const { nome, email, senha } = req.body;
    // AQUI ESTOU UTILIZANDO MODULO JOI PRA FAZER ALGUMAS VALIDAÇÕES BASICAS NO INPUT COMO NOME, SENHA, COLOCANDO COMO OBRIGATÓRIO, PEDINDO EMAIL NO FORMATO ADEQUADO, EXIGINDO CARACETR MIN E MAX
    const FormatoRequisito = validarFormato.object({
        nome: validarFormato.string()
            .min(3)
            .max(100)
            .required(),

        email: validarFormato.string()
            .pattern(new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'))
            .min(3)
            .max(100)
            .required(),

        senha: validarFormato.string()
            .min(5)
            .max(100)
            .required()



    })
    // AQUI CHAMO A FUNÇÃO VALIDATE QUE ESTÁ DENTRO DO MODULO JOI AONDE VERIFICAMOS SE O PAYLOAD RECEBIDO ESTÁ NO FORMATO ESPERADO QUE DEFINIMOS!
    const VerificarFormatoPayload = FormatoRequisito.validate({ nome: nome, email: email, senha: senha });


    // AQUI EM BAIXO FAZEMOS ALGUNS TRATAMENTOS DE POSSÍVEIS ERROS, COMO DE SENHA ESTOURADA, OU NOME!

    if (VerificarFormatoPayload.error) {

        if (VerificarFormatoPayload.error.details[0].path[0] === 'nome' && (VerificarFormatoPayload.error.details[0].type === 'string.max' || VerificarFormatoPayload.error.details[0].type === 'string.min')) {
            return res.status(400).json({ message: 'INSIRA NOME DE NO MINIMO 3 CARACTER E COM MAXIMO DE 100 CARACTERES' })
        };

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

        // AQUI ESTOU CHAMANDO A FUNÇÃO DE HASH DENTRO DO MODULO BCRYPT COM SALT DE 10, POSSO AUMENTAR PRA MAIS, PORÉM O SISTEMA FICARÁ MAIS LENTO NA HORA DE DECODIFICAR PRA FUTURAS VALIDAÇÕES

        const senhaBcryt = await bcrypt.hash(senha, 10);
        //AQUI ESTOU CHAMANDO NOSSO MYSQL, VOU UTILIZAR ESSA VARIAVEL PRA MANIPULARMOS O MYSQL
        const conectarMysql = await MySqlQuery();

        // ABAIXO ESTOU CRIANDO UMA QUERY DE INSERÇÃO DE DADOS, NA QUAL DEFINI 3 COLUNAS JA NOME, EMAIL SENHA, NA QUAL VAMOS ESTÁ RECEBENDO OS INPUTS DO BODY APOS VALIDARMOS AI SIM A QUERY SERÁ ENVIADA

        const CreateConta = 'INSERT INTO users(nome, email, senha, role) values (?,?,?,?)';
        const query = [nome, email, senhaBcryt, 'adm'];

        const [CadastrarConta]  = await  conectarMysql.query(CreateConta, query);
        console.log(CadastrarConta)

        // AQUI FAZEMOS A VERIFICAÇÃO, SE O NUMERO FOR === 1 DE ROWS AFETADAS SIGNFICA QUE O CADASTRO FOI REALIZADO COM SUCESSO!
        
        if(CadastrarConta.affectedRows === 1){
           return res.status(201).json({message: 'USUARIO CRIADO COM SUCESSO!'});
        }




    }catch(err){
        console.log(err)
        // ABAIXO EU TRATO O ERRO DE DUPLICADOS, COMO SERÁ UM CADASTRO PRECISAMOS DE UMA INFORMAÇÃO UNICA PRA SER VÁLIDA! PARA FAZERMOS A VERIFICAÇÃO DE LOGIN!
        if(err.errno === 1062){
            return res.status(409).json({message: 'ESSE EMAIL JÁ CONSTA COMO REGISTRADO NA NOSSA BASE DE DADOS!'});
        };
    }



})




// VAMOS EXPORTAR A VARIAVEL ROUTER REGISTER QUE É RESPONSÁVEL POR CHAMAR NOSSA FUNÇÃO ROUTER DO EXPRESS
module.exports = RouterRegister;

