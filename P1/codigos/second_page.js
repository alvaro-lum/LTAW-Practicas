document.addEventListener("DOMContentLoaded", function(event) {
    function pasFoto(step) {

        // Tomar fotos
        image = document.getElementById("pic_producto");
        fileListLen = 3;
        img_url =image.src.split("/");
        fie = img_url[img_url.length - 1].split("_")
        index = parseInt(file[file.length - 1].split(".")[0])

        //Actualizarla
        index += parseInt(step)
        if(index < 0){ index = fileListLen -1}
        index = Math.abs(index % fileListLen)

        var ppt= document.getElementById("ppt" + String(index));
        ppt.style.textShadow = "0.75px 0.75px 0 #1b1b1b1, -0.75px -0.75px 0 #1b1b1b,  0.75px -0.75px 0 #1b1b1b,   -0.75px 0.75px 0 #1b1b1b"

        file[file.length - 1] = String(index) + ".png"
        img_url[img_url.length - 1] = file.join("_")

        image.src = img_url.join("/")
        file = img_url[img_url.length - 1].split("_")
        index = file[file.length - 1].split(".")[0]
    }

    var next = document.getElementById("")
})
