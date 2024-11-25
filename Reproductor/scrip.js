const API_KEY = "AIzaSyBLF0_M-uFZDS-BzC1smUZY_vwkBFqIfZ8"; 
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("btnSearch");
const videoList = document.getElementById("ListaVideos");
const videoPlayer = document.getElementById("videoPlayer");
const addToPlaylistButton = document.getElementById("addToPlaylist");
const playlistList = document.getElementById("ListaPlaylist");

let currentVideo = null;
let playlist = JSON.parse(localStorage.getItem("playlist")) || [];
// Cargar playlist al inicio
loadPlaylist();
// Buscar videos
searchButton.addEventListener("click", () => {
    const query = searchInput.value;
    if (query) searchVideos(query);
});

function searchVideos(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&maxResults=10&key=${API_KEY}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.items && data.items.length > 0) {
                displayVideos(data.items);
            } else {
                alert("No se encontraron videos para la búsqueda.");
                videoList.innerHTML = ""; // Limpia la lista si no hay resultados
            }
        })
        .catch(error => console.error("Error al buscar videos:", error));
}

function displayVideos(videos) {
    videoList.innerHTML = "";
    videos.forEach(video => {
        const videoItem = document.createElement("li");
        videoItem.innerHTML = `
            <img src="${video.snippet.thumbnails.medium.url}" data-video-id="${video.id.videoId}">
            <h3>${video.snippet.title}</h3>
        `;
        videoList.appendChild(videoItem);

        videoItem.querySelector("img").addEventListener("click", () => {
            playVideo(video.id.videoId);
        });
    });
}

function playVideo(videoId) {
    currentVideo = videoId;
    // Reemplaza el contenido del iframe con el video seleccionado
    videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`; // autoplay inicia el video automáticamente
    videoPlayer.style.display = "block"; // Asegúrate de que el reproductor esté visible
}

// Agregar video a playlist
addToPlaylistButton.addEventListener("click", () => {
    if (currentVideo) {
        const videoTitle = document.querySelector(`#ListaVideos img[data-video-id="${currentVideo}"]`).nextElementSibling.textContent;
        playlist.push({ id: currentVideo, title: videoTitle });
        localStorage.setItem("playlist", JSON.stringify(playlist));
        loadPlaylist();
    }
});

// Cargar playlist
function loadPlaylist() {
    playlistList.innerHTML = "";
    playlist.forEach((video, index) => {
        const playlistItem = document.createElement("li");
        playlistItem.innerHTML = `
            <img src="https://img.youtube.com/vi/${video.id}/default.jpg">
            <h3>${video.title}</h3>
            <button data-index="${index}">Eliminar</button>
        `;
        playlistList.appendChild(playlistItem);

        playlistItem.querySelector("button").addEventListener("click", (e) => {
            const idx = e.target.getAttribute("data-index");
            playlist.splice(idx, 1);
            localStorage.setItem("playlist", JSON.stringify(playlist));
            loadPlaylist();
        });

        playlistItem.querySelector("img").addEventListener("click", () => {
            playVideo(video.id);
        });
    });
}
