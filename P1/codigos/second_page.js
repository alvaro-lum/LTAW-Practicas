document.addEventListener("DOMContentLoaded", function(event) {
    function pasFoto(step) {
        // Tomar fotos
        var image = document.getElementById("pic_producto");
        var fileListLen = 3;
        var img_url = image.src.split("/");
        var file = img_url[img_url.length - 1].split("_");
        var index = parseInt(file[file.length - 1].split(".")[0]);

        //Actualizarla
        index += parseInt(step);
        if (index < 0) { index = fileListLen - 1; }
        index = Math.abs(index % fileListLen);

        var ppt = document.getElementById("ppt" + String(index));
        ppt.style.textShadow = "0.75px 0.75px 0 #1b1b1b1, -0.75px -0.75px 0 #1b1b1b,  0.75px -0.75px 0 #1b1b1b,   -0.75px 0.75px 0 #1b1b1b";

        file[file.length - 1] = String(index) + ".png";
        img_url[img_url.length - 1] = file.join("_");

        image.src = img_url.join("/");
        file = img_url[img_url.length - 1].split("_");
        index = file[file.length - 1].split(".")[0];
    }

    var prev = document.getElementById("fotoBotonPrev");
    var next = document.getElementById("fotoBotonNext");

    var ppt0 = document.getElementById("ppt0");
    var ppt1 = document.getElementById("ppt1");
    var ppt2 = document.getElementById("ppt2");

    prev.onclick = function() {
        ppt0.style.textShadow = "none";
        ppt1.style.textShadow = "none";
        ppt2.style.textShadow = "none";
        pasFoto(-1);
    };
    next.onclick = function() {
        ppt0.style.textShadow = "none";
        ppt1.style.textShadow = "none";
        ppt2.style.textShadow = "none";
        pasFoto(1);
    };
});

function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Para un desplazamiento suave
    });
  }
  

