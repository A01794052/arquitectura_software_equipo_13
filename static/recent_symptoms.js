document.getElementById('load-symptoms').addEventListener('click', function() {
    fetch('/recent_symptoms', {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        const symptomsList = document.getElementById('symptoms-list');
        symptomsList.innerHTML = ''; // Limpia los síntomas previos
        if (data.success) {
            data.symptoms.forEach(symptom => {
                const symptomDiv = document.createElement('div');
                symptomDiv.className = 'symptom';
                symptomDiv.innerHTML = `Usuario: ${symptom.username} | Síntoma: ${symptom.symptoms} | Registrado en: ${symptom.created_at} <a href='symptom_recommendation.html?id=${symptom.id}'>Hacer recomendacion</a>`;
                symptomsList.appendChild(symptomDiv);
            });
        } else {
            symptomsList.innerHTML = `<p>No se encontraron síntomas recientes.</p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('symptoms-list').innerHTML = '<p>Error al conectar con el servidor.</p>';
    });
});
