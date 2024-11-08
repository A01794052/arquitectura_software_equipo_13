import pika
import json
import requests
from database import get_db_connection

# Configure RabbitMQ consumer connection
rabbitmq_connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', heartbeat=600))
rabbitmq_channel = rabbitmq_connection.channel()

# Declare the queue in case it hasn't been created
rabbitmq_channel.queue_declare(queue='symptoms_queue', durable=True)

# Define the URL and headers for Ollama API
url = "http://localhost:11434/api/generate"
headers = {
    "Content-Type": "application/json"
}

def process_message(ch, method, properties, body):
    data = json.loads(body)
    request_id = data['request_id']
    symptom_id = data['symptom_id']
    symptoms = data['symptoms']
    
    # Prepare the prompt data
    prompt_data = {
        "model": "llama3.2",
        "prompt": "Necesito que actues como si fueras un doctor y me digas que hacer para aliviar los siguientes sintomas: " + symptoms,
        "stream": False
    }

    # Call the Ollama API
    response = requests.post(url, headers=headers, data=json.dumps(prompt_data))
    
    # Handle Ollama API response
    if response.status_code == 200:
        actual_response = json.loads(response.text)["response"]
    else:
        actual_response = "No Disponible"

    conn = get_db_connection()
    cursor = conn.cursor()

    # Grabar la recomendación en la base de datos
    cursor.execute('INSERT INTO recommendations (symptom_id, recommendation, checked, tipo_de_recomendacion_id) VALUES (%s, %s, %s, %s)', (symptom_id, actual_response, 0, 1))

    conn.commit()

    cursor.close()
    conn.close()

    # Acknowledge message after processing
    ch.basic_ack(delivery_tag=method.delivery_tag)

# Set up consumer to listen to the queue
rabbitmq_channel.basic_consume(queue='symptoms_queue', on_message_callback=process_message)

print("Waiting for messages. To exit press CTRL+C")
rabbitmq_channel.start_consuming()
