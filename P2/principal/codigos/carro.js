function loadDOMdata(){
    let inputs = document.getElementsByClassName('cartProductInput');
    let outputs = document.getElementsByClassName('cartProductPrice3');

    for (let i = 0; i< inputs.length; i++) {
        if(inputs[i] != undefined){
            inputs[i].addEventListener('change', () => {
                outputs[i].textContent = String(Number(inputs[i].getAttribute('unit')) * Number(inputs[i].value))
                updateTotal()
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    loadDOMdata()
})

function updateTotal() {
    let total = 0
    let subPrices = document.getElementsByClassName('cartProductPrice3');
    for (let i = 0; i < subPrices.length; i++) {
        total += Number(subPrices[i].textContent)
    }
    document.getElementById('totalPriceFinal').textContent = "Total" + String(total) + " €"
    if (total <= 0){
        location.reload();
    }
}