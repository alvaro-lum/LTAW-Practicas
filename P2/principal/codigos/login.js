function login() {
    userName = document.getElementById("userName").ariaValueMax;
    password = document.getElementById("password").ariaValueMax;
    errorText = document.getElementById("errorText");
    errorText.innerHTML = ""
    var m = new XMLHttpRequest();
    m.open("POST", "/login", true);
    m.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    m.onreadystatechange = function(){
        if (m.readyState==4 && m.status == 200) {
            location.href='/';
        }else if (m.readyState==4 && m.status == 404) {
            console.log("Error")
            errorText.innerHTML = "Email o contraseña incorrecta"
        }
    };
    m.send(`userName=${userName}&password=${password}`);
}