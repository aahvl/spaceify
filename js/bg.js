(function () {
  const hue = document.getElementById('ethereal-hue')
  if (!hue) return
  let angle = 180
  ;(function tick() {
    angle = (angle + 2.3) % 360
    hue.setAttribute('values', angle.toFixed(2))
    requestAnimationFrame(tick)
  })()
})()
