// orders.js - Handles the orders section functionality

// Load orders data from MercadoLibre API
async function loadOrdersData() {
    if (!isAuthenticated()) {
        return;
    }
    
    try {
        // Get orders list container
        const ordersListContainer = document.getElementById('orders-list');
        ordersListContainer.innerHTML = '<p>Cargando pedidos...</p>';
        
        // Get filter values
        const statusFilter = document.getElementById('order-status-filter').value;
        const searchTerm = document.getElementById('order-search').value.toLowerCase();
        
        // Get orders data
        const ordersData = await callMercadoLibreAPI('/orders');
        
        // Filter orders based on selected filters
        let filteredOrders = ordersData.results;
        
        if (statusFilter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
        
        if (searchTerm) {
            filteredOrders = filteredOrders.filter(order => 
                order.id.toLowerCase().includes(searchTerm) || 
                order.buyer.nickname.toLowerCase().includes(searchTerm)
            );
        }
        
        // Clear container
        ordersListContainer.innerHTML = '';
        
        // Show message if no orders found
        if (filteredOrders.length === 0) {
            ordersListContainer.innerHTML = '<p class="empty-message">No se encontraron pedidos con los filtros seleccionados.</p>';
            return;
        }
        
        // Display orders
        filteredOrders.forEach(order => {
            // Format date
            const orderDate = new Date(order.date_created);
            const formattedDate = orderDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create order card
            const orderCard = document.createElement('div');
            orderCard.className = 'item-card';
            orderCard.innerHTML = `
                <div class="item-details">
                    <h3>${order.id}</h3>
                    <p>Comprador: ${order.buyer.nickname}</p>
                    <p>Fecha: ${formattedDate}</p>
                    <p>Total: $${order.total_amount.toLocaleString()}</p>
                    <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                </div>
                <div class="item-actions">
                    <button class="secondary-btn order-detail-btn" data-order-id="${order.id}">Ver Detalles</button>
                    ${getActionButton(order)}
                </div>
            `;
            
            ordersListContainer.appendChild(orderCard);
        });
        
        // Add event listeners for buttons
        setupOrderButtonListeners();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('orders-list').innerHTML = '<p>Error al cargar los pedidos. Intenta nuevamente más tarde.</p>';
    }
}

// Get the appropriate action button based on order status
function getActionButton(order) {
    switch (order.status) {
        case 'pending':
            return `<button class="primary-btn order-remind-btn" data-order-id="${order.id}">Recordar Pago</button>`;
        case 'paid':
            if (order.shipping.status === 'ready_to_ship') {
                return `<button class="primary-btn order-ship-btn" data-order-id="${order.id}">Preparar Envío</button>`;
            }
            return `<button class="secondary-btn" disabled>En Proceso</button>`;
        case 'shipped':
            return `<button class="secondary-btn order-track-btn" data-order-id="${order.id}">Ver Seguimiento</button>`;
        case 'delivered':
            return `<button class="secondary-btn order-feedback-btn" data-order-id="${order.id}">Solicitar Valoración</button>`;
        case 'cancelled':
            return `<button class="secondary-btn order-relist-btn" data-order-id="${order.id}">Volver a Publicar</button>`;
        default:
            return '';
    }
}

// Get human-readable status text
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'paid': 'Pagado',
        'shipped': 'Enviado',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
    };
    
    return statusMap[status] || status;
}

// Setup event listeners for order action buttons
function setupOrderButtonListeners() {
    // Detail buttons
    const detailButtons = document.querySelectorAll('.order-detail-btn');
    detailButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-order-id');
            alert(`Ver detalles del pedido ${orderId}`);
            // In a real app, you would show a modal with order details
        });
    });
    
    // Remind payment buttons
    const remindButtons = document.querySelectorAll('.order-remind-btn');
    remindButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const orderId = button.getAttribute('data-order-id');
            try {
                // In a real app, this would send a payment reminder
                await callMercadoLibreAPI(`/orders/${orderId}/reminders`, 'POST');
                alert(`Recordatorio de pago enviado para el pedido ${orderId}`);
            } catch (error) {
                console.error('Error sending payment reminder:', error);
                alert('Error al enviar el recordatorio de pago');
            }
        });
    });
    
    // Ship buttons
    const shipButtons = document.querySelectorAll('.order-ship-btn');
    shipButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-order-id');
            // In a real app, this would redirect to the shipping section
            document.querySelector('nav a[data-section="shipping"]').click();
        });
    });
    
    // Add more button handlers as needed
}

// Initialize orders filter event listeners
function initOrdersFilters() {
    const statusFilter = document.getElementById('order-status-filter');
    const searchInput = document.getElementById('order-search');
    
    // Add event listeners for filters
    statusFilter.addEventListener('change', loadOrdersData);
    
    // Search with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadOrdersData, 500);
    });
}

// Initialize when the orders section is shown
document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters
    initOrdersFilters();
});