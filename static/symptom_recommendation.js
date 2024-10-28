var symptomId;
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);

    // Obtén el valor del parámetro 'id'
    symptomId = urlParams.get('id');
}
document.getElementById('submit-recommendation').addEventListener('click', function() {
    
    const recommendation = document.getElementById('recommendation').value;

    if (!symptomId || !recommendation) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    fetch('/submit_recommendation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptom_id: symptomId, recommendation: recommendation }),
    })
    .then(response => response.json())
    .then(data => {
        const message = document.getElementById('response-message');
        if (data.success) {
            message.textContent = 'Recomendación grabada exitosamente.';
        } else {
            message.textContent = 'Error al grabar la recomendación: ' + data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response-message').textContent = 'Error al conectar con el servidor.';
    });
});

// Mostrar modal con documentos
document.getElementById('show-documents').addEventListener('click', function() {
    fetch('/get_documents/'+symptomId)
    .then(response => response.json())
    .then(data => {
        const docList = document.getElementById('doc-list');
        docList.innerHTML = ''; // Limpiar lista anterior
        data.documents.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'doc-item';
            docItem.textContent = doc.file_path;
            docItem.onclick = () => downloadDocument(doc.file_name);
            docList.appendChild(docItem);
        });
        document.getElementById('documentsModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Función para descargar documento
function downloadDocument(filePath) {
    fetch(`/download/${filePath}`)
                .then(response => {
                    console.log("response")
                    console.log(response)
                    if (response.ok) {
                        return response.blob(); // Convertir la respuesta en un blob
                    } else {
                        throw new Error('Error al descargar el documento');
                    }
                })
                .then(blob => {
                    const url = window.URL.createObjectURL(blob); // Crear un objeto URL para el blob
                    const a = document.createElement('a'); // Crear un enlace
                    a.style.display = 'none';
                    a.href = url;
                    a.download = filePath; // Especificar el nombre del archivo para descargar
                    document.body.appendChild(a);
                    a.click(); // Hacer clic en el enlace para iniciar la descarga
                    window.URL.revokeObjectURL(url); // Liberar el objeto URL
                })
                .catch(error => {
                    console.error(error); // Manejo de errores
                    alert('No se pudo descargar el documento. Intente de nuevo.');
                });
}

// Cerrar modal
document.querySelector('.close').onclick = function() {
    document.getElementById('documentsModal').style.display = 'none';
}

// Cancelar descarga
document.getElementById('cancel-download').onclick = function() {
    document.getElementById('documentsModal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    if (event.target == document.getElementById('documentsModal')) {
        document.getElementById('documentsModal').style.display = 'none';
    }
}
