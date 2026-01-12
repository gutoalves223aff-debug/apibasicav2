



//IMPORTANDO VARIAVEIS DE AMBIENTE, PRA NÃO DEIXAR CREDENCIAIS SENSÍVEIS EXPOSTAS!
require('dotenv').config({quiet: true});

// ESTOU IMPORTANDO O MODULO DO MYSQL QUE IREI UTILIZAR PRA FAZER CONEXÃO COM MEU MYSQL
const mysql = require('mysql2/promise');


// INICIALIZANDOA  CONEXÃO COM BANCO DE DADOS JÁ UTILIZANDO AS VARIAVEIS DE AMBIENTES
async function ConexaoMysql(){

    // AQUI ESTOU CRIANDO UMA POOL DE CONEXÃO COM O MEU BANCO DE DADOS MYSQL

    const ConexaoMysql = mysql.createPool({
        host: process.env.MYSQL_LOCAL_HOST,
        user: process.env.MYSQL_USUARIO,
        password: process.env.MYSQL_SENHA,
        database: process.env.MYSQL_NOME_DATABASE
    });

    // CASO TENHA QUE FALTER ALTERAÇÕES DE ALGO RELACIONADO AO MYSQL BASTA ABRIR O .ENV E ATUALIZAR COM OS NOVOS DADOS E AUTOMATICAMENTE JÁ SERA RECONHECIDO ( AS VEZES SERÁ NECESSÁRIO REINICIAR O SERVIDOR CASO NÃO HOUVER NODEMON ( ESSE É O QUE EU USO))

    try {

        // ABAIAXO ESTOU FAZENDO UM PEDIDO DE CONEXÃO PRA VERIFICAR SE ESTÁ TUDO OK, SE SUCESSO IRÁ CAIR NO BLOCO DO TRY! QUE RETORNARÁ QUE A CONEXÃO FOI EFETUADA COM SUCESSO.

        const response = await ConexaoMysql.getConnection();
        console.log('CONEXÃO EFETUADA COM SUCESSO NO BANCO DE DADOS!');
        return response;

    }catch(e){


        // CASO A CONEXÃO FALHE PODE SER POR UM DOS DOIS MOTIVOS QUE EU IDENTIFIQUEI, EMAIL OU SENHA ERRADOS OU HOST INVÁLIDO.
        
        if(e.errno === 1045){
            console.log('USUARIO OU SENHA INVÁLIDOS!')
        }else if(e.errno === -3008 ){
            console.log('HOST INVÁLIDO! VERIFICAR')
        }
    }

}

module.exports = ConexaoMysql;