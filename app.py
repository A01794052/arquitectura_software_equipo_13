from flask import Flask, request, jsonify, render_template, session, redirect, url_for, send_file
import mysql.connector
import os
from database import get_db_connection
import requests
import json

app = Flask(__name__)
app.secret_key = 'your_secret_key'

app.config['UPLOAD_FOLDER'] = 'uploads/'  # Carpeta para guardar documentos

# Asegúrate de que la carpeta de carga exista
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/loginpage')
def loginpage():
    return render_template('login.html')  # Renders the login.html template

@app.route('/<page>')
def home(page):
    if page:
        username = session.get('username')  # Retrieve data from session
        if username:
            return render_template(page)
        else:
            return redirect(url_for('loginpage'))
    else:
        return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json

    headers = {
        "Authorization": "Bearer 8eb117f5-d857-4f89-8f96-76c9336a7704",
        "Accept": "application/json"
    }

    if data['curp']:
        curp = data['curp']
        url = "https://apimarket.mx/api/imss/grupo/localizar-nss?curp="+curp
        # Send the request
        response = requests.post(url, headers=headers)

        # Handle the response
        if response.status_code != 200:
            return jsonify({'success': False, 'message': 'El usuario no esta en el sistema del IMSS'})
        else:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('SELECT * FROM users WHERE curp = %s', (curp, ))
            user = cursor.fetchone()

            cursor.close()
            conn.close()

            if user:
                session['username'] = user  # Store data in session
                return jsonify({'success': True, 'message': 'Inicio de sesión exitoso!', 'usuario': user})
            else:
                return jsonify({'success': False, 'message': 'El curp si esta registrado en el IMSS, pero no en el sistema'})
            
    else:
        username = data['username']
        password = data['password']
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Verifica el usuario en la base de datos
        cursor.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            session['username'] = user  # Store data in session
            return jsonify({'success': True, 'message': 'Inicio de sesión exitoso!', 'usuario': user})
        else:
            return jsonify({'success': False, 'message': 'Nombre de usuario o contraseña incorrectos.'})
    
@app.route('/register_symptoms', methods=['POST'])
def register_symptoms():
    data = request.json
    username = data['username']
    symptoms = data['symptoms']

    conn = get_db_connection()
    cursor = conn.cursor()

    # Inserta los síntomas en la base de datos
    cursor.execute('INSERT INTO symptoms (username, symptoms, symptom_status_id) VALUES (%s, %s, %s)', (username, symptoms, 1))
    conn.commit()
    cursor.close()
    conn.close()

    # Replace this URL with the correct local URL and endpoint
    url = "http://localhost:11434/api/generate"

    headers = {
        "Content-Type": "application/json"
    }

    # Define your input data as required by Ollama
    data = {
        "model": "llama3.2",
        "prompt": "Necesito que actues como si fueras un doctor y me digas que hacer para aliviar los siguientes sintomas: "+symptoms,
        "stream": False
    }

    # Send the request
    response = requests.post(url, headers=headers, data=json.dumps(data))

    # Handle the response
    if response.status_code == 200:
        response_text = response.text
        data = json.loads(response_text)
        actual_response = data["response"]
        return jsonify({
            'success': True,
            'message': 'Síntomas registrados exitosamente! recibiras una notificacion del doctor mientras tanto checa la recomendacion del doctor IA en la parte de abajo',
            'doctoria': actual_response
        })
    else:
        print("Error:", response.status_code, response.text)
        return jsonify({
            'success': True,
            'message': 'Síntomas registrados exitosamente! recibiras una notificacion del doctor mientras tanto checa la recomendacion del doctor IA en la parte de abajo',
            'doctoria': "No Disponible"
        })

@app.route('/upload_document', methods=['POST'])
def upload_document():
    if 'document' not in request.files:
        return jsonify({'success': False, 'message': 'No se encontró el archivo.'})

    file = request.files['document']
    username = request.form['username']

    if file.filename == '':
        return jsonify({'success': False, 'message': 'No se seleccionó ningún archivo.'})

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    # Aquí puedes guardar la información en la base de datos si es necesario
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO documents (username, file_path, file_name) VALUES (%s, %s, %s)', (username, file_path, file.filename))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'success': True, 'message': 'Documento cargado exitosamente!'})

@app.route('/recommendations/<username>', methods=['GET'])
def get_recommendations(username):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    usernameVar = session.get('username')
    cursor.execute('SELECT rec.recommendation as rec, rec.id as recid, sym.symptoms as sym FROM recommendations rec INNER JOIN symptoms sym ON rec.symptom_id=sym.id INNER JOIN users ON sym.username=users.username WHERE users.username=%s', (usernameVar['username'], ))
    recommendations = cursor.fetchall()

    cursor.close()

    cursorUpdate = conn.cursor()

    cursorUpdate.execute(
        'UPDATE recommendations rec INNER JOIN symptoms sym ON rec.symptom_id=sym.id INNER JOIN users ON sym.username=users.username SET rec.checked = %s WHERE users.username=%s',
        (1, usernameVar['username'])
    )
    conn.commit()

    cursorUpdate.close()
    conn.close()

    if recommendations:
        return jsonify({'success': True, 'recommendations': recommendations})
    else:
        return jsonify({'success': False, 'message': 'No se encontraron recomendaciones para este usuario.'})
    
# Endpoint para obtener todos los documentos
@app.route('/history', methods=['GET'])
def get_history():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    usernameVar = session.get('username')
    cursor.execute("SELECT * FROM documents WHERE username=%s", (usernameVar['username'],))
    documents = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(documents)

# Endpoint para eliminar un documento por ID
@app.route('/documents/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Obtener el file_path del documento a eliminar
    cursor.execute("SELECT file_path FROM documents WHERE id = %s", (doc_id,))
    result = cursor.fetchone()

    if result:
        file_path = result[0]  # Obtener la ruta del archivo

        # Eliminar el archivo físico si existe
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Archivo {file_path} eliminado correctamente.")
        else:
            print(f"Archivo {file_path} no encontrado en el servidor.")

        # Eliminar el registro de la base de datos
        cursor.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
        conn.commit()
        response = {'message': 'Documento eliminado correctamente.'}
    else:
        response = {'error': 'Documento no encontrado.'}

    cursor.close()
    conn.close()
    return jsonify(response)

@app.route('/recent_symptoms', methods=['GET'])
def get_recent_symptoms():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Consulta de los síntomas registrados en las últimas 24 horas
    cursor.execute('SELECT * FROM symptoms WHERE symptom_status_id = %s', (1,))
    symptoms = cursor.fetchall()

    cursor.close()
    conn.close()

    if symptoms:
        return jsonify({'success': True, 'symptoms': symptoms})
    else:
        return jsonify({'success': False, 'message': 'No se encontraron síntomas recientes.'})
    
@app.route('/submit_recommendation', methods=['POST'])
def submit_recommendation():
    data = request.json
    symptom_id = data.get('symptom_id')
    recommendation = data.get('recommendation')

    if not symptom_id or not recommendation:
        return jsonify({'success': False, 'message': 'ID del síntoma y recomendación son requeridos.'})

    conn = get_db_connection()
    cursor = conn.cursor()

    # Grabar la recomendación en la base de datos
    cursor.execute('INSERT INTO recommendations (symptom_id, recommendation, checked) VALUES (%s, %s, %s)', (symptom_id, recommendation, 0))
    # Actualizar el estado del síntoma a '1' (supongo que '1' significa activo o similar)
    cursor.execute(
        'UPDATE symptoms SET symptom_status_id = %s WHERE id = %s',
        (2, symptom_id)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'success': True})

@app.route('/get_documents/<symptomid>', methods=['GET'])
def get_documents(symptomid):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Verifica el usuario en la base de datos
    cursor.execute('SELECT * FROM symptoms WHERE id = %s', (symptomid,))
    symptom = cursor.fetchone()
    cursor.execute('SELECT * FROM users WHERE username = %s', (symptom['username'],))
    user = cursor.fetchone()
    cursor.execute('SELECT * FROM documents WHERE username = %s', (user['username'],))
    documents = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({'documents': documents})

@app.route('/download/<document_name>', methods=['GET'])
def download_document(document_name):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], document_name)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)  # Enviar el archivo para descargar
    else:
        return jsonify({'success': False, 'message': 'El archivo no existe.'}), 404
    
@app.route('/check_notifications', methods=['GET'])
def check_notifications():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    username = session.get('username')
    # Verifica el usuario en la base de datos
    cursor.execute('SELECT COUNT(*) as count FROM recommendations rec INNER JOIN symptoms sym ON rec.symptom_id=sym.id INNER JOIN users ON sym.username=users.username WHERE 1=1 AND users.username=%s AND rec.checked=%s', (username['username'], 0))
    count = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({'newNotifications': count['count']})

@app.route('/show_notifications')
def show_notifications():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    username = session.get('username')
    # Verifica el usuario en la base de datos
    cursor.execute('SELECT rec.recommendation as rec, rec.id as recid, sym.symptoms as sym FROM recommendations rec INNER JOIN symptoms sym ON rec.symptom_id=sym.id INNER JOIN users ON sym.username=users.username WHERE users.username=%s AND rec.checked=%s', (username['username'], 0))
    recommendations = cursor.fetchall()
    records_with_messages = list(
        map(lambda record: {
            'message': f"Para los sintomas: {record['sym']} /n Tiene que: {record['rec']}",
            'recid': record['recid']
        }, recommendations)
    )

    cursor.close()

    cursorUpdate = conn.cursor()

    cursorUpdate.execute(
        'UPDATE recommendations rec INNER JOIN symptoms sym ON rec.symptom_id=sym.id INNER JOIN users ON sym.username=users.username SET rec.checked = %s WHERE users.username=%s',
        (1, username['username'])
    )
    conn.commit()

    cursorUpdate.close()
    conn.close()

    response = {
        "newNotifications": len(records_with_messages),
        "notifications": records_with_messages
    }
    return jsonify(response)

@app.route('/logout')
def logout():
    session.pop('username', None)  # Elimina el usuario de la sesión
    return redirect(url_for('loginpage'))  # Redirige a la página de login

if __name__ == '__main__':
    app.run(debug=True)
