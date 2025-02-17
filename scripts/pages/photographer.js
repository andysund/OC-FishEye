// Variable globale qui contiendra les médias du photographe
let photographerMedia = [];

/* -----------------------
   1. Fonctions de base
-------------------------*/

// Récupère l'ID du photographe depuis l'URL
function getPhotographerIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Récupère la liste des photographes depuis le JSON
async function getPhotographers() {
  try {
    const response = await fetch('assets/photographers/photographers.json');
    const data = await response.json();
    return data.photographers;
  } catch (error) {
    console.error("Erreur lors de la récupération des photographes :", error);
    return [];
  }
}

// Affiche les informations du photographe
function displayPhotographerInfo(photographer) {
  const photographerInfo = document.querySelector(".artist-info");
  const profilePicture = document.querySelector(".img-personal-page");
  
  const picture = `assets/PhotographersID/${photographer.portrait}`;
  const imgPersonalPage = document.createElement("div");
  const artistResume = document.createElement("div");
  
  imgPersonalPage.innerHTML = `<img src="${picture}" alt="${photographer.name}" class="artist-img">`;
  artistResume.classList.add("artist-resume");

  const nameDiv = document.createElement("div");
  const artistName = document.createElement("h1");
  artistName.classList.add("artist-name");
  artistName.textContent = photographer.name;
  
  const artistLocation = document.createElement("p");
  artistLocation.textContent = `${photographer.city}, ${photographer.country}`;
  artistLocation.classList.add("artist-location");
  
  const artistTagline = document.createElement("p");
  artistTagline.classList.add("artist-tagline");
  artistTagline.textContent = photographer.tagline;
  
  artistResume.appendChild(artistLocation);
  artistResume.appendChild(artistTagline);
  nameDiv.appendChild(artistName);
  photographerInfo.appendChild(nameDiv);
  photographerInfo.appendChild(artistResume);
  profilePicture.appendChild(imgPersonalPage); 

  const modalNameDiv =document.getElementById("modalNameDiv")
  modalNameDiv.innerHTML = `<h2>${photographer.name}</h2>`;
}

// Récupère les médias depuis le JSON
async function getArtistWork() {
  try {
    const response = await fetch('./assets/FishEye_Photos (1)/Sample Photos/media.json');
    const artistData = await response.json();
    console.log("Médias récupérés :", artistData);
    return artistData;
  } catch (error) {
    console.error("Erreur lors de la récupération des médias :", error);
    return {};
  }
}

/* -----------------------
   2. Affichage et tri des médias
-------------------------*/

/**
 * Cette fonction extrait les médias (photos et vidéos) pour le photographe courant,
 * complète chaque objet avec quelques propriétés (type et chemin complet),
 * et stocke le tout dans le tableau global `photographerMedia`.
 * Ensuite, elle appelle renderGallery pour afficher les médias.
 */
function displayMedia(artistData, photographerKey, photographerId) {
  // Réinitialisation de la galerie
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = "";

  // On récupère les médias spécifiques à ce photographe
  const currentMedia = artistData[photographerKey];
  if (!currentMedia) {
    console.error("Aucun média trouvé pour " + photographerKey);
    return;
  }
  
  const baseMediaPath = 'assets/FishEye_Photos (1)/Sample Photos/';
  const globalMedia = artistData.media; // tableau contenant TOUS les médias

  // On vide le tableau global pour le photographe
  photographerMedia = [];

  // --- Traiter les photos ---
  if (currentMedia.photos && Array.isArray(currentMedia.photos)) {
    currentMedia.photos.forEach(photoPath => {
      const fileName = photoPath.split(/[\\/]/).pop();
      // Recherche l'objet média correspondant dans le tableau global
      const mediaInfo = globalMedia.find(item => item.image === fileName);
      if (mediaInfo) {
        // On ajoute des propriétés utiles pour le rendu
        mediaInfo.type = "photo";
        mediaInfo.path = baseMediaPath + photoPath.replace(/\\/g, '/');
        photographerMedia.push(mediaInfo);
      }
    });
  }
  
  // --- Traiter les vidéos ---
  if (currentMedia.videos && Array.isArray(currentMedia.videos)) {
    currentMedia.videos.forEach(videoPath => {
      const fileName = videoPath.split(/[\\/]/).pop();
      const mediaInfo = globalMedia.find(item => item.video === fileName);
      if (mediaInfo) {
        mediaInfo.type = "video";
        mediaInfo.path = baseMediaPath + videoPath.replace(/\\/g, '/');
        photographerMedia.push(mediaInfo);
      }
    });
  }
  
  // Tri par défaut (ici par popularité décroissante)
  photographerMedia.sort((a, b) => b.likes - a.likes);
  
  // Affichage de la galerie avec les médias triés
  renderGallery(photographerMedia);
}

/**
 * Cette fonction reçoit un tableau de médias et affiche chacun dans la galerie.
 * Pour chaque média, on crée une div contenant la zone de présentation (likes et titre)
 * et l’élément média (img ou video).
 */
function renderGallery(mediaArray) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = "";
  
  mediaArray.forEach(mediaInfo => {
    const mediaItemDiv = document.createElement("div");
    mediaItemDiv.classList.add("media-item");
    
    let mediaElement;
    if (mediaInfo.type === "photo") {
      mediaElement = document.createElement("img");
      mediaElement.src = mediaInfo.path;
      mediaElement.alt = mediaInfo.title + " photo";
    } else if (mediaInfo.type === "video") {
      mediaElement = document.createElement("video");
      mediaElement.src = mediaInfo.path;
      mediaElement.controls = true;
      mediaElement.alt = mediaInfo.title + " video";
    }
    
    // Ajout des informations au média (data-attributes, titre, etc.)
    mediaElement.title = mediaInfo.title;
    mediaElement.dataset.mediaId = mediaInfo.id;
    mediaElement.dataset.photographerId = mediaInfo.photographerId;
    mediaElement.dataset.likes = mediaInfo.likes;
    mediaElement.dataset.date = mediaInfo.date;
    mediaElement.dataset.price = mediaInfo.price;
    
    // Zone de présentation (likes et titre)
    const presentation = document.createElement("div");
    presentation.classList.add("presentation");
    
    const likesElement = document.createElement("p");
    likesElement.classList.add("likes");
    likesElement.textContent = mediaInfo.likes + " ❤";
    // Incrémentation des likes au clic
    likesElement.addEventListener("click", () => {
      mediaInfo.likes++;
      likesElement.textContent = mediaInfo.likes + " ❤";
    });
    
    const titleElement = document.createElement("p");
    titleElement.textContent = mediaInfo.title;
    
    presentation.appendChild(likesElement);
    presentation.appendChild(titleElement);
    
    mediaItemDiv.appendChild(presentation);
    mediaItemDiv.appendChild(mediaElement);
    gallery.appendChild(mediaItemDiv);
  });
}

/* -----------------------
   3. Initialisation
-------------------------*/

(async function init() {
  // Récupération de l'ID dans l'URL
  const photographerId = getPhotographerIdFromURL();
  if (!photographerId) {
    console.error("Aucun ID trouvé dans l'URL.");
    return;
  }
  
  // Récupération et identification du photographe courant
  const photographers = await getPhotographers();
  const photographer = photographers.find(p => p.id == photographerId);
  if (!photographer) {
    console.error("Photographe non trouvé !");
    return;
  }
  
  // Affichage des informations du photographe
  displayPhotographerInfo(photographer);
  
  // Récupération des médias
  const artistData = await getArtistWork();
  
  // Pour accéder aux médias dans le JSON, on utilise ici le prénom (par exemple "Mimi")
  const photographerKey = photographer.name.split(" ")[0];
  
  // Extraction et affichage des médias
  displayMedia(artistData, photographerKey, photographerId);
})();

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.querySelector('#contact_modal form');
  const sendButton = contactForm.querySelector('.contact_button');

  sendButton.addEventListener('click', function(e) {
    e.preventDefault();

    // Sélection directe grâce aux id
    const prenomInput = document.getElementById('prenom');
    const nomInput = document.getElementById('nom');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');

    console.log("Prénom :", prenomInput.value);
    console.log("Nom :", nomInput.value);
    console.log("Email :", emailInput.value);
    console.log("Message :", messageInput.value);

    // Ferme la modal via votre fonction existante
    closeModal();

    // Réinitialisation des champs pour la prochaine ouverture
    prenomInput.value = "";
    nomInput.value = "";
    emailInput.value = "";
    messageInput.value = "";

    // Si nécessaire, pour remettre le curseur au début lors du focus
    [prenomInput, nomInput, emailInput, messageInput].forEach(input => {
      input.addEventListener('focus', function() {
        input.setSelectionRange(0, 0);
      });
    });
  });
});


/* -----------------------
   4. Gestion du dropdown et du tri
-------------------------*/

document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.querySelector(".dropdown");
  const button = document.querySelector(".dropdown-btn");

  // Au clic sur le bouton, on affiche/masque le menu
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdown.classList.toggle("active");
  });

  // Clic en dehors du dropdown pour le fermer
  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("active");
    }
  });

  // Ajout des écouteurs sur chaque option du menu
  const dropdownLinks = document.querySelectorAll(".dropdown-menu li");
  dropdownLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sortValue = link.dataset.value;
      console.log("Tri par :", sortValue);
      console.log("contenu link :", link.dataset.textContent);
      let sortedMedia = [];
      
      if (sortValue === "popularity") {
        // Tri par nombre de likes décroissant
        sortedMedia = photographerMedia.slice().sort((a, b) => b.likes - a.likes);
      } else if (sortValue === "date") {
        // Tri par date croissante (vous pouvez inverser le sens si besoin)
        sortedMedia = photographerMedia.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortValue === "title") {
        // Tri alphabétique sur le titre
        sortedMedia = photographerMedia.slice().sort((a, b) => a.title.localeCompare(b.title));
      }
      
      // Réaffichage de la galerie avec les médias triés
      renderGallery(sortedMedia);
      
      // Mise à jour du libellé du bouton du dropdown (optionnel)
      button.innerHTML = link.textContent + ' <img src="/assets/expand_less.png" alt="Icone flèche vers le bas" class="arrow_down">';
      
      // Fermeture du menu
      dropdown.classList.remove("active");
    });
  });
});
