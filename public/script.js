document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const messageInput = document.getElementById('messageInput');
    const messages = document.getElementById('messages');
    const userList = document.getElementById('userList');
    const onlineCount = document.getElementById('onlineCount');

    // Recupera o nome do usuário do localStorage ou usa 'Anônimo'
    const username = localStorage.getItem('discord-username') || 'Anônimo';
    
    // Notifica o servidor sobre o login
    socket.emit('user login', username);

    // Atualiza a lista de usuários online
    socket.on('user list', (users) => {
        onlineCount.textContent = users.length;
        userList.innerHTML = users.map(user => 
            `<div class="user ${user === username ? 'you' : ''}">
                ${user === username ? 'Você' : user}
            </div>`
        ).join('');
    });

    // Envia mensagem ao pressionar Enter
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && messageInput.value.trim()) {
            const message = messageInput.value.trim();
            socket.emit('chat message', message);
            messageInput.value = '';
        }
    });

    // Recebe mensagens do servidor
    socket.on('chat message', (data) => {
        const isCurrentUser = data.user === username;
        const messageElement = document.createElement('div');
        
        messageElement.className = `message ${isCurrentUser ? 'own-message' : ''}`;
        messageElement.innerHTML = `
            <span class="message-user">${isCurrentUser ? 'Você' : data.user}</span>
            <span class="message-time">${data.time}</span>
            <div class="message-text">${data.text}</div>
        `;
        
        messages.appendChild(messageElement);
        messages.scrollTop = messages.scrollHeight;
    });

    // Foca no input ao carregar
    messageInput.focus();
});
