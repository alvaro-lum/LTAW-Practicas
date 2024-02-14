// Test se hace en --> http://localhost:9090/

//Modules
const fs = require('fs');
const http = require('http');
const { arch } = require('os');

const PUERTO = 9090;
const DIRECTORY = returnFiles("./" , "-")


//-- Imprimir informacion sobre el mensaje de solicitud
function print_info_req(req) {

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
    const myURL = new URL(req.url, 'http://' + req.headers['host']);
    console.log("URL completa: " + myURL.href);
    console.log("  Ruta: " + myURL.pathname);

    return myURL
}

//Ahora creamos la funcion para el 200 Ok
function OK(res,data){
    res.statusCode = 200;
    res.statusMessage = "OK";
    res.setHeader('Content-Type', 'text/plain');
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
  res.setHeader('Content-Type', 'text/plain');
  fs.readFile('error.html', (err,data) => { if(!err){   //Con este codigo cargamos el fichero html de error creado.
    res.write(data);
    res.end()
    console.log("  ERROR 404 NOT FOUND...")
  }});

}

//Funcion para devolver archivos
function returnFiles(dir,space){
    let sendText = ""
    const archivos = fs.readdirSync(dir);
    for(let i = 0; i < archivos.length; i++) {
        if(archivos[i].split(".").length > 1){
            sendText += "<p> " + space + " " + archivos[i] + "</p>";
        }else{
            sendText += "<p> " + space + " " + archivos[i] + "</p>";
            sendText += returnFiles(dir + "/" + archivos[i], space + "---")
        }
    }
    return sendText
}
//-- SERVIDOR: Bucle principal de atención a clientes
const server = http.createServer((req, res) => {

  //-- Petición recibida
  //-- Imprimir información de la petición
  url = print_info_req(req);
  if(req.method == "GET"){
    //Aplicamos la mejora /ls pedida en la practica
    if(url.pathname != '/ls'){
        if(url.pathname == '/'){ url.pathname = "/principal/index.html"}
        fs.readFile(url.pathname.slice(1,), (err, data) => {if(!err){OK(res,data)}else{NOT_OK(res)}});
    }else{
        OK(res,DIRECTORY)
    }
  }
});


server.listen(PUERTO);
console.log("Servidor activado. Escuchando en: " + PUERTO);