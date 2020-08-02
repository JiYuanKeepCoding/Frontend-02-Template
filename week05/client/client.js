const net = require("net");
const parser = require("./parser");
const images = require("images");
const render = require("./render")

class Request {
    constructor(options) {
        this.method = options.method || "GET";
        this.host = options.host || "localhost";
        this.port = options.port || 8086;
        this.path = options.path || "/";
        this.headers = options.headers || {};
        this.body = options.body || {};
        if (!this.headers["Content-Type"]) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        if (this.headers["Content-Type"] === "application/json")
            this.bodyText = JSON.stringify(this.body);
        else if (this.headers["Content-Type"] === "application/x-www-form-urlencoded")
            this.bodyText = Object.keys(this.body).map(key => `${key} = ${encodeURIComponent(this.body[key])}`).join('&');
    }

    formRequestHeader() {
        const methodProtocol = `${this.method.toUpperCase()} / HTTP/1.1`
        let contentLength = 0;
        this.bodyText.split("").forEach(char => {
            contentLength += Math.ceil(Math.log2(char.codePointAt(0)) / 8)
        });
        this.headers["Content-Length"] = contentLength;
        const headerParamStr = Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join("\n");
        return `${methodProtocol}\n${headerParamStr}\n`
    }

    send() {
        return new Promise((resolve, reject) => {
            let client = new net.Socket();
            const connection = client.connect(this.port, this.host);
            const parser = new ResponseParser();
            const headerStr = this.formRequestHeader();
            client.on('data',(chunk)=>{
                parser.receive(chunk.toString());
                if (parser.bodyParser.isFinished) {
                    resolve({
                        headers: parser.header,
                        body: parser.bodyParser.content.join('')
                    });
                    connection.end();
                }
            })
            client.on('error',(e)=>{
                reject(e);
            })
            client.on('connect',(mes)=>{
                client.write(`${headerStr}\n${this.bodyText}`);
            })
        });
    }
}

class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1;
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5;
        this.WAITING_HEADER_BLOCK_END = 6;
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE;
        this.statusLine = "";
        this.header = {};
        this.headerName = "";
        this.headerValue = "";
        this.bodyParser = null;
    }
    
    receive(string) {
        for (let i = 0; i < string.length; i ++) {
            this.receiveChar(string.charAt(i));
        }
    }
    
    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === "\r") {
                this.current = this.WAITING_STATUS_LINE_END;
            } else {
                this.statusLine += char;
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === "\n") {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ":") {
                this.current = this.WAITING_HEADER_SPACE;
            } else if (char === "\n") {
                if (this.header['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new ChunkedBodyParser();
                }
                this.current = this.WAITING_BODY
            } else {
                this.headerName += char;
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char !== " ") {
                this.headerValue += char;
                this.current = this.WAITING_HEADER_VALUE;
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === "\r") {
                this.header[this.headerName] = this.headerValue;
                this.headerName = "";
                this.headerValue = "";
                this.current = this.WAITING_HEADER_LINE_END;
            } else {
                this.headerValue += char;
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === "\n") {
                this.current = this.WAITING_HEADER_NAME;
            }
        } else if (this.current === this.WAITING_BODY) {
            this.bodyParser.receiveChar(char);
        }
    }
}

class ChunkedBodyParser {

    constructor() {
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;
        this.READING_CHUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;

        this.current = this.WAITING_LENGTH;
        this.length = 0;
        this.content = [];
        this.isFinished = false;
    }

    receiveChar(char) {
        if (this.current === this.WAITING_LENGTH) {
            if (char === "\r") {
                this.current = this.WAITING_LENGTH_LINE_END;
                if (this.length === 0) {
                    this.isFinished = true;
                }
            } else {
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if (this.current === this.WAITING_LENGTH_LINE_END) {
            if (char === "\n") {
                this.current = this.READING_CHUNK;
            }
        } else if (this.current === this.READING_CHUNK) {
            this.length -= Buffer.from(char, "utf-8").length;
            this.content.push(char);
            if (this.length === 0) {
                this.current = this.WAITING_NEW_LINE;
                this.isFinished = true;
            }
        }
    }
}

void async function (){
    let request = new Request({
        method: "POST",
        host: "localhost",
        port: 8086,
        path: "/",
        headers: {
            ["x-Foo2"]: "customized"
        },
        body: {
            key: "value"
        }
    });

    let response = await request.send();
    const dom = parser.parseHTML(response.body);

    let viewport = images(800, 600);
    render(viewport, dom);
    viewport.save("./viewport.jpg")
}();