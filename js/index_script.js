const branchLocations = {
  // Fijas
  centro: { 
    lat: -34.6037, 
    lng: -58.3816, 
    name: "Sucursal Centro", 
    address: "Av. Corrientes 123, CABA",
    mobile: false 
  },
  oeste: { 
    lat: -34.6330, 
    lng: -58.4830, 
    name: "Sucursal Oeste", 
    address: "Av. Rivadavia 7000, Flores",
    mobile: false 
  },
  palermo: { 
    lat: -34.5800, 
    lng: -58.4200, 
    name: "Sucursal Palermo", 
    address: "Av. Santa Fe 3253, Palermo",
    mobile: false 
  },
  belgrano: { 
    lat: -34.5600, 
    lng: -58.4500, 
    name: "Sucursal Belgrano", 
    address: "Av. Cabildo 1800, Belgrano",
    mobile: false 
  },
  // Móviles
  norte: { 
    lat: -34.5458, 
    lng: -58.4671, 
    name: "Sucursal Norte", 
    address: "Zona Norte, Buenos Aires",
    mobile: true 
  },
  sur: { 
    lat: -34.6355, 
    lng: -58.4156, 
    name: "Sucursal Sur", 
    address: "Zona Sur, Buenos Aires", 
    mobile: true 
  },
  movil1: { 
    lat: -34.5900, 
    lng: -58.4000, 
    name: "Sucursal Móvil 1", 
    address: "Zona Almagro/Caballito", 
    mobile: true 
  },
  movil2: { 
    lat: -34.6700, 
    lng: -58.3700, 
    name: "Sucursal Móvil 2", 
    address: "Zona Avellaneda", 
    mobile: true 
  },
  movil3: { 
    lat: -34.5000, 
    lng: -58.5000, 
    name: "Sucursal Móvil 3", 
    address: "Zona Vicente López", 
    mobile: true 
  }
};

let map;
let markers = {}; 

function initMap() {
  const mapContainer = document.getElementById('map');
  
  mapContainer.innerHTML = `
    <div class="map-loading">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Cargando mapa...</span>
      </div>
      <p>Cargando mapa interactivo...</p>
    </div>
  `;

  const loadMap = setTimeout(() => {
    try {
      if (typeof L === 'undefined') {
        throw new Error('Leaflet no se cargó correctamente');
      }
      map = L.map('map').setView([-34.6037, -58.3816], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);
      addBranchMarkers();
    } catch (error) {
      console.error('Error cargando el mapa:', error);
      showFallbackMap();
    }
  }, 100);

  setTimeout(() => {
    if (!map) {
      clearTimeout(loadMap);
      showFallbackMap();
    }
  }, 5000);
}

function addBranchMarkers() {
  Object.keys(branchLocations).forEach(branchKey => {
    const branch = branchLocations[branchKey];
    
    const iconHtml = branch.mobile ? 
      '<div style="background-color: #dc3545; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white;"><i class="fas fa-truck"></i></div>' :
      '<div style="background-color: #198754; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white;"><i class="fas fa-store"></i></div>';

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker([branch.lat, branch.lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div class="text-center">
          <h6>${branch.name}</h6>
          <p class="mb-1">${branch.address}</p>
          <small class="text-muted">${branch.mobile ? 'Sucursal Móvil' : 'Sucursal Fija'}</small>
        </div>
      `);

    markers[branchKey] = marker;
    updateBranchCard(branchKey, branch);
  });
}

function updateBranchCard(branchKey, branch) {
  const card = document.getElementById(`card-${branchKey}`);
  const addressElement = document.getElementById(`${branchKey}-address`);
  
  if (addressElement) {
    if (branch.mobile) {
      addressElement.textContent = `Posición actual: ${branch.address} (Lat: ${branch.lat.toFixed(4)}, Lng: ${branch.lng.toFixed(4)})`;
    } else {
      addressElement.textContent = `${branch.address} (Lat: ${branch.lat.toFixed(4)}, Lng: ${branch.lng.toFixed(4)})`;
    }
  }
}

function showFallbackMap() {
  const mapContainer = document.getElementById('map');
  mapContainer.innerHTML = `
    <a href="https://www.google.com/maps/search/sucursales/@-34.6037,-58.3816,11z" target="_blank" class="fallback-map">
      <i class="fas fa-map-marked-alt fa-3x mb-3"></i>
      <h4>Ver nuestras sucursales en Google Maps</h4>
      <p class="mb-0">Haz clic para abrir el mapa</p>
      <div class="mt-3">
        <p><strong>Sucursal Centro:</strong> Av. Corrientes 123, CABA</p>
        <p><strong>Sucursal Norte:</strong> Zona Norte, Buenos Aires (Móvil)</p>
        <p><strong>Sucursal Sur:</strong> Zona Sur, Buenos Aires (Móvil)</p>
      </div>
    </a>
  `;
}

// FUNCIÓN: Para normalizar texto (quitar tildes y minúsculas)
function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize("NFD") // Descompone caracteres (ej: 'ó' -> 'o' + '´')
    .replace(/[\u0300-\u036f]/g, ""); // Quita los acentos
}

// FUNCIÓN DE FILTRO
function applyFilters() {
  // Usa normalizeString en la consulta de búsqueda
  const nameQuery = normalizeString(document.getElementById('filterName').value);
  const typeQuery = document.getElementById('filterType').value;
  const noResultsMsg = document.getElementById('noResults');
  let matchCount = 0;

  Object.keys(branchLocations).forEach(branchKey => {
    const branch = branchLocations[branchKey];
    const card = document.getElementById(`card-${branchKey}`);
    const marker = markers[branchKey]; 

    if (!card || !marker) return; 

    // Usa normalizeString en el nombre de la sucursal para comparar
    const normalizedBranchName = normalizeString(branch.name);
    const nameMatch = normalizedBranchName.includes(nameQuery);
    
    let typeMatch = false;
    if (typeQuery === 'todos') {
      typeMatch = true;
    } else if (typeQuery === 'fijo' && !branch.mobile) {
      typeMatch = true;
    } else if (typeQuery === 'movil' && branch.mobile) {
      typeMatch = true;
    }

    if (nameMatch && typeMatch) {
      card.classList.add('active');
      if (marker.getElement()) {
        marker.getElement().classList.add('active');
      }
      matchCount++;
    } else {
      card.classList.remove('active');
      if (marker.getElement()) {
        marker.getElement().classList.remove('active');
        }
    }
  });

  if (matchCount === 0 && (nameQuery.length > 0 || typeQuery !== 'todos')) {
    noResultsMsg.style.display = 'block';
  } else {
    noResultsMsg.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initMap();
  
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      if (!loginForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      loginForm.classList.add('was-validated');
    });
  }
  
  const filterName = document.getElementById('filterName');
  const filterType = document.getElementById('filterType');
  const clearFilters = document.getElementById('clearFilters');

  if(filterName) {
    filterName.addEventListener('input', applyFilters);
  }
  if(filterType) {
    filterType.addEventListener('change', applyFilters);
  }
  if(clearFilters) {
    clearFilters.addEventListener('click', function() {
      document.getElementById('filterForm').reset(); 
      applyFilters(); 
    });
  }
});

document.addEventListener('visibilitychange', function() {
  if (!document.hidden && !map) {
    initMap();
  }
});