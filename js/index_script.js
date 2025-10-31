document.addEventListener('DOMContentLoaded', () => {

  //Datos precargados
  const centersData = [
    { id: 1, name: "Centro Fijo - Caballito", type: "fijo", lat: -34.6105, lng: -58.4412, direccion: "Av. Rivadavia 4800, Caballito" },
    { id: 2, name: "Móvil 01 - Flores", type: "móvil", lat: -34.6266, lng: -58.4633, direccion: "Av. Nazca 1200, Flores" },
    { id: 3, name: "Centro Fijo - Almagro", type: "fijo", lat: -34.6083, lng: -58.4203, direccion: "Av. Corrientes 3800, Almagro" },
    { id: 4, name: "Centro Fijo - Villa Crespo", type: "fijo", lat: -34.5987, lng: -58.4437, direccion: "Av. Scalabrini Ortiz 900, Villa Crespo" },
    { id: 5, name: "Móvil 02 - Núñez", type: "móvil", lat: -34.5499, lng: -58.4682, direccion: "Av. Cabildo 3400, Núñez" },
    { id: 6, name: "Centro Fijo - Saavedra", type: "fijo", lat: -34.5563, lng: -58.4899, direccion: "Av. Balbín 4200, Saavedra" },
    { id: 7, name: "Móvil 03 - Villa Urquiza", type: "móvil", lat: -34.5721, lng: -58.4849, direccion: "Av. Triunvirato 4700, Villa Urquiza" },
    { id: 8, name: "Móvil 04 - Mataderos", type: "móvil", lat: -34.6496, lng: -58.5034, direccion: "Av. Juan Bautista Alberdi 6600, Mataderos" },
    { id: 9, name: "Centro Fijo - Liniers", type: "fijo", lat: -34.6415, lng: -58.5202, direccion: "Av. Rivadavia 11300, Liniers" },
    { id: 10, name: "Centro Fijo - Parque Patricios", type: "fijo", lat: -34.6369, lng: -58.3934, direccion: "Av. Caseros 2600, Parque Patricios" },
    { id: 11, name: "Móvil 05 - Barracas", type: "móvil", lat: -34.6425, lng: -58.3745, direccion: "Av. Montes de Oca 700, Barracas" },
    { id: 12, name: "Centro Fijo - Colegiales", type: "fijo", lat: -34.5778, lng: -58.4485, direccion: "Av. Elcano 3600, Colegiales" },
    { id: 13, name: "Móvil 06 - Chacarita", type: "móvil", lat: -34.5870, lng: -58.4560, direccion: "Av. Federico Lacroze 2300, Chacarita" },
    { id: 14, name: "Centro Fijo - Villa del Parque", type: "fijo", lat: -34.6029, lng: -58.4839, direccion: "Av. San Martín 5900, Villa del Parque" },
    { id: 15, name: "Móvil 07 - Retiro", type: "móvil", lat: -34.5891, lng: -58.3779, direccion: "Av. del Libertador 400, Retiro" }
  ];

  //Mapa
  const map = L.map('map').setView([-34.6037, -58.3816], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const fixedIcon = L.divIcon({
    html: '<i class="fa-solid fa-building fa-2x" style="color: #0d6efd;"></i>',
    className: '',
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });

  const mobileIcon = L.divIcon({
    html: '<i class="fa-solid fa-car-side fa-2x" style="color: #198754;"></i>',
    className: '',
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });

  const listElement = document.getElementById('center-list');
  const filterSelect = document.getElementById('filter-type');
  const resetButton = document.getElementById('reset-view');
  const markers = {};
  let centroActivo = null;

  //Lista y marks
  function renderizarLista() {
    listElement.innerHTML = '';

    centersData.forEach(center => {
      const li = document.createElement('li');
      li.dataset.id = center.id;
      li.dataset.type = center.type;

      li.innerHTML = `
        <button class="list-item-button">
          <span>${center.name}</span>
          <span class="fa-solid fa-chevron-down"></span>
        </button>
        <div class="panel-desplegable">
          <p><strong>Dirección:</strong> ${center.direccion}</p>
          <p><strong>Horario:</strong> Lunes a viernes: 8:00 - 18:00, Sábados: 9:00 - 14:00</p>
          <p><strong>Teléfono:</strong> (11) 4567-89${String(center.id).padStart(2, '0')}</p>
          <p><strong>Tipo:</strong> ${center.type}</p>
        </div>
      `;

      listElement.appendChild(li);

      const icon = center.type === 'fijo' ? fixedIcon : mobileIcon;
      const marker = L.marker([center.lat, center.lng], { icon }).addTo(map);
      marker.myCustomId = center.id;
      marker.myCustomType = center.type;
      marker.bindPopup(`<b>${center.name}</b><br>${center.direccion}`);

      marker.on('click', () => expandirCentro(center.id, true));
      markers[center.id] = marker;
    });

    listElement.addEventListener('click', e => {
      const li = e.target.closest('li');
      if (li) expandirCentro(li.dataset.id, false);
    });
  }

  //una vez clickeado -> expandir
  //doble click -> cerrar
  function expandirCentro(id, desdeMapa) {
    const li = listElement.querySelector(`li[data-id="${id}"]`);
    const panel = li.querySelector('.panel-desplegable');
    const marker = markers[id];
    const esMismo = centroActivo === id;

    if (esMismo) {
      cerrarTodo();
      return;
    }

    listElement.querySelectorAll('li').forEach(item => {
      item.classList.remove('active', 'selected');
      item.querySelector('.panel-desplegable').classList.remove('open');
    });
    Object.values(markers).forEach(m => m.closePopup());

    li.classList.add('active', 'selected');
    panel.classList.add('open');
    marker.openPopup();
    resaltarMarcador(marker);

    const latLng = marker.getLatLng();
    const offsetLat = 0.005;
    map.setView(L.latLng(latLng.lat - offsetLat, latLng.lng), 15, { animate: true });

    li.scrollIntoView({ behavior: "smooth", block: "center" });
    centroActivo = id;
  }

  //close up
  function cerrarTodo() {
    listElement.querySelectorAll('li').forEach(li => {
      li.classList.remove('active', 'selected');
      li.querySelector('.panel-desplegable').classList.remove('open');
    });
    Object.values(markers).forEach(marker => {
      marker.closePopup();
      const el = marker._icon;
      if (el) el.classList.remove('active');
    });
    map.setView([-34.6037, -58.3816], 12, { animate: true });
    centroActivo = null;
  }

  //Resaltar el marcador -> icono con circulo
  function resaltarMarcador(marker) {
    Object.values(markers).forEach(m => {
      const iconEl = m._icon;
      if (iconEl) iconEl.classList.remove('active');
    });
    const el = marker._icon;
    if (el) {
      el.classList.add('active');
      el.style.opacity = "1";
      el.style.zIndex = "1500";
    }
  }

  //Filtro
  filterSelect.addEventListener('change', e => {
    const filterValue = e.target.value;
    applyFilter(filterValue);
  });

  function applyFilter(filterValue) {
    const visibleMarkers = [];

    listElement.querySelectorAll('li').forEach(li => {
      const match = !filterValue || li.dataset.type === filterValue;
      li.style.display = match ? 'block' : 'none';
    });

    Object.values(markers).forEach(marker => {
      const visible = !filterValue || marker.myCustomType === filterValue;
      marker.setOpacity(visible ? 1 : 0.3);
      if (visible) visibleMarkers.push(marker);
    });

    if (visibleMarkers.length > 0) {
      const latlngs = visibleMarkers.map(m => m.getLatLng());
      map.fitBounds(L.latLngBounds(latlngs), { animate: true, padding: [50, 50] });
    } else {
      map.setView([-34.6037, -58.3816], 12, { animate: true });
    }
  }

  //resetear
  resetButton.addEventListener('click', () => {
    filterSelect.selectedIndex = 0;
    cerrarTodo();
    Object.values(markers).forEach(marker => marker.setOpacity(1));
  });

  // RENDER INICIAL 
  renderizarLista();
});
