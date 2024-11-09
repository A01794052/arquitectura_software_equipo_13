document.getElementById('document-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita el envío normal del formulario

    const documentFile = document.getElementById('document').files[0];
    const formData = new FormData();
    formData.append('document', documentFile);

    fetch('/upload_document', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const messageDiv = document.getElementById('message');
        messageDiv.className = data.success ? 'success' : 'error'; // Cambiar clase según el resultado
        messageDiv.textContent = data.message; // Mostrar mensaje de éxito o error
        if (data.success) {
            document.getElementById('document-form').reset(); // Limpiar el formulario
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const messageDiv = document.getElementById('message');
        messageDiv.className = 'error';
        messageDiv.textContent = 'Error en la conexión al servidor.';
    });
});
