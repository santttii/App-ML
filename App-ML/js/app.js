// app.js - Main application logic

// Initialize the application
function initApp() {
    // Set up navigation
    setupNavigation();
    
    // Load initial dashboard data
    if (isAuthenticated()) {
        loadDashboardData();
    }
}

// Set up navigation between sections
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target section
            const targetId = link.getAttribute('data-section');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Hide all sections and show the target one
            sections.forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(targetId).classList.remove('hidden');
            
            // Load data for the section if needed
            loadSectionData(targetId);
        });
    });
}

// Load data based on the active section
function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'dashboard-home':
            loadDashboardData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'messages':
            loadMessagesData();
            break;
        case 'shipping':
            // Set date input to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('shipping-date').value = today;
            loadShippingData(today);
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// Helper function to make API calls to MercadoLibre
async function callMercadoLibreAPI(endpoint, method = 'GET', data = null) {
    const token = getAccessToken();
    if (!token) {
        throw new Error('User not authenticated');
    }
    
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        // In a real app, this would be a real API call
        // For now, we'll simulate responses based on the endpoint
        
        // This is a placeholder for demonstration purposes
        // In a real app, you would make actual API calls to MercadoLibre
        return simulateAPIResponse(endpoint, method, data);
    } catch (error) {
        console.error(`API call error (${endpoint}):`, error);
        throw error;
    }
}

// Simulate API responses for demonstration
function simulateAPIResponse(endpoint, method, data) {
    // This function simulates responses from MercadoLibre API
    // In a real app, this would be replaced with actual API calls
    
    if (endpoint.includes('/orders')) {
        return {
            results: [
                {
                    id: 'ORDER-001',
                    date_created: '2023-04-01T14:30:00.000Z',
                    status: 'paid',
                    buyer: { nickname: 'Comprador_Test1' },
                    total_amount: 2500,
                    shipping: { status: 'ready_to_ship' }
                },
                {
                    id: 'ORDER-002',
                    date_created: '2023-04-02T10:15:00.000Z',
                    status: 'pending',
                    buyer: { nickname: 'Comprador_Test2' },
                    total_amount: 1800,
                    shipping: { status: 'pending' }
                },
                {
                    id: 'ORDER-003',
                    date_created: '2023-04-03T16:45:00.000Z',
                    status: 'shipped',
                    buyer: { nickname: 'Comprador_Test3' },
                    total_amount: 3200,
                    shipping: { status: 'shipped' }
                }
            ],
            paging: {
                total: 3,
                offset: 0,
                limit: 50
            }
        };
    } else if (endpoint.includes('/messages')) {
        return {
            results: [
                {
                    id: 'MSG-001',
                    date_created: '2023-04-03T09:20:00.000Z',
                    from: { user_id: 'USER123', nickname: 'Comprador_Test1' },
                    subject: 'Consulta sobre producto',
                    message: '¿Este producto incluye la garantía del fabricante?',
                    status: 'unread',
                    order_id: 'ORDER-001'
                },
                {
                    id: 'MSG-002',
                    date_created: '2023-04-02T16:40:00.000Z',
                    from: { user_id: 'USER456', nickname: 'Comprador_Test2' },
                    subject: 'Problema con el envío',
                    message: 'El seguimiento muestra que el paquete está detenido. ¿Sabes qué ocurre?',
                    status: 'read',
                    order_id: 'ORDER-002'
                }
            ],
            paging: {
                total: 2,
                offset: 0,
                limit: 50
            }
        };
    } else if (endpoint.includes('/shipments')) {
        return {
            results: [
                {
                    id: 'SHIP-001',
                    order_id: 'ORDER-001',
                    status: 'ready_to_ship',
                    tracking_number: 'TRACK123456',
                    service_id: 'normal',
                    receiver: {
                        name: 'Cliente Test 1',
                        address: 'Calle Falsa 123, Ciudad'
                    }
                },
                {
                    id: 'SHIP-002',
                    order_id: 'ORDER-003',
                    status: 'shipped',
                    tracking_number: 'TRACK789'
                }
            ]}}}