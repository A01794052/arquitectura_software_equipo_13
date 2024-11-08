class NotificationBell extends HTMLElement {
    constructor() {
        super();

        // Crear un Shadow DOM para el componente
        this.attachShadow({ mode: 'open' });

        // Estructura del HTML para el componente
        this.shadowRoot.innerHTML = `
            <style>
                /* Estilos de la campanita */
                #notification-bell {
                    position: relative;
                    cursor: pointer;
                    font-size: 24px;
                }
                
                /* Estilos del contador de notificaciones */
                #notification-count {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background-color: red;
                    color: white;
                    border-radius: 50%;
                    padding: 2px 6px;
                    font-size: 12px;
                    display: none; /* Oculto por defecto */
                }
            </style>
            
            <div id="notification-bell">
                🔔
                <span id="notification-count"></span>
            </div>
        `;
    }

    connectedCallback() {
        this.checkNotifications();
        this.interval = setInterval(() => this.checkNotifications(), 5000);

        // Manejar el evento de clic para traer todas las notificaciones
        this.shadowRoot.getElementById('notification-bell').addEventListener('click', () => window.location.href = '/check_recommendations.html');
    }

    disconnectedCallback() {
        clearInterval(this.interval);
    }

    async checkNotifications() {
        try {
            const response = await fetch('/check_notifications');
            const data = await response.json();
            const notificationCount = this.shadowRoot.getElementById('notification-count');
            if (data.newNotifications > 0) {
                notificationCount.textContent = data.newNotifications;
                notificationCount.style.display = 'inline';
            } else {
                notificationCount.style.display = 'none';
            }
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
        }
    }

    async fetchAllNotifications() {
        try {
            const response = await fetch('/show_notifications');
            const notifications = await response.json();
            
            // Aquí puedes manejar las notificaciones, por ejemplo, abrir un modal o lista
            console.log('Notificaciones:', notifications);
            this.showNotificationsModal(notifications['notifications']);
        } catch (error) {
            console.error('Error al obtener todas las notificaciones:', error);
        }
    }

    showNotificationsModal(notifications) {
        // Crear un modal para mostrar las notificaciones
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.background = 'white';
        modal.style.padding = '20px';
        modal.style.border = '1px solid #ccc';
        modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        modal.style.zIndex = '1000';

        modal.innerHTML = `
            <h3>Notificaciones</h3>
            <ul>
                ${notifications.map(notification => `<li>${notification.message}</li>`).join('')}
            </ul>
            <button id="close-modal">Cerrar</button>
        `;

        // Agregar el modal al Shadow DOM
        this.shadowRoot.appendChild(modal);

        // Cerrar el modal
        this.shadowRoot.getElementById('close-modal').addEventListener('click', () => {
            this.shadowRoot.removeChild(modal);
        });
    }
}

// Registrar el componente como <notification-bell>
customElements.define('notification-bell', NotificationBell);
