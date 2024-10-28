class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                /* Estilos para el header */
                #header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #4CAF50;
                    padding: 10px 20px;
                    color: white;
                    font-family: Arial, sans-serif;
                    width: 100%;
                    position: fixed;
                    top: 0;
                    left: 0;
                    box-sizing: border-box;
                    z-index: 1000;
                }
                
                #header h1 {
                    margin: 0;
                    font-size: 20px;
                }

                #nav-links {
                    display: flex;
                    gap: 15px;
                }

                #nav-links a {
                    color: white;
                    text-decoration: none;
                    font-weight: bold;
                    cursor: pointer;
                }

                #nav-links a:hover {
                    text-decoration: underline;
                }
                
                /* Añadir margen superior al contenido del cuerpo para evitar solapamiento con el header fijo */
                :host-context(body) {
                    margin-top: 60px;
                }
            </style>

            <div id="header">
                <h1>Sistema de Diagnóstico en Línea</h1>
                <div id="nav-links">
                    <a id="logout">Cerrar Sesión</a>
                </div>
            </div>
        `;
    }

    connectedCallback() {
        this.shadowRoot.getElementById('logout').addEventListener('click', () => this.navigateTo('/logout'));
    }

    navigateTo(path) {
        window.location.href = path;
    }
}

customElements.define('header-component-doctor', HeaderComponent);
