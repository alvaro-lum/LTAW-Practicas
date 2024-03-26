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

    }else if (url.pathname == '/product.html'){
        fs.readFile(FRONT_PATH + '/product.html', (err,data) => { if(!err){
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
    }else if (url.pathname == '/añadirCarro.html'){
        let product = url.searchParams.get("cart");
        cookies = getCookies(req)
        if(checkIDExists(product)) {
            if(cookies['cart'] == null || cookies['cart'] == "" ){
                res.setHeader('Set-Cookie', "cart="+product+"_1");
                OK(res,"200 OK")
            }else{
                cart = cookies['cart'].split(":")
                cart = convert2Dic(cart,"_")
                if(cart[product] != null){
                    cart[product] = String(Number(cart[product]) + 1)
                }else{
                    cart[product] = "1";
                }
                let cartCookie = ""
                Object.keys(cart).forEach(function(id){
                    cartCookie += id + "_" + cart[id] +":"
                });
                cartCookie = cartCookie.substring(0, cartCookie.length - 1);
                res.setHeader('Set-Cookie', ["cart="+cartCookie]);
                OK(res, "200 OK")
            }
            }else{
                NOT_OK(res)
            }  
    }else if (url.pathname == '/buscar_pagina.html'){
        fs.readFile(FRONT_PATH + '/buscar_pagina.html', (err,data) => { if(!err){
            let productFind = url.searchParams.get("product");
            productList = findProduct(productFind)
            cookies = getCookies(req)
            data = manageMain(data, productList,cookies)
            OK(res,data)}else{NOT_OK(res)}});

    }else if (url.pathname == '/buscar_categoria'){
        fs.readFile(FRONT_PATH + '/buscar_pagina.html', (err,data) => { if(!err){
            let productFind = url.searchParams.get("category");
            productList = findProductByCategory(productFind)
            cookies = getCookies(req)
            data = manageMain(data, productList,cookies)
            OK(res,data)}else{NOT_OK(res)}});

    }else if (url.pathname == '/productos'){
        let productFind = url.searchParams.get("product");
        if (productFind != ""){
            productList = findProduct(productFind)
        }else{
            productList = []
        }
        OK(res,JSON.stringify(productList))

    }else if (url.pathname == '/serchProduct'){
        let productFind = url.searchParams.get("product")
        productList = findProduct(productFind)
        if (productList.length == 1) {
            OK(res,JSON.stringify(["product", productList[0][1]]))
        }else{
            OK(res,JSON.stringify(["buscar_pagina", productList]))
        }
    }else if (url.pathname == "/closeSesion"){
        cookies = getCookies(req)
        for (let i = 0; i < DATABASE.clients.length; i++) {
            if (DATABASE.clients[i].userName == cookies.userName){
                if(cookies.cart != undefined && cookies.cart != null){DATABASE.clients[i].cart = cookies.cart}else{DATABASE.clients[i].cart = ""}
                fs.writeFile('tienda.json', JSON.stringify(DATABASE, null,2), (err) =>{
                    if (err) throw err;
                    console.log('Updated JSON');
                });
                break;
            }
        }
        res.setHeader('Set-Cookie', ["cart= ; expires=Thu, 01 Jan 1970 00:00:00 GMT", "userName= ; expires=Thu, 01 Jan 1970 00:00:00 GMT"] );
        OK(res,"200 OK")

    }else if (url.pathname == '/ls'){ 
        OK(res,DIRECTORY)

    }else if(url.pathname == '/getReviews'){
        let reviews = []
        for(i = 0; i < DATABASE.clients.length; i++){
            if (DATABASE.clients[i].review != "" && DATABASE.clients[i].userName != "root"){
                let reviewObj = {
                    name: DATABASE.clients[i].name,
                    coment: DATABASE.clients[i].review,
                    imagen: DATABASE.clients[i].image
                }
                reviewsnpush(reviewObj)
            }
        }
        OK(res,JSON.stringify(reviews))
    }else{
        fs.readFile(FRONT_PATH + url.pathname.slice(1,), (err, data) => { if (!err){OK(res,data)}else{
            NOT_OK(res)}});
    }
    
}else if(req.pathname == "POST"){
    if (url.pathname == '/login'){
        req.on('data', (content)=> {
            content = (content.toString()).split("&")
            content = convert2Dic(content,"=")
            if(content["userName"] != ""){
                check = checkUser(content['userName'] , content['password'] , DATABASE)
                if (check[0]){
                    if (check[1] != "" && check[1] != undefined){
                        res.setHeader('Set-cookie', ["userName"+content['userName'], "cart=" + check[1] ]);
                    }else{
                        res.setHeader('Set-Cookie',["userName="+content['userName']]);
                    }
                    OK(res,"")
                }else{
                    NOT_OK(res)
                }
            }else{
                NOT_OK(res)
            }
        });
    }else if(url.pathname == '/deleteProductCart') {
        let id = url.searchParams.get("id");
        cookies = getCookies(req)
        cartCookie = cookies['cart'].split(":")
        cartCookie = convert2Dic(cartCookie,"_")
        delete cartCookie[id]
        var updatedCart = '';
        if (cartCookie.length <=0 || String(cartCookie) == {} ){
          updatedCart = ''
          res.setHeader('Set-Cookie', ["cart= ; expires=Thu, 01 Jan 1970 00:00:00 GMT"]);
        }else{
          for (var clave in cartCookie) {
            updatedCart += clave + '_' + cartCookie[clave] + ':';
          }
          updatedCart = updatedCart.slice(0, -1);
          res.setHeader('Set-Cookie',["cart="+updatedCart]);
        }
  
        OK(res,"200 OK")

    }else if(url.pathname == '/purchase'){
        req.on('data', (content)=> {
          content =  JSON.parse(content.toString())
          cookies = getCookies(req)
          for (let i = 0; i <  DATABASE.clients.length; i++){
            if (DATABASE.clients[i].userName == cookies.userName){
                DATABASE.clients[i].pedidos.push(content)
                break; 
            }
          }

          for (let i = 0; i <  DATABASE.products.length; i++){
            for (let j = 0; j <  content.products.length; j++){
              if (DATABASE.products[i].id == content.products[j][0]){
                DATABASE.products[i].stock = DATABASE.products[i].stock - content.products[j][1]
                break; 
              }
            }
          }

          fs.writeFile('tienda.json', JSON.stringify(DATABASE, null, 2), (err) => {
            if (err) throw err;
            console.log('Updated JSON');
          });
          //res.setHeader('Set-Cookie', ["orders=" + cookie , "cart= ; expires=Thu, 01 Jan 1970 00:00:00 GMT"]); //Añadir cookies de pedido, eliminar cookie carrito
          res.setHeader('Set-Cookie', ["cart= ; expires=Thu, 01 Jan 1970 00:00:00 GMT"]); //Eliminar cookies carrito 
          
          OK(res,"OK")
        });
      }
    }
  });
    
server.listen(PUERTO);
console.log("Servidor activado. Escuchando en: " + PUERTO);


