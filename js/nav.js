;(function () {
  const els = document.querySelectorAll('.reveal-line,.reveal-heading,.reveal-fade,.reveal-up,.reveal-photo,.reveal-card')
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      e.target.classList.add('in-view')
      io.unobserve(e.target)
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  els.forEach(el => io.observe(el))
})()

;(function () {
  const nav = document.getElementById('nav')
  const links = document.querySelectorAll('.nav-link')
  const sects = document.querySelectorAll('section[id]')

  window.addEventListener('scroll', () => {
    let cur = ''
    sects.forEach(s => { if (window.scrollY >= s.offsetTop - 200) cur = s.id })
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${cur}`))
  }, { passive: true })
})()
