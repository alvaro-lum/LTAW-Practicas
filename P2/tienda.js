// Test se hace en --> http://localhost:9090/

//Modules
const fs = require('fs');
const http = require('http');
const { getCookies } = require('undici-types');

const PUERTO = 9090;
const FRONT_PATH = "principal/"
const DIRECTORY = returnFiles("./" , "-")

DATABASE = fs.writeFileSync('tienda.json', 'utf-8')
DATABASE = JSON.parse(DATABASE)
const imagePath = "imagenes/"

let SEARCHBAR = fs.readFileSync(FRONT_PATH + 'barra_buscadora.html', 'utf-8')
let FOOTER = fs.readFileSync(FRONT_PATH + 'footer.html', 'utf-8')
let ORDERTEMPLATE = fs.readFileSync(FRONT_PATH + 'order_template.html', 'utf-8')

//-- Imprimir informacion sobre el mensaje de solicitud
function print_info_req(req) {
    const myURL = new URL(req.url, 'http://' + req.headers['host']);

    if (true){
        console.log("");
        console.log("Mensaje de solicitud");
        console.log("====================");
        console.log("Método: " + req.method);
        console.log("Recurso: " + req.url);
        console.log("Version: " + req.httpVersion)
        console.log("Cabeceras: ");
    
        //-- Recorrer todas las cabeceras disponibles
        //-- imprimiendo su nombre y su valor
        for (hname in req.headers)
          console.log(`  * ${hname}: ${req.headers[hname]}`);
    
        //-- Construir el objeto url con la url de la solicitud
        console.log("URL completa: " + myURL.href);
        console.log("  Ruta: " + myURL.pathname);
    }

    return myURL
}

//Ahora creamos la funcion para el 200 Ok
function OK(res,data){
    res.statusCode = 200;
    res.statusMessage = "OK";
    res.write(data);
    res.end()
    console.log("   200 OK")

}

//Ahora hacemos el de 404 ERROR
function NOT_OK(res){
  //-- Generar respuesta
  //-- Código: Error. No encontrado
  res.statusCode = 404;
  res.statusMessage = "Not Found";
  res.setHeader('Content-Type', 'text/html');
  fs.readFile(FRONT_PATH + 'error.html', (err,data) => { if(!err){   //Con este codigo cargamos el fichero html de error creado.
    res.write(data);
    res.end()
    console.log("  ERROR 404 NOT FOUND...")
  }});

}
//-- SERVIDOR: Bucle principal de atención a clientes
const server = http.createServer((req, res) => {

  let url = print_info_req(req);
  if(req.method == "GET"){
    if(url.pathname == '/'){fs.readFile(FRONT_PATH + 'index.html', (err,data) => { if(!err) {
        cookies = getCookies(req)
        data = manageMain(data, DATABASE,cookies)
        OK(res,data)
    } else{NOT_OK(res)}});

    }else if (url.pathname == '/producto.html'){
        fs.readFile(FRONT_PATH + '/producto.html', (err,data) => { if(!err){
          cookies = getCookies(req)
          data = manageMain(data, DATABASE,cookies)
          OK(res,data)
        }else{NOT_OK(res)}});
    }else if (url.pathname == '/perfil.html'){
        fs.readFile(FRONT_PATH + '/perfil.html', (err,data) => { if(!err){
          cookies = getCookies(req)
          data = manageMain(data, DATABASE,cookies)
          OK(res,data)
        }else{NOT_OK(res)}});
    }else if (url.pathname == '/carro.html'){
        fs.readFile(FRONT_PATH + '/carro.html', (err,data) => { if(!err){
          cookies = getCookies(req)
           manageCart(data,cookies,function(error, data) {
            if(error) {
                console.log("Error")
            } else {
                OK(res,data)
            }
           });
        }else{NOT_OK(res)}});
    }

  }
});
    
server.listen(PUERTO);
console.log("Servidor activado. Escuchando en: " + PUERTO);