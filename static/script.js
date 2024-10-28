function onSubmit(event) {
    event.preventDefault(); // Evita el envío normal del formulario
    
    container1 = document.getElementById('container1');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const curp = document.getElementById('curp').value;
    let body = {};
    if(container1.getAttribute("style") == "display: block;")
        body = JSON.stringify({ username, password, curp: "" })
    else
        body = JSON.stringify({ curp })

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.usuario.tipo_de_usuario_id == 1) {
                window.location.href = '/register_symptoms.html'; // Redirigir a la página del tablero
            }
            else {
                window.location.href = '/recent_symptoms.html';
            }
        } else {
            container1 = document.getElementById('container1');
            if(container1.getAttribute("style") == "display: block;")
                document.getElementById('error-message1').textContent = data.message;
            else
                document.getElementById('error-message2').textContent = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('error-message').textContent = 'Error en la conexión al servidor.';
    });
}

Array.from(document.getElementsByClassName('login-form')).forEach(element => {
    element.addEventListener('submit', onSubmit);
});

function muestraCurp(event) {
    document.getElementById("container1").setAttribute("style", "display: none;")
    document.getElementById("container2").setAttribute("style", "display: block;")
}

function muestraUsername(event) {
    document.getElementById("container1").setAttribute("style", "display: block;")
    document.getElementById("container2").setAttribute("style", "display: none;")
}
