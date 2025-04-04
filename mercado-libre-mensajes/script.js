// Replace with your Mercado Libre app credentials
const CLIENT_ID = 'tu_cliente_id'; // Sustituye con tu CLIENT_ID
const CLIENT_SECRET = 'tu_cliente_secreto'; // Sustituye con tu CLIENT_SECRET
const REDIRECT_URI = 'https://tu-url-github-pages.github.io/callback'; // Cambia con la URL de GitHub Pages

// El flujo de autorización
document.getElementById('authButton').addEventListener('click', () => {
    // Paso 1: Redirigir al usuario a la página de autorización de Mercado Libre
    const authUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read%20write%20offline_access`;
    window.location.href = authUrl;
});

// Función que se ejecutará cuando Mercado Libre redirija a la URL del callback con el código
function getAccessToken(code) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);

    fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(data => {
        const accessToken = data.access_token;
        console.log("Access Token:", accessToken);
        sendMessage(accessToken);
    })
    .catch(error => console.error('Error obteniendo el token:', error));
}

// Función para enviar el mensaje
function sendMessage(accessToken) {
    fetch('https://api.mercadolibre.com/messages', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_id: 'ID_DEL_PEDIDO', // Aquí debes poner el ID del pedido real
            text: 'Hola, gracias por tu compra. Tu pedido estará llegando pronto!'
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('mensaje').style.display = 'block';
        document.getElementById('resultadoMensaje').innerText = '¡Mensaje enviado correctamente!';
    })
    .catch(error => {
        document.getElementById('mensaje').style.display = 'block';
        document.getElementById('resultadoMensaje').innerText = 'Hubo un error al enviar el mensaje.';
    });
}

// Detectar el código de autorización de Mercado Libre
if (window.location.search.includes('code=')) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        getAccessToken(code);
    }
}
