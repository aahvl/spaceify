const _b = document.getElementById('email-btn')
if (_b) _b.style.setProperty('--path', `path('M 0 0 H ${_b.offsetWidth} V ${_b.offsetHeight} H 0 V 0')`)

function copySlack() {
  navigator.clipboard.writeText('@aahil').then(() => {
    const t = document.getElementById('slack-toast')
    t && (t.classList.add('show'), setTimeout(() => t.classList.remove('show'), 1800))
  })
}

;(function () {
  const el = document.getElementById('time-spent')
  if (!el) return
  const start = Date.now()
  setInterval(() => {
    const s = Math.floor((Date.now()-start)/1000)
    el.textContent = `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
  }, 1000)
})()
