const PORT = 8086;
const http = require('http');
const server = http.createServer(function (request, response) {
    let body = [];
    request.on('error', err => {
        console.log(err);
    }).on('data', chunk => {
        console.log(chunk.toString());
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log("body", body);
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end(`
        <html class="sui-componentWrap">
            <head>
                <script charset="utf-8" async="" src="xxxx">
                </script>
            </head>
            <title>极客时间_百度搜索</title>
            <style>
                #container {
                    width:500px;
                    height:300px;
                    display:flex; 
                    background-color:rgb(255,255,255);
                }
                #container #myid {
                    width: 200px;
                    height: 100px;
                    background-color: rgb(255,0,0);
                }
                #container .c1 {
                    flex: 1;
                    background-color:rgb(0,255,0);
                }
            </style>
            <body>
                <div id="container">
                    <div id="myid"></div>
                    <div class="c1"></div>
                </div>
            </body>
        </html>
        `);
    })
});
server.listen(PORT);