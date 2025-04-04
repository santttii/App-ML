// Replace with your Mercado Libre app credentials
const CLIENT_ID = 'tu_cliente_id'; // Sustituye con tu CLIENT_ID
const CLIENT_SECRET = 'tu_cliente_secreto'; // Sustituye con tu CLIENT_SECRET
const REDIRECT_URI = 'https://santttii.github.io/App-ML/'; // Cambia con la URL de GitHub Pages

// El flujo de autorización
function iniciarAutorizacion() {
    const clientId = 'TU_CLIENT_ID';
    const redirectUri = 'https://tudominio.com/callback';
    const authUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = authUrl;
}

function obtenerCodigoAutorizacion() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

const authCode = obtenerCodigoAutorizacion();
if (authCode) {
    // Llamar a la función para intercambiar el código por un token de acceso
    obtenerTokenDeAcceso(authCode);
}

// En tu servidor (por ejemplo, utilizando Node.js con Express)
app.post('/obtener-token', async (req, res) => {
    const authCode = req.body.authCode;
    const clientId = 'TU_CLIENT_ID';
    const clientSecret = 'TU_CLIENT_SECRET';
    const redirectUri = 'https://tudominio.com/callback';

    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: authCode,
            redirect_uri: redirectUri,
        }),
    });

    const data = await response.json();
    res.json(data);
});

async function obtenerTokenDeAcceso(authCode) {
    const response = await fetch('/obtener-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authCode }),
    });

    const data = await response.json();
    // Almacenar el token de acceso de forma segura
    localStorage.setItem('access_token', data.access_token);
}

async function renovarTokenDeAcceso(refreshToken) {
    const clientId = 'TU_CLIENT_ID';
    const clientSecret = 'TU_CLIENT_SECRET';

    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
        }),
    });

    const data = await response.json();
    // Actualizar el token de acceso almacenado
    localStorage.setItem('access_token', data.access_token);
}
