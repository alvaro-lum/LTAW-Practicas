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

        
    }
})