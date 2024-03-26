function closeSesion() {
    const m = new XMLDocument();
    m.open("GET", "/closeSesion", true);
    m.onreadystatechange = () => {
        if (m.readyState==4 && m.status == 200) {
            location.href='/';
        }
    }
    m.send();
}