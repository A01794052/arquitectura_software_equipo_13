document.getElementById('symptoms-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío normal del formulario

    const symptoms = document.getElementById('symptoms').value;

    fetch('/register_symptoms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ symptoms })
    })
    .then(response => response.json())
    .then(data => {
        const messageDiv = document.getElementById('message');
        messageDiv.className = data.success ? 'success' : 'error'; // Cambiar clase según el resultado
        messageDiv.textContent = data.message; // Mostrar mensaje de éxito o error
        if (data.success) {
            document.getElementById('symptoms-form').reset(); // Limpiar el formulario
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.className = 'error';
        messageDiv.textContent = 'Error en la conexión al servidor.';
    });
});
