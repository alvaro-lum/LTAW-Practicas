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
    }else if (url.pathname == '/profile.html'){
        fs.readFile(FRONT_PATH + '/profile.html', (err,data) => { if(!err){
          cookies = getCookies(req)
          data = manageProfilePage(data,cookies)
        OK(res,data)}else{NOT_OK(res)}});

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

function manageMain(data, DATABASE , cookies){
  data = data.toString()
  data = data.replace("<!--INSERTSEARCHBAR-->",SEARCHBAR);
  data = data.replace("<!--INSERTFOOTER-->",FOOTER);
  if(cookies['userName'] != null){
    data = data.replace("Log in",cookies['userName']);
    data = data.replace("login.html", "profile.html");
  }

  for (let i = 0; i <  DATABASE.products.length; i++){
    data = data.replace("placeholderTittle",  DATABASE.products[i].name);
    data = data.replace("placeholderSlogan",  DATABASE.products[i].slogan);
    data = data.replace("placeholderImage", imagePath + String( DATABASE.products[i].img[0]));
    data = data.replace("placeholderID" , DATABASE.products[i].id )
  }
  return data
}

function manageProductData(data, DATABASE , id ,cookies){

    data = data.toString()
    data = data.replace("<!--INSERTSEARCHBAR-->",SEARCHBAR);
    data = data.replace("<!--INSERTFOOTER-->",FOOTER);
    if(cookies['userName'] != null){
      data = data.replace("Log in",cookies['userName']);
      data = data.replace("login.html", "profile.html");
    }
  
    for (let i = 0; i < DATABASE.products.length; i++){
        if (id ==  DATABASE.products[i].id){
          data = data.replace("placeholderTittle",  DATABASE.products[i].name);
          data = data.replace("placeholderImage", imagePath + String( DATABASE.products[i].img[0]));
          data = data.replace("placeholderIntro",  DATABASE.products[i].descripcion);
  
          data = data.replace("<!--placeholderWholePrice-->",  DATABASE.products[i].price);
          data = data.replace("<!--placeholderMonthPrice-->",  (DATABASE.products[i].price/12).toFixed(2));
  
          let reservedStock = 0
  
          if(cookies['cart'] != null){
            cartCookie = cookies['cart'].split(":")
            cartCookie = convert2Dic(cartCookie,"_")
            for (let key in cartCookie) {
              if (key ==  DATABASE.products[i].id){
                  reservedStock = Number(cartCookie[key])
              }
            }
          }
          let stock = DATABASE.products[i].stock - reservedStock
  
          data = data.replace("replaceStock",  stock);
          if (stock > 0 ){
            data = data.replace("replaceClass", "'buyButton' onclick='buyButton(REPLACE_ID);'");
            data = data.replace("REPLACE_ID", id);
            data = data.replace("replaceButtonText", "Añadir al carrito");
          }else{
            data = data.replace("replaceClass", "noStock");
            data = data.replace("replaceButtonText", "Sin stock");
          }
          
          for (let j = 0; j <  DATABASE.products[i].caracteristics.length; j++){
            data = data.replace("placeholderESP",  DATABASE.products[i].caracteristics[j]);
          }
          break;
        }
    }
    return data
  }
  function manageSearchPage(data ,list,cookies){

    data = data.toString()
    data = data.replace("<!--INSERTSEARCHBAR-->",SEARCHBAR);
    data = data.replace("<!--INSERTFOOTER-->",FOOTER);
    if(cookies['userName'] != null){
      data = data.replace("Log in",cookies['userName']);
      data = data.replace("login.html", "profile.html");
    }data = data.replace("<!--INSERTSEARCHBAR-->",SEARCHBAR);
    data = data.replace("<!--INSERTFOOTER-->",FOOTER);
  
    if (list.length == 0){
      data = data.replace("replaceText" , "Lo sentimos,no tenemos ninguna sugerencia para esta busqueda." + "\n" +
       "Es probable que no tengamos ese producto :(  <img id='triste' src='imagenes/triste.jpeg'> ")
    }else{
      text = "<p>Estos son los productos mas similares a tu busqueda:</p>"
      for (let i=0; i < list.length; i++) {
        text += "<button class='suggestionButton' onclick=\"location.href='/product.html?product_id=" + list[i][1]+"';\">"+ list[i][0] +"</button>"
      }
      data = data.replace("replaceText" , text)
    }
    return data
  }

  function manageProfilePage(data,cookies){
    data = data.toString()
    data = data.replace("<!--INSERTSEARCHBAR-->",SEARCHBAR);
    data = data.replace("<!--INSERTFOOTER-->",FOOTER);
    if(cookies['userName'] != null){
      user = findUserByTag(cookies["userName"])
      data = data.replace("Log in",cookies['userName']);
      data = data.replace("login.html", "profile.html");
      data = data.replace("REPLACEIMG",user['image']);
      data = data.replace("userTag",cookies["userName"]);
      data = data.replace("userName",user["name"]);
      data = data.replace("userEmail",user["email"]);
      if(user.pedidos.length == 0){
        data = data.replace("<!--REPLACEORDERS-->","<p>No tienes ningun pedido</p>");
      }else{
        let components = ""
        for (let i = 0; i <  user.pedidos.length; i++){
          components += "<div class='order'> <p class='orderDivText'>Pedido para: "+ user.pedidos[i].data.user + "</p>\
          <p class='orderDivText3'>Dirección de envio: " +user.pedidos[i].data.dir  +" </p>\
          <p class='orderDivText3'>Numero de tarjeta: "+ user.pedidos[i].data.card + "</p> <p class='orderDivText3'> Productos comprados: </p>  "
          let total = 0
          for (let j = 0; j <  user.pedidos[i].products.length; j++){
            newOrder = ORDERTEMPLATE
            let product = findProductById(user.pedidos[i].products[j][0])
            newOrder = newOrder.replace("TITTLE",product.name);
            newOrder = newOrder.replace("UNITS",user.pedidos[i].products[j][1]);
            let price = product.price * Number(user.pedidos[i].products[j][1])
            newOrder = newOrder.replace("PRICE",price);
            components += newOrder
            total +=price
          }
          components += "<p class='orderDivText2'>Total: " + total +" €</p>  </div>"
        }
        data = data.replace("<!--REPLACEORDERS-->",components);
      }
  
    }
    return data
  }

  async function manageCart(data,cookies , callback){
    data = data.toString()
    data = data.replace("<!--INSERTSEARCHBAR-->",SEARCHBAR);
    data = data.replace("<!--INSERTFOOTER-->",FOOTER);
    if(cookies['userName'] != null){
      data = data.replace("Log in",cookies["userName"]);
      data = data.replace("login.html", "profile.html");
      if(cookies['cart'] != null && cookies['cart'].length != 0  ){
        fs.readFile(FRONT_PATH + "cartProduct.html", (err, component) => { 
          if(!err){
            component = component.toString()
            cartCookie = cookies['cart'].split(":")
            cartCookie = convert2Dic(cartCookie,"_")
            productsComponents = "<p id='cartTittle'>Lista de productos</p> \n <div id='productDiv' >"
            totalPrice = 0
            for (let key in cartCookie) {
              newComponent = component
              let id = key
              let stock = cartCookie[key]
              let componentData = findProductById(id)
              newComponent = newComponent.replace("TITTLE",componentData.name);
              newComponent = newComponent.replace(/REPLACE_ID/g,id);
              newComponent = newComponent.replace(/PRICEUNIT/g, String(componentData.price));
              newComponent = newComponent.replace("value='0'", "value='" + stock+"'");
              newComponent = newComponent.replace("TOTALPRICE", String(Number(stock) * Number(componentData.price)));
              newComponent = newComponent.replace("replaceMAX", componentData.stock);
              totalPrice += Number(stock) * Number(componentData.price)
              productsComponents += newComponent + "\n";
            }
            const inputUI = "<div id=inputDataCart > <p class='textUserCart'>Tarjeta de crédito</p> \
            <input type='number' id='cardClient' class='userDataInput' placeholder='Introduce tu tarjeta de credito para completar el pago'/> \
            <p class='textUserCart' >Dirección de envio</p> <input id='dirClient' type='text' class='userDataInput' placeholder='Introduce tu direccion para completar el pago'/>\
            <p id='feedbackText'></p> </div>"
            productsComponents += " <p id='totalPriceFinal'> Total: " + String(totalPrice) + " € </p>" + inputUI + "</div> " ;
            data = data.replace("<!--REPLACE_PRODUCTS-->",productsComponents);
            data = data.replace("REPLACE_TEXT","Realizar pedido");
            data = data.replace("REPLACE_URL","sendPurchase()");
            callback(null,data)
          }else{console.log("error de lectura")}
        })
        
  
      }else{
        data = data.replace("<!--REPLACE_PRODUCTS-->", "<p id='cartTittle' style='margin: auto; margin-top: 2%'> No tienes ningun producto en la cesta :( </p>");
        data = data.replace("extraStyle=''","style='margin: auto; margin-top: 2%'");
        data = data.replace("REPLACE_TEXT","Volver a la pagina de inicio");
        data = data.replace("REPLACE_URL","location.href='/';");
        callback(null,data)
      }
      
    }else{
      data = data.replace("<!--REPLACE_PRODUCTS-->"," <p id='cartTittle'  style='margin: auto; margin-top: 2%'> Inicia sesión para poder realizar la compra </p>");
      data = data.replace("extraStyle=''","style='margin: auto; margin-top: 2%'");
      data = data.replace("REPLACE_URL","location.href='login.html';");
      data = data.replace("REPLACE_TEXT","Inicia sesion");
      callback(null,data)
    }
    
  }

  function findProduct(search){
    const filteredArray = []
     DATABASE.products.map(function(elemento) {
      if ((elemento.name).toUpperCase().startsWith(search.toUpperCase())) {
        filteredArray.push([elemento.name ,elemento.id]);
      }
    });
    return filteredArray
  }

  function findProductByCategory(search){
    const filteredArray = []
     DATABASE.products.map(function(elemento) {
      if ((elemento.category).toUpperCase().startsWith(search.toUpperCase())) {
        filteredArray.push([elemento.name ,elemento.id]);
      }
    });
    return filteredArray
  }

  function findProductById(id){

    let element;
    DATABASE.products.map(function(elemento) {
      if (elemento['id'] == id) {
        element = elemento
      }
    });
    return element
  }

  function findUserByTag(tag){

    let user;
    DATABASE.clients.map(function(client) {
      if (client['userName'] == tag) {
        user = client;
  
      }
    });
    return user
  }

  function convert2Dic(params , split){

    const dict = {};
    for (let i = 0; i < params.length; i++){
      param = params[i].split(split)
      dict[param[0]] = param[1];
    }
    return dict
  }

  function getCookies(req){
    let cookie = req.headers.cookie
    if (cookie) {
      cookie = cookie.replace(/\s/g, "");
      cookie = cookie.split(";")
      cookie = convert2Dic(cookie,"=")
      return cookie
    }else{
      return {}
    }
  }

  