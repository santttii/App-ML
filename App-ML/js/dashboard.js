// dashboard.js - Handles the main dashboard functionality

// Load dashboard data from MercadoLibre API
async function loadDashboardData() {
    if (!isAuthenticated()) {
        return;
    }
    
    try {
        // Show loading state
        document.getElementById('monthly-sales').textContent = 'Cargando...';
        document.getElementById('pending-orders').textContent = 'Cargando...';
        document.getElementById('unread-messages').textContent = 'Cargando...';
        document.getElementById('daily-shipments').textContent = 'Cargando...';
        
        // Get stats from different endpoints
        const ordersData = await callMercadoLibreAPI('/orders');
        const messagesData = await callMercadoLibreAPI('/messages');
        const shipmentsData = await callMercadoLibreAPI('/shipments');
        
        // Calculate monthly sales
        const monthlySales = ordersData.results.reduce((total, order) => {
            // Only count paid and completed orders
            if (order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered') {
                return total + order.total_amount;
            }
            return total;
        }, 0);
        
        // Count pending orders
        const pendingOrders = ordersData.results.filter(order => 
            order.status === 'pending' || 
            (order.status === 'paid' && order.shipping.status === 'ready_to_ship')
        ).length;
        
        // Count unread messages
        const unreadMessages = messagesData.results.filter(msg => 
            msg.status === 'unread'
        ).length;
        
        // Count today's shipments
        const today = new Date().toISOString().split('T')[0];
        const dailyShipments = shipmentsData.results.filter(shipment => 
            shipment.status === 'ready_to_ship' || 
            (shipment.status === 'shipped' && shipment.date_created && shipment.date_created.startsWith(today))
        ).length;
        
        // Update the dashboard stats
        document.getElementById('monthly-sales').textContent = `$${monthlySales.toLocaleString()}`;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('unread-messages').textContent = unreadMessages;
        document.getElementById('daily-shipments').textContent = dailyShipments;
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Show error state
        document.getElementById('monthly-sales').textContent = 'Error al cargar';
        document.getElementById('pending-orders').textContent = 'Error al cargar';
        document.getElementById('unread-messages').textContent = 'Error al cargar';
        document.getElementById('daily-shipments').textContent = 'Error al cargar';
    }
}

// Load settings data from localStorage
function loadSettingsData() {
    try {
        // Load saved settings or use defaults
        const settings = JSON.parse(localStorage.getItem('ml_settings')) || {};
        
        // Set auto message values
        const autoMsgShipping = document.getElementById('auto-msg-shipping');
        autoMsgShipping.value = settings.autoMsgShipping || 
            '¡Hola! Tu pedido ha sido enviado. El número de seguimiento es: {{tracking_number}}. ¡Gracias por tu compra!';
        
        // Set printer settings
        const labelPrinter = document.getElementById('label-printer');
        if (settings.labelPrinter) {
            labelPrinter.value = settings.labelPrinter;
        }
        
        // Set up save buttons
        const saveButtons = document.querySelectorAll('.save-setting');
        saveButtons.forEach(button => {
            button.addEventListener('click', saveSettings);
        });
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings to localStorage
function saveSettings(event) {
    try {
        // Get current settings
        const settings = JSON.parse(localStorage.getItem('ml_settings')) || {};
        
        // Get the parent setting group
        const settingItem = event.target.closest('.setting-item');
        const inputs = settingItem.querySelectorAll('input, select, textarea');
        
        // Update settings based on the inputs in this group
        inputs.forEach(input => {
            if (input.id === 'auto-msg-shipping') {
                settings.autoMsgShipping = input.value;
            } else if (input.id === 'label-printer') {
                settings.labelPrinter = input.value;
            }
            // Add more settings as needed
        });
        
        // Save updated settings
        localStorage.setItem('ml_settings', JSON.stringify(settings));
        
        // Show confirmation
        const originalText = event.target.textContent;
        event.target.textContent = '¡Guardado!';
        
        // Reset button text after 2 seconds
        setTimeout(() => {
            event.target.textContent = originalText;
        }, 2000);
        
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error al guardar la configuración');
    }
}

// Initialize dashboard components
document.addEventListener('DOMContentLoaded', function() {
    // This will run after the main app.js initializes
    
    // Add any additional dashboard-specific initialization here
    
    // Set up settings buttons if on settings page
    const settingsSection = document.getElementById('settings');
    if (settingsSection && !settingsSection.classList.contains('hidden')) {
        loadSettingsData();
    }
});