document.addEventListener("DOMContentLoaded", function(event){

    const searchBar = document.getElementsByClassName('searchBar')[0];
    const searchElements = document.getElementsByClassName('searchElements')
    searchBar.addEventListener('input', searchPreview);

    let searchResults = []

    function searchPreview(){
        search = searchBar.value
        if(search.length >= 3){
            const m = new XMLHttpRequest();
            m.open("GET", "/productos?product="+search, true);
            m.onreadystatechange = () => {
                if(m.readyState==4 && m.status== 200) {
                    results = JSON.parse(m.responseText)
                    searchElements.innerHTML = ""
                    for(let i = 0; i < results.length; i++) {
                        searchElements.innerHTML += "<button class='elementSearched' onclick=\"location.href='/product.html?product_id=" + results[i][1]+"';\">"+ results[i][0] +"</button>"
                    }
                    searchResults = results
                }
            }
            m.send();
        }else{
            searchElements.innerHTML = ""
        }
    }
})

