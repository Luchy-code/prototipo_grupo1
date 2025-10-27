document.addEventListener('DOMContentLoaded', () => {

  // --- 1. DATOS ORIGINALES ---
  const centersData = [
    { id: 1, name: "Centro Fijo - Caballito", type: "fijo", lat: -34.6105, lng: -58.4412 },
    { id: 2, name: "Móvil 01 - Flores", type: "móvil", lat: -34.6266, lng: -58.4633 },
    { id: 3, name: "Centro Fijo - Almagro", type: "fijo", lat: -34.6083, lng: -58.4203 },
    { id: 4, name: "Centro Fijo - Villa Crespo", type: "fijo", lat: -34.5987, lng: -58.4437 },
    { id: 5, name: "Móvil 02 - Nuñez", type: "móvil", lat: -34.5499, lng: -58.4682 },
    { id: 6, name: "Centro Fijo - Saavedra", type: "fijo", lat: -34.5563, lng: -58.4899 },
    { id: 7, name: "Móvil 03 - Villa Urquiza", type: "móvil", lat: -34.5721, lng: -58.4849 },
    { id: 8, name: "Móvil 04 - Mataderos", type: "móvil", lat: -34.6496, lng: -58.5034 },
    { id: 9, name: "Centro Fijo - Liniers", type: "fijo", lat: -34.6415, lng: -58.5202 },
    { id: 10, name: "Centro Fijo - Parque Patricios", type: "fijo", lat: -34.6369, lng: -58.3934 },
    { id: 11, name: "Móvil 05 - Barracas", type: "móvil", lat: -34.6425, lng: -58.3745 },
    { id: 12, name: "Centro Fijo - Colegiales", type: "fijo", lat: -34.5778, lng: -58.4485 },
    { id: 13, name: "Móvil 06 - Chacarita", type: "móvil", lat: -34.5870, lng: -58.4560 },
    { id: 14, name: "Centro Fijo - Villa del Parque", type: "fijo", lat: -34.6029, lng: -58.4839 },
    { id: 15, name: "Móvil 07 - Retiro", type: "móvil", lat: -34.5891, lng: -58.3779 }
  ];

  // --- 1b. TRANSFORMACIÓN DEL ARREGLO (CON NUEVOS HORARIOS) ---
  // Usamos .map() para crear un nuevo arreglo basado en el original
  const centersDataActualizado = centersData.map(center => {
    
    // (Este es tu código de horarios, lo respeto tal cual lo pasaste)
    const horario = center.type === 'fijo' 
      ? 'Lunes a viernes: 8:00 - 18:00, Sábados: 9:00 - 14:00' 
      : 'Lunes a viernes: 8:00 - 18:00, Sábados: 9:00 - 14:00';

    // Devolvemos un nuevo objeto con las propiedades originales
    // y las nuevas (direccion y horario)
    return {
      ...center, // Copia todas las propiedades existentes (id, name, type, lat, lng)
      direccion: 'Dirección pendiente', // Agregamos la dirección (con marcador de posición)
      horario: horario // Agregamos el horario calculado
    };
  });


  // --- 2. INICIALIZACIÓN DEL MAPA ---
  const map = L.map('map').setView([-34.6037, -58.3816], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // --- 2b. DEFINICIÓN DE ICONOS (¡CAMBIO AÑADIDO!) ---
  const fixedIcon = L.divIcon({
    html: '<i class="fa-solid fa-building fa-2x" style="color: #0d6efd;"></i>', // Icono Edificio (azul)
    className: '', // Clase vacía para evitar estilos por defecto de Leaflet
    iconSize: [30, 42], // Tamaño del área del icono
    iconAnchor: [15, 42] // Punto del icono que corresponde a la coordenada (abajo al centro)
  });

  const mobileIcon = L.divIcon({
    html: '<i class="fa-solid fa-car-side fa-2x" style="color: #198754;"></i>', // Icono Auto (verde)
    className: '',
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });


  // --- 3. VARIABLES GLOBALES ---
  const listElement = document.getElementById('center-list');
  const filterSelect = document.getElementById('filter-type');
  const resetButton = document.getElementById('reset-view'); 

  const allMarkersGroup = L.featureGroup().addTo(map);
  const selectedMarkerGroup = L.featureGroup().addTo(map);

  const markers = {};
  const listItems = {};

  // --- 4. POBLAR LISTA Y MAPA ---
  centersDataActualizado.forEach(center => {

    const li = document.createElement('li');
    li.textContent = center.name;
    li.dataset.id = center.id;
    li.dataset.type = center.type;
    listElement.appendChild(li);
    listItems[center.id] = li;

    // --- ¡CAMBIO APLICADO AQUÍ! ---
    // 1. Decidimos qué icono usar
    const iconToUse = center.type === 'fijo' ? fixedIcon : mobileIcon;
    
    // 2. Pasamos el icono al crear el marcador
    const marker = L.marker([center.lat, center.lng], { icon: iconToUse }); 
    // --- FIN DEL CAMBIO ---

    marker.myCustomId = center.id;
    marker.myCustomType = center.type;
    
    marker.bindPopup(
      `<b>${center.name}</b><br>` +
      `Dirección: ${center.direccion}<br>` +
      `Horario: ${center.horario}<br>` +
      `Tipo: ${center.type}`
    );

    allMarkersGroup.addLayer(marker);
    markers[center.id] = marker;

    marker.on('click', (e) => {
      selectCenter(e.target.myCustomId);
    });
  });

  if (centersDataActualizado.length > 0) {
    map.fitBounds(allMarkersGroup.getBounds());
  }

  // --- 5. EVENT LISTENERS ---

  listElement.addEventListener('click', (e) => {
    if (e.target && e.target.nodeName === 'LI') {
      const id = e.target.dataset.id;
      selectCenter(id);
    }
  });

  filterSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      applyFilter(e.target.value);
    }
  });

  resetButton.addEventListener('click', resetView);

  // --- 6. FUNCIONES PRINCIPALES ---

  function selectCenter(id) {
    Object.values(listItems).forEach(item => {
      if (item.dataset.id == id) {
        item.classList.remove('hidden');
        item.classList.add('selected');
      } else {
        item.classList.add('hidden');
        item.classList.remove('selected');
      }
    });

    if (map.hasLayer(allMarkersGroup)) {
      map.removeLayer(allMarkersGroup);
    }
    selectedMarkerGroup.clearLayers();

    const marker = markers[id];
    if (marker) {
      selectedMarkerGroup.addLayer(marker);
      map.setView(marker.getLatLng(), 15);
      marker.openPopup();
    }

    filterSelect.selectedIndex = 0;
  }

  function applyFilter(filterValue) {
    let visibleBounds = [];

    selectedMarkerGroup.clearLayers();
    allMarkersGroup.clearLayers();

    Object.values(listItems).forEach(item => {
      if (item.dataset.type === filterValue) {
        item.classList.remove('hidden');
        item.classList.remove('selected');
      } else {
        item.classList.add('hidden');
        item.classList.remove('selected');
      }
    });

    Object.values(markers).forEach(marker => {
      if (marker.myCustomType === filterValue) {
        allMarkersGroup.addLayer(marker);
        visibleBounds.push(marker.getLatLng());
      }
    });

    if (!map.hasLayer(allMarkersGroup)) {
      map.addLayer(allMarkersGroup);
    }

    if (visibleBounds.length > 0) {
      map.fitBounds(L.latLngBounds(visibleBounds));
    } else {
      map.setView([-34.6037, -58.3816], 12);
    }
  }

  function resetView() {
    Object.values(listItems).forEach(item => {
      item.classList.remove('hidden');
      item.classList.remove('selected');
    });

    selectedMarkerGroup.clearLayers();
    allMarkersGroup.clearLayers();

    Object.values(markers).forEach(marker => {
      allMarkersGroup.addLayer(marker);
    });

    if (!map.hasLayer(allMarkersGroup)) {
      map.addLayer(allMarkersGroup);
    }

    map.fitBounds(allMarkersGroup.getBounds());

    filterSelect.selectedIndex = 0; 
  }

});
