var express = require('express'),
    bodyParser = require('body-parser'),
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    fileSystem = require('fs'),
    objectId = require('mongodb').ObjectID;

var app = express();

// body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multiparty());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

var port = 8080;

app.listen(port);

var db = new mongodb.Db('instagram', new mongodb.Server('localhost', 27017, {}), {});

console.log('Servidor HTTP esta escutando na porta ' + port);

app.post('/api', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var date = new Date().getTime();
    var url_image = `${date}_${req.files.arquivo.originalFilename}`;

    var path_origem = req.files.arquivo.path;
    var destino = `./uploads/${url_image}`;

    fileSystem.rename(path_origem, destino, function (erro) {
        if (erro) {
            res.status(500).json(erro);
            return;
        }

        var dados = { url_image: url_image, titulo: req.body.titulo };

        db.open(function (err, mongoclient) {
            mongoclient.collection('postagens', function (err, collection) {
                collection.insert(dados, function (err, records) {
                    if (err) {
                        res.json({ 'status': 'erro' });
                    } else {
                        res.json({ 'status': 'inclusao realizada com sucesso' });
                    }
                    mongoclient.close();
                });
            });
        });
    });
});

app.get('/api', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.find().toArray(function (err, results) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            });
        });
    });
});

app.get('/images/:imagem', function (req, res) {
    var imagem = req.params.imagem;
    fileSystem.readFile(`./uploads/${imagem}`, function (erro, conteudo) {
        if (erro) {
            res.status(500).json(erro);
            return;
        }

        res.writeHead(200, { 'content-type': 'image/jpeg' });
        res.end(conteudo);
    });
});

app.get('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.find(objectId(req.params.id)).toArray(function (err, results) {
                if (err) {
                    res.json(err);
                } else {
                    res.status(200).json(results);
                }
                mongoclient.close();
            });
        });
    });
});

app.put('/api/:id', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.update(
                { _id: objectId(req.params.id) },
                { $push: { comentarios: { id_comentario: new objectId(), comentario: req.body.comentario } } },
                {},
                function (err, records) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                }
            );
        });
    });
});

app.delete('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.update(
                {},
                { $pull: { comentarios: { id_comentario: objectId(req.params.id) } } },
                { multi: true },
                function (err, records) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }

                    mongoclient.close();
                }
            );
        });
    });
});
