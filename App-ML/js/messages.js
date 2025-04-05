// messages.js - Handles the messages section functionality

// Global variables for messages
let currentMessages = [];
let selectedMessageId = null;

// Load messages data from MercadoLibre API
async function loadMessagesData() {
    if (!isAuthenticated()) {
        return;
    }
    
    try {
        // Get messages list container
        const messagesListContainer = document.getElementById('messages-list');
        messagesListContainer.innerHTML = '<p>Cargando mensajes...</p>';
        
        // Get search term if any
        const searchTerm = document.getElementById('message-search').value.toLowerCase();
        
        // Get messages data
        const messagesData = await callMercadoLibreAPI('/messages');
        
        // Store messages in global variable
        currentMessages = messagesData.results;
        
        // Filter messages if search term exists
        let filteredMessages = currentMessages;
        if (searchTerm) {
            filteredMessages = currentMessages.filter(msg => 
                msg.from.nickname.toLowerCase().includes(searchTerm) || 
                msg.subject.toLowerCase().includes(searchTerm) || 
                msg.message.toLowerCase().includes(searchTerm)
            );
        }
        
        // Clear container
        messagesListContainer.innerHTML = '';
        
        // Show message if no messages found
        if (filteredMessages.length === 0) {
            messagesListContainer.innerHTML = '<p class="empty-message">No se encontraron mensajes.</p>';
            return;
        }
        
        // Sort messages by date (newest first)
        filteredMessages.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
        
        // Display messages
        filteredMessages.forEach(msg => {
            // Format date
            const msgDate = new Date(msg.date_created);
            const formattedDate = msgDate.toLocaleDateString('es-ES', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create message preview (limited to ~50 chars)
            const messagePreview = msg.message.length > 50 
                ? msg.message.substring(0, 50) + '...' 
                : msg.message;
            
            // Create message item
            const messageItem = document.createElement('div');
            messageItem.className = `message-item ${msg.status === 'unread' ? 'unread' : ''}`;
            messageItem.setAttribute('data-message-id', msg.id);
            messageItem.innerHTML = `
                <div class="message-from">${msg.from.nickname}</div>
                <div class="message-subject">${msg.subject}</div>
                <div class="message-preview">${messagePreview}</div>
                <div class="message-date">${formattedDate}</div>
            `;
            
            // Add click event to show message details
            messageItem.addEventListener('click', () => displayMessageDetails(msg.id));
            
            messagesListContainer.appendChild(messageItem);
        });
        
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById('messages-list').innerHTML = '<p>Error al cargar los mensajes. Intenta nuevamente más tarde.</p>';
    }
}

// Display message details when clicked
function displayMessageDetails(messageId) {
    // Find the message in the current messages array
    const message = currentMessages.find(msg => msg.id === messageId);
    if (!message) return;
    
    // Set the selected message ID
    selectedMessageId = messageId;
    
    // Show the message detail section
    const messageDetailSection = document.getElementById('message-detail');
    messageDetailSection.classList.remove('hidden');
    
    // Update message details
    document.getElementById('message-title').textContent = message.subject;
    
    // Format date
    const msgDate = new Date(message.date_created);
    const formattedDate = msgDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('message-date').textContent = formattedDate;
    
    // Update message content
    document.getElementById('message-content').innerHTML = `
        <p><strong>De:</strong> ${message.from.nickname}</p>
        <p><strong>Pedido:</strong> ${message.order_id || 'N/A'}</p>
        <div class="message-body">
            ${message.message.replace(/\n/g, '<br>')}
        </div>
    `;
    
    // Clear reply textarea
    document.getElementById('reply-text').value = '';
    
    // Mark the message as read if it was unread
    if (message.status === 'unread') {
        markMessageAsRead(messageId);
    }
    
    // Highlight the selected message
    const messageItems = document.querySelectorAll('.message-item');
    messageItems.forEach(item => {
        if (item.getAttribute('data-message-id') === messageId) {
            item.classList.add('selected');
            item.classList.remove('unread');
        } else {
            item.classList.remove('selected');
        }
    });
}

// Mark a message as read
async function markMessageAsRead(messageId) {
    try {
        // In a real app, this would make an API call to mark the message as read
        await callMercadoLibreAPI(`/messages/${messageId}/read`, 'PUT');
        
        // Update the message status in the current messages array
        const messageIndex = currentMessages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
            currentMessages[messageIndex].status = 'read';
        }
        
        // Update unread messages count in dashboard if visible
        const unreadMessagesElement = document.getElementById('unread-messages');
        if (unreadMessagesElement && unreadMessagesElement.textContent !== 'Cargando...') {
            const currentCount = parseInt(unreadMessagesElement.textContent);
            if (!isNaN(currentCount) && currentCount > 0) {
                unreadMessagesElement.textContent = (currentCount - 1).toString();
            }
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

// Send a reply to a message
async function sendMessageReply() {
    if (!selectedMessageId) {
        alert('No hay un mensaje seleccionado para responder');
        return;
    }
    
    const replyText = document.getElementById('reply-text').value.trim();
    if (!replyText) {
        alert('Por favor escribe un mensaje para enviar');
        return;
    }
    
    try {
        // Find the original message
        const originalMessage = currentMessages.find(msg => msg.id === selectedMessageId);
        
        // In a real app, this would make an API call to send the reply
        const replyData = {
            message_id: selectedMessageId,
            text: replyText,
            to: originalMessage.from.user_id
        };
        
        await callMercadoLibreAPI(`/messages/${selectedMessageId}/reply`, 'POST', replyData);
        
        // Clear the reply text
        document.getElementById('reply-text').value = '';
        
        // Show success message
        alert('Respuesta enviada exitosamente');
        
        // Refresh messages list
        loadMessagesData();
    } catch (error) {
        console.error('Error sending reply:', error);
        alert('Error al enviar la respuesta. Por favor intenta nuevamente.');
    }
}

// Initialize message search functionality
function initMessageSearch() {
    const searchInput = document.getElementById('message-search');
    
    // Search with debounce
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadMessagesData, 500);
    });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search
    initMessageSearch();
    
    // Set up reply button
    const replyButton = document.getElementById('send-reply');
    if (replyButton) {
        replyButton.addEventListener('click', sendMessageReply);
    }
});