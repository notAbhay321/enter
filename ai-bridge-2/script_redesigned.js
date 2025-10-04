document.addEventListener('DOMContentLoaded', () => {
    const newChatBtn = document.getElementById('new-chat-btn');
    const contactsContainer = document.getElementById('wa-contacts');

    newChatBtn.addEventListener('click', () => {
        const newContact = document.createElement('div');
        newContact.classList.add('wa-contact');

        newContact.innerHTML = `
            <div class="wa-contact-avatar"></div>
            <div class="wa-contact-info">
                <div class="wa-contact-name">New Chat</div>
                <div class="wa-contact-lastmsg"></div>
            </div>
        `;

        contactsContainer.prepend(newContact);
    });
});
