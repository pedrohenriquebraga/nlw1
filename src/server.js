const express = require("express")
const server = express()

// pegar o banco de dados

const db = require('./database/db.js')

// Configurar pasta pública

server.use(express.static("public"))
// Habilitar o uso do req.body
server.use(express.urlencoded({ extended: true })) 


// Utilizando template engine
const nunjucks = require('nunjucks')
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

// Configurar caminhos
// Página inicial
// req: Requisição(pedido)
// res: Resposta

// Caminhos do servidor
server.get("/", (req, res) => {
   return res.render("index.html", {title: "Um título"})
})

server.get("/create-point", (req, res) => {

    // req.query = Query Strings das urls
    // console.log(req.query)

    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {

    // req.body = O corpo do nosso formulário
    // console.log(req.body)

    // Inserir dados no banco de dados


    const query = `
         INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
         ) VALUES (?,?,?,?,?,?,?);
    `

    const body = req.body
    const values = [
           body.image,
           body.name,
           body.address,
           body.address2,
           body.state,
           body.city,
           body.items
        ]
    
        function afterInsertData(err) {
            if (err) {
                console.log(err)
                return res.send('Erro no cadastro!')
            }
            console.log("Cadastrado com sucesso!!")
            console.log(this)

            res.render('create-point.html', {saved: true})
        }
        db.run(query, values, afterInsertData)
    
    
})


server.get("/search", (req, res) => {

    const search = req.query.search

    if(search == '') {
        //pesquisa vazia
        return res.render("search-results.html", { total: 0 })
    }

    // Pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows) {
        if (err) {
            return console.log(err)
        }
        console.log("Aqui estão seus registros: ")
        console.log(rows)

        const total = rows.length

        // Mostra a página html com os dados de bancos de dados
        return res.render("search-results.html", { places: rows, total: total })
    })

})


// Ligar o servidor
server.listen(3000)