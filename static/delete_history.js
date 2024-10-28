document.addEventListener("DOMContentLoaded", () => {
    loadDocuments();

    // Función para cargar documentos en la tabla
    function loadDocuments() {
        fetch('/history')
            .then(response => response.json())
            .then(data => {
                const tableBody = document.querySelector("#documentsTable tbody");
                tableBody.innerHTML = "";  // Limpiar tabla antes de agregar

                data.forEach(doc => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${doc.id}</td>
                        <td>${doc.file_name}</td>
                        <td>${new Date(doc.created_at).toLocaleDateString()}</td>
                        <td><button onclick="deleteDocument(${doc.id})">Eliminar</button></td>
                    `;

                    tableBody.appendChild(row);
                });
            })
            .catch(error => console.error('Error al cargar documentos:', error));
    }

    // Función para eliminar un documento
    window.deleteDocument = function(docId) {
        fetch(`/documents/${docId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            loadDocuments();  // Recargar la lista de documentos
        })
        .catch(error => console.error('Error al eliminar documento:', error));
    }
});
