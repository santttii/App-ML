// shipping.js - Handles the shipping section functionality

// Load shipping data from MercadoLibre API
async function loadShippingData(date) {
    if (!isAuthenticated()) {
        return;
    }
    
    try {
        // Get shipping list container
        const shippingListContainer = document.getElementById('shipping-list');
        shippingListContainer.innerHTML = '<p>Cargando envíos...</p>';
        
        // Get shipments and related orders data
        const shipmentsData = await callMercadoLibreAPI('/shipments');
        const ordersData = await callMercadoLibreAPI('/orders');
        
        // Filter shipments by date
        const selectedDate = date || document.getElementById('shipping-date').value;
        
        let filteredShipments = shipmentsData.results;
        if (selectedDate) {
            filteredShipments = filteredShipments.filter(shipment => {
                // Find the related order
                const relatedOrder = ordersData.results.find(order => order.id === shipment.order_id);
                
                // If we have an order and it has a date, filter by it
                if (relatedOrder && relatedOrder.date_created) {
                    return relatedOrder.date_created.startsWith(selectedDate);
                }
                
                return false;
            });
        }
        
        // Clear container
        shippingListContainer.innerHTML = '';
        
        // Show message if no shipments found
        if (filteredShipments.length === 0) {
            shippingListContainer.innerHTML = '<p class="empty-message">No hay envíos programados para esta fecha.</p>';
            return;
        }
        
        // Display shipments
        filteredShipments.forEach(shipment => {
            // Find related order data
            const relatedOrder = ordersData.results.find(order => order.id === shipment.order_id);
            
            // Create shipment card
            const shipmentCard = document.createElement('div');
            shipmentCard.className = 'item-card';
            shipmentCard.innerHTML = `
                <div class="item-details">
                    <h3>Envío #${shipment.id}</h3>
                    <p>Pedido: ${shipment.order_id}</p>
                    <p>Destinatario: ${shipment.receiver.name}</p>
                    <p>Dirección: ${shipment.receiver.address}</p>
                    <p>Número de seguimiento: ${shipment.tracking_number || 'Pendiente'}</p>
                    <span class="status-badge status-${getShippingStatusClass(shipment.status)}">${getShippingStatusText(shipment.status)}</span>
                </div>
                <div class="item-actions">
                    <button class="secondary-btn print-label-btn" data-shipment-id="${shipment.id}">Imprimir Etiqueta</button>
                    ${shipment.status === 'ready_to_ship' ? 
                        `<button class="primary-btn mark-shipped-btn" data-shipment-id="${shipment.id}">Marcar como Enviado</button>` : 
                        ''}
                </div>
            `;
            
            shippingListContainer.appendChild(shipmentCard);
        });
        
        // Add event listeners for shipping buttons
        setupShippingButtonListeners();
        
    } catch (error) {
        console.error('Error loading shipments:', error);
        document.getElementById('shipping-list').innerHTML = '<p>Error al cargar los envíos. Intenta nuevamente más tarde.</p>';
    }
}

// Get the CSS class for a shipping status
function getShippingStatusClass(status) {
    const statusMap = {
        'pending': 'pending',
        'ready_to_ship': 'paid',
        'shipped': 'shipped',
        'delivered': 'delivered',
        'cancelled': 'cancelled'
    };
    
    return statusMap[status] || 'pending';
}

// Get human-readable shipping status text
function getShippingStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'ready_to_ship': 'Listo para Enviar',
        'shipped': 'En Tránsito',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
    };
    
    return statusMap[status] || status;
}

// Set up event listeners for shipping action buttons
function setupShippingButtonListeners() {
    // Print label buttons
    const printButtons = document.querySelectorAll('.print-label-btn');
    printButtons.forEach(button => {
        button.addEventListener('click', () => {
            const shipmentId = button.getAttribute('data-shipment-id');
            printShippingLabel(shipmentId);
        });
    });
    
    // Mark as shipped buttons
    const markShippedButtons = document.querySelectorAll('.mark-shipped-btn');
    markShippedButtons.forEach(button => {
        button.addEventListener('click', () => {
            const shipmentId = button.getAttribute('data-shipment-id');
            markAsShipped(shipmentId);
        });
    });
    
    // Print all labels button
    const printAllButton = document.getElementById('print-all-labels');
    if (printAllButton) {
        printAllButton.addEventListener('click', printAllLabels);
    }
}

// Print a single shipping label
async function printShippingLabel(shipmentId) {
    try {
        // In a real app, this would fetch and print the label
        // For this example, we'll just show an alert
        
        // Get printer settings
        const settings = JSON.parse(localStorage.getItem('ml_settings')) || {};
        const printerType = settings.labelPrinter || 'default';
        
        alert(`Imprimiendo etiqueta para el envío ${shipmentId} usando ${printerType === 'default' ? 'la impresora predeterminada' : 'PDF'}`);
        
        // In a real app, we would make an API call to get the label URL and open it in a new window or iframe
        console.log(`Printing label for shipment ${shipmentId} using ${printerType}`);
    } catch (error) {
        console.error('Error printing label:', error);
        alert('Error al imprimir la etiqueta. Intenta nuevamente más tarde.');
    }
}

// Print all labels for the selected date
function printAllLabels() {
    const printButtons = document.querySelectorAll('.print-label-btn');
    if (printButtons.length === 0) {
        alert('No hay etiquetas para imprimir en la fecha seleccionada');
        return;
    }
    
    // Confirm with the user
    if (confirm(`¿Estás seguro de que deseas imprimir todas las etiquetas (${printButtons.length} en total)?`)) {
        // For each shipment, print its label
        printButtons.forEach(button => {
            const shipmentId = button.getAttribute('data-shipment-id');
            printShippingLabel(shipmentId);
        });
    }
}

// Mark a shipment as shipped
async function markAsShipped(shipmentId) {
    try {
        // In a real app, this would make an API call to update the status
        await callMercadoLibreAPI(`/shipments/${shipmentId}/shipped`, 'PUT');
        
        // Send automated message if configured
        sendShippedNotification(shipmentId);
        
        // Refresh the shipping list
        const selectedDate = document.getElementById('shipping-date').value;
        loadShippingData(selectedDate);
        
        // Also update dashboard stats if visible
        const dailyShipmentsElement = document.getElementById('daily-shipments');
        if (dailyShipmentsElement && dailyShipmentsElement.textContent !== 'Cargando...') {
            const currentCount = parseInt(dailyShipmentsElement.textContent);
            if (!isNaN(currentCount)) {
                dailyShipmentsElement.textContent = (currentCount - 1).toString();
            }
        }
        
        alert(`El envío ${shipmentId} ha sido marcado como enviado`);
    } catch (error) {
        console.error('Error marking as shipped:', error);
        alert('Error al actualizar el estado del envío. Intenta nuevamente más tarde.');
    }
}

// Send automated notification to buyer when item is shipped
async function sendShippedNotification(shipmentId) {
    try {
        // Get settings for auto messages
        const settings = JSON.parse(localStorage.getItem('ml_settings')) || {};
        if (!settings.autoMsgShipping) return;
        
        // Get shipment data
        const shipmentsData = await callMercadoLibreAPI('/shipments');
        const shipment = shipmentsData.results.find(s => s.id === shipmentId);
        if (!shipment) return;
        
        // Replace placeholders in the message template
        let messageText = settings.autoMsgShipping;
        messageText = messageText.replace('{{tracking_number}}', shipment.tracking_number || 'No disponible');
        
        // In a real app, this would send a message to the buyer
        // For this example, we'll just show a log
        console.log(`Sending shipping notification for order ${shipment.order_id}: ${messageText}`);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up date selector and load button
    const dateInput = document.getElementById('shipping-date');
    const loadButton = document.getElementById('load-shipping');
    
    if (dateInput && loadButton) {
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        
        // Add event listener for load button
        loadButton.addEventListener('click', () => {
            const selectedDate = dateInput.value;
            loadShippingData(selectedDate);
        });
    }
});