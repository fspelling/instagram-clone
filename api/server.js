var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var multiParty = require('connect-multiparty');
var objectId = require('mongodb').ObjectId;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multiParty());

var port = 8080;

app.listen(port);

var db = new mongodb.Db('instagram', new mongodb.Server('localhost', 27017, {}));

console.log(`servidor http esta executando na porta ${port}`);

app.get('/api', function (req, res) {
    db.open(function (erro, mongoClient) {
        mongoClient.collection('postagens', function (erro, collection) {
            collection.find({}).toArray(function (erro, result) {
                if (erro)
                    res.json(erro);
                else
                    res.json(result);

                mongoClient.close();
            });
        });
    });
});

app.get('/api/:id', function (req, res) {
    db.open(function (erro, mongoClient) {
        mongoClient.collection('postagens', function (erro, collection) {
            var id = req.params.id;

            collection.find(objectId(id)).toArray(function (erro, result) {
                if (erro)
                    res.json(erro);
                else {
                    if (result[0] == undefined)
                        res.status(400).json(result[0]);
                    else
                        res.json(result[0]);
                }

                mongoClient.close();
            });
        });
    });
});

app.post('/api', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.he

    var dados = req.body;
    res.send(dados);

    /*db.open(function (erro, mongoClient) {
        mongoClient.collection('postagens', function (erro, collection) {
            collection.insert(dados, function (erro, records) {
                if (erro)
                    res.json(erro);
                else
                    res.json('inclusão realizada com sucesso');

                mongoClient.close();
            });
        });
    });*/
});

app.put('/api/:id', function (req, res) {
    db.open(function (erro, mongoClient) {
        mongoClient.collection('postagens', function (erro, collection) {
            var id = req.params.id;

            collection.update({ _id: { $eq: objectId(id) } }, { $set: { titulo: req.body.titulo } }, {}, function (erro, records) {
                if (erro)
                    res.json(erro);
                else
                    res.json(records);

                mongoClient.close();
            });
        });
    });
});

app.delete('/api/:id', function (req, res) {
    db.open(function (erro, mongoClient) {
        mongoClient.collection('postagens', function (erro, collection) {
            var id = req.params.id;

            collection.remove({ _id: { $eq: objectId(id) } }, true, function (erro, records) {
                if (erro)
                    res.json(erro);
                else
                    res.json(records);

                mongoClient.close();
            });
        });
    });
});