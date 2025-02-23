/* scripts/utils/contactForm.js */

// Ouvre la modal de contact
function openContactModal() {
    const contactModal = document.getElementById('contact_modal');
    contactModal.classList.add('active');
  }
  
  // Ferme la modal de contact
  function closeContactModal() {
    const contactModal = document.getElementById('contact_modal');
    contactModal.classList.remove('active');
  }
  
  // Pour conserver la compatibilité avec l'attribut onclick du bouton de contact
  function displayModal() {
    openContactModal();
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('#contact_modal form');
    const sendButton = contactForm.querySelector('.contact_button');
  
    sendButton.addEventListener('click', function(e) {
      e.preventDefault();
  
      const prenomInput = document.getElementById('prenom');
      const nomInput = document.getElementById('nom');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');
  
      console.log("Prénom :", prenomInput.value);
      console.log("Nom :", nomInput.value);
      console.log("Email :", emailInput.value);
      console.log("Message :", messageInput.value);
  
      // Ferme la modal de contact
      closeContactModal();
  
      // Réinitialisation des champs
      prenomInput.value = "";
      nomInput.value = "";
      emailInput.value = "";
      messageInput.value = "";
  
      [prenomInput, nomInput, emailInput, messageInput].forEach(input => {
        input.addEventListener('focus', function() {
          input.setSelectionRange(0, 0);
        });
      });
    });
  });
  
  // Exposer les fonctions pour l'attribut onclick
  window.displayModal = displayModal;
  window.closeContactModal = closeContactModal;
  