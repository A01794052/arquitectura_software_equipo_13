function onGetRecommendations() {
    //const username = document.getElementById('username').value;
    let messageDiv = document.createElement("div");
    let recommendationsDiv = document.createElement("div");
    let tipoRecommendacion = 1;
    if(document.getElementById("container1").getAttribute("style") == "display: block;") {
        recommendationsDiv = document.getElementById('recommendations1');
        messageDiv = document.getElementById('message1');
    } else {
        messageDiv = document.getElementById('message2');
        recommendationsDiv = document.getElementById('recommendations2');
        tipoRecommendacion = 2
    }
    
    messageDiv.textContent = ''; // Limpiar mensajes anteriores

    fetch(`/recommendations/username/${tipoRecommendacion}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            
            recommendationsDiv.innerHTML = ''; // Limpiar recomendaciones anteriores
            data.recommendations.forEach(rec => {
                const div = document.createElement('div');
                div.className = 'recommendation';
                div.innerHTML = `Para los sintomas: ${rec.symptoms} <br> Tiene que: ${rec.rec}`; // Mostrar cada recomendación
                recommendationsDiv.appendChild(div);
            });
        } else {
            messageDiv.textContent = data.message; // Mostrar mensaje de error
        }
    })
    .catch(error => {
        console.error('Error:', error);
        messageDiv.textContent = 'Error en la conexión al servidor.';
    });
}

Array.from(document.getElementsByClassName('getrecommendations')).forEach(element => {
    element.addEventListener('click', onGetRecommendations);
});

function muestraDoctores(event) {
    document.getElementById("container1").setAttribute("style", "display: none;")
    document.getElementById("container2").setAttribute("style", "display: block;")
    document.getElementById("selectai").setAttribute("class", "")
    document.getElementById("selectdoctors").setAttribute("class", "selected")
}

function muestraAI(event) {
    document.getElementById("container1").setAttribute("style", "display: block;")
    document.getElementById("container2").setAttribute("style", "display: none;")
    document.getElementById("selectai").setAttribute("class", "selected")
    document.getElementById("selectdoctors").setAttribute("class", "")
}
