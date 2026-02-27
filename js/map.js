;(function () {
  if (!window.maplibregl) return

  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [-3.1883, 55.9533],
    zoom: 11,
    interactive: true,
    attributionControl: false,
    logoPosition: 'bottom-left',
  })

  const m = document.createElement('div')
  m.innerHTML = `
    <div style="position:relative;width:0;height:0">
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(137,180,250,0.2);transform:translate(-50%,-50%);animation:ping 1.8s cubic-bezier(0,0,.2,1) infinite"></div>
      <div style="position:absolute;width:12px;height:12px;border-radius:50%;background:#89b4fa;border:2px solid #b4befe;transform:translate(-50%,-50%);box-shadow:0 0 10px rgba(137,180,250,0.65)"></div>
    </div>
    <style>@keyframes ping{75%,100%{transform:translate(-50%,-50%) scale(2.2);opacity:0}}</style>
  `
  new maplibregl.Marker({ element: m })
    .setLngLat([-3.1883, 55.9533])
    .setPopup(new maplibregl.Popup({ offset: 18, closeButton: false })
      .setHTML(`<span style="font-family:monospace;font-size:12px;color:#89b4fa">Edinburgh, Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>`))
    .addTo(map)

  map.dragRotate.disable()
  map.touchZoomRotate.disableRotation()
  new ResizeObserver(() => map.resize()).observe(document.getElementById('map'))
})()
