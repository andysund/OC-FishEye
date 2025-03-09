/* scripts/pages/photographer.js */

// Variable globale qui contiendra les médias du photographe
let photographerMedia = [];
let currentMediaIndex = 0;
let currentPhotographer = null;

/* -----------------------
   Modal Lightbox Functions
-------------------------*/

// Ouvre la modal lightbox et affiche le média passé en paramètre
function openLightBoxModal(mediaInfo) {
  currentMediaIndex = photographerMedia.findIndex(media => media.id === mediaInfo.id);
  const lightBoxModal = document.getElementById('modalLightBox');
  const modalContent = document.getElementById('modal-content');

  // Affiche la modal lightbox
  lightBoxModal.classList.add('active');

  // Mise à jour dynamique du contenu de la modal
  modalContent.innerHTML = `
    <div class="fullLightBoxModal">
      <div class="arrow__links__left">
        <button onclick="PrevSlide()">
          <img src="../../assets/VectorLeft.png" alt="Précédent" class="arrowLeft" />
        </button>
      </div>
      <div class="mediaTitle">
        <div class="modal-media">
          ${
            mediaInfo.type === 'photo'
              ? `<img src="${mediaInfo.path}" alt="${mediaInfo.title}" class="lightBoxModal">`
              : `<video class="lightBoxModal" src="${mediaInfo.path}" controls></video>`
          }
        </div>
        <div class="modal-infos">
          <h2>${mediaInfo.title}</h2>
        </div>
      </div>
      <div class="crossAndArrowRight">
        <div class="closeModalLightBox" onclick="closeLightBoxModal()">
          <button id="mediaModalCloseButton" onclick="closeLightBoxModal()">
            <img src="../../assets/close-24px 1.png" alt="Fermer" class="arrowClose" />
          </button>
        </div>
        <div class="centered__arrow__right">
          <div class="arrow__links__right">
            <button onclick="NextSlide()">
              <img src="../../assets/VectorRight.png" alt="Suivant" class="arrowRight" />
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attache l'écouteur pour fermer la modal lightbox
  const closeModalButton = document.getElementById('mediaModalCloseButton');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeLightBoxModal);
  }
}

// Ferme la modal lightbox
function closeLightBoxModal() {
  const lightBoxModal = document.getElementById('modalLightBox');
  console.log('Fermeture de la modal lightbox');
  lightBoxModal.classList.remove('active');
}

/* -----------------------
   Navigation des Slides
-------------------------*/

function PrevSlide() {
  if (photographerMedia.length === 0) return;
  currentMediaIndex = (currentMediaIndex - 1 + photographerMedia.length) % photographerMedia.length;
  openLightBoxModal(photographerMedia[currentMediaIndex]);
}

function NextSlide() {
  if (photographerMedia.length === 0) return;
  currentMediaIndex = (currentMediaIndex + 1) % photographerMedia.length;
  openLightBoxModal(photographerMedia[currentMediaIndex]);
}

/* -----------------------
   Fonctions Photographe & Médias
-------------------------*/

function getPhotographerIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

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

  const modalNameDiv = document.getElementById("modalNameDiv");
  modalNameDiv.innerHTML = `<h2>${photographer.name}</h2>`;
}

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

function displayMedia(artistData, photographerKey, photographerId) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = "";

  const currentMedia = artistData[photographerKey];
  if (!currentMedia) {
    console.error("Aucun média trouvé pour " + photographerKey);
    return;
  }
  
  const baseMediaPath = 'assets/FishEye_Photos (1)/Sample Photos/';
  const globalMedia = artistData.media;
  photographerMedia = [];

  // Traitement des photos
  if (currentMedia.photos && Array.isArray(currentMedia.photos)) {
    currentMedia.photos.forEach(photoPath => {
      const fileName = photoPath.split(/[\\/]/).pop();
      const mediaInfo = globalMedia.find(item => item.image === fileName);
      if (mediaInfo) {
        mediaInfo.type = "photo";
        mediaInfo.path = baseMediaPath + photoPath.replace(/\\/g, '/');
        photographerMedia.push(mediaInfo);
      }
    });
  }
  
  // Traitement des vidéos
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
  
  // Tri par défaut par popularité
  photographerMedia.sort((a, b) => b.likes - a.likes);
  renderGallery(photographerMedia);
    // Tri et affichage de la galerie
    photographerMedia.sort((a, b) => b.likes - a.likes);
    renderGallery(photographerMedia);
    
    // Mise à jour du compteur en bas à droite
    updateBottomCounter(currentPhotographer, photographerMedia);
  
}

function updateBottomCounter(photographer, mediaArray) {
  // Calcul du total des likes
  const totalLikes = mediaArray.reduce((acc, media) => acc + media.likes, 0);
  const HeartIcon = '<div class="heart-number-icone"><img src="../../assets/favorite-24px 1.png" alt="Coeur" class="heart-icon"></div>';

  // Affichage du total avec l'icône
  document.getElementById('like-counter').innerHTML = totalLikes + ' ' + HeartIcon;
 
  // Affichage du prix/jour du photographe
  document.getElementById('price-counter').textContent = photographer.price + ' €/jour';
}


function renderGallery(mediaArray) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = "";
  
  mediaArray.forEach(mediaInfo => {
    const mediaItemDiv = document.createElement("div");
    mediaItemDiv.classList.add("media-item");
    
    // Ajoute l'événement pour ouvrir la lightbox
    mediaItemDiv.addEventListener('click', () => {
      openLightBoxModal(mediaInfo);
    });
    
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
    likesElement.addEventListener("click", (e) => {
      e.stopPropagation();
      mediaInfo.likes++;
      likesElement.textContent = mediaInfo.likes + " ❤";
      updateBottomCounter(currentPhotographer, photographerMedia);
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

(async function init() {
  const photographerId = getPhotographerIdFromURL();
  if (!photographerId) {
    console.error("Aucun ID trouvé dans l'URL.");
    return;
  }
  
  const photographers = await getPhotographers();
  const photographer = photographers.find(p => p.id == photographerId);
  if (!photographer) {
    console.error("Photographe non trouvé !");
    return;
  }
  currentPhotographer = photographer;
  
  displayPhotographerInfo(photographer);
  
  const artistData = await getArtistWork();
  const photographerKey = photographer.name.split(" ")[0];
  displayMedia(artistData, photographerKey, photographerId);
})();

document.addEventListener("DOMContentLoaded", function () {
  const dropdown = document.querySelector(".dropdown");
  const button = document.querySelector(".dropdown-btn");

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdown.classList.toggle("active");
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("active");
    }
  });

  const dropdownLinks = document.querySelectorAll(".dropdown-menu li");
  dropdownLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sortValue = link.dataset.value;
      let sortedMedia = [];
      
      if (sortValue === "popularity") {
        sortedMedia = photographerMedia.slice().sort((a, b) => b.likes - a.likes);
      } else if (sortValue === "date") {
        sortedMedia = photographerMedia.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sortValue === "title") {
        sortedMedia = photographerMedia.slice().sort((a, b) => a.title.localeCompare(b.title));
      }
      
      renderGallery(sortedMedia);
      button.innerHTML = link.textContent + ' <img src="/assets/expand_less.png" alt="Icone flèche vers le bas" class="arrow_down">';
      dropdown.classList.remove("active");
    });
  });
});

// Exposer les fonctions pour qu'elles soient accessibles par les attributs onclick
window.openLightBoxModal = openLightBoxModal;
window.closeLightBoxModal = closeLightBoxModal;
window.PrevSlide = PrevSlide;
window.NextSlide = NextSlide;
