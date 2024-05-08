const http = require('http');
const url = require('url');
const fs = require('fs');
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "bkbv16z8q8ujm9cwbfmf-mysql.services.clever-cloud.com" ,
    user: "u9vimxxm4wnf0euw",
    password: "antcCNYhMAP2H4pIWcKR",
    database: "bkbv16z8q8ujm9cwbfmf",
    port: 3306

    //host: process.env.MYSQL_HOST,
    //user: process.env.MYSQL_USER,
    //password: process.env.MYSQL_PASSWORD,
    //database: process.env.MYSQL_DB,
    //port: process.env.MYSQL_PORT


    //************** MIAS**/
    //host: process.env.MYSQL_ADDON_HOST,
    //user: process.env.MYSQL_ADDON_USER,
    //password: process.env.MYSQL_ADDON_PASSWORD,
    //database: process.env.MYSQL_ADDON_DB,
    //port: process.env.MYSQL_ADDON_PORT

    //SANTIAGO//
    
        //MYSQL_DB="bzuwxnqgqbljdkyhlfsu"
        //MYSQL_HOST="bzuwxnqgqbljdkyhlfsu-mysql.services.clever-cloud.com"
        //MYSQL_PASSWORD="mWUlddmMu4rIxk7dPSNb"
        //MYSQL_PORT="3306"
        //MYSQL_URI="mysql://uith0a4r0kr9fvbe:mWUlddmMu4rIxk7dPSNb@bzuwxnqgqbljdkyhlfsu-mysql.services.clever-cloud.com:3306/bzuwxnqgqbljdkyhlfsu"
        //MYSQL_USER="uith0a4r0kr9fvbe"
        //MYSQL_VERSION="8.0"
});

connection.connect(err => {
    if (err) {
        console.error('Error de conexión a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos');
});


const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    const path = reqUrl.pathname;
    

    if (req.method === 'GET') {

        if (path === '/') {
            fs.readFile('./public/index.html', (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Error interno del servidor');
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(data);
                }
            });
        }

        else if (path === '/guardar') {
            fs.readFile('./public/guardar.html', (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Error interno del servidor');
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(data);
                }
            });
        }
        else if (path === '/actualizar') {
            fs.readFile('./public/actualizar.html', (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Error interno del servidor');
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(data);
                }
            });
        }
        else if (path === '/tabla') {
            fs.readFile('./public/tabla.html', (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end('Error interno del servidor');
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.end(data);
                }
            });
        } else if (path === '/reportes') {
            connection.query('SELECT * FROM Reportes INNER JOIN TablaDeIntermedio ON Reportes.rep_id = TablaDeIntermedio.rep_id', (err, results) => {
                if (err) {
                    console.error('Error al obtener los reportes:', err);
                    res.statusCode = 500;
                    res.end('Error interno del servidor');
                    return;
                }
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(results));
            });
        }
        
        else {
            res.statusCode = 404;
            res.end('Página no encontrada');
        }
    }
    else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const querystring = require('querystring');
            const formData = querystring.parse(body);
            
            if (path === '/guardar') {
                connection.query('INSERT INTO Reportes (rep_nombre, rep_prioridad, rep_tipo_de_error) VALUES (?, ?, ?)', [formData.nombre, formData.prioridad, formData.tipo_error], (err, result) => {
                    if (err) {
                        console.error('Error al insertar el reporte:', err);
                        res.statusCode = 500;
                        res.end('Error interno del servidor');
                        return;
                    }
                    const repId = result.insertId;
                    console.log('Reporte insertado con ID:', repId);
                    connection.query('INSERT INTO TablaDeIntermedio (rep_id, pro_id) VALUES (?, ?)', [repId, 1], (err, result) => {
                        if (err) {
                            console.error('Error al actualizar el estado del reporte:', err);
                            res.statusCode = 500;
                            res.end('Error interno del servidor');
                            return;
                        }
                        console.log('Estado del reporte actualizado');
                        res.end('Reporte guardado correctamente');
                    });
                });
            } else if (path === '/actualizar') {
                const { reporte_id, nuevo_estado } = formData;
                connection.query('UPDATE TablaDeIntermedio SET pro_id = ? WHERE rep_id = ?', [nuevo_estado, reporte_id], (err, result) => {
                    if (err) {
                        console.error('Error al actualizar el estado del reporte:', err);
                        res.statusCode = 500;
                        res.end('Error interno del servidor');
                        return;
                    }
                    console.log('Estado del reporte actualizado');
                    res.end('Estado del reporte actualizado correctamente');
                });
            }
        });
    }
});

const PORT = process.env.PORT || 3080;

server.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
