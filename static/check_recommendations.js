document.getElementById('get-recommendations').addEventListener('click', function() {
    //const username = document.getElementById('username').value;
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = ''; // Limpiar mensajes anteriores

    fetch(`/recommendations/username`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const recommendationsDiv = document.getElementById('recommendations');
            recommendationsDiv.innerHTML = ''; // Limpiar recomendaciones anteriores
            data.recommendations.forEach(rec => {
                const div = document.createElement('div');
                div.className = 'recommendation';
                div.textContent = `Para los sintomas: ${rec.sym} \n Tiene que: ${rec.rec}`; // Mostrar cada recomendación
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
});
