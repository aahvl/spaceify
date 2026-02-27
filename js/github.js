const GH = 'aahvl'
const PROXY = 'https://corsproxy.io/?url='

const ghFetch = async url => {
  const r = await fetch(url).catch(() => null)
  if (r && r.ok) return r
  return fetch(PROXY + encodeURIComponent(url))
}

const LANG_COLORS = {
  JavaScript:'#f7df1e', TypeScript:'#3178c6', Python:'#3572A5',
  HTML:'#e34c26', CSS:'#563d7c', 'C++':'#f34b7d', Java:'#b07219',
  Ruby:'#701516', Go:'#00ADD8', Rust:'#dea584', Shell:'#89e051',
  Svelte:'#ff3e00', Vue:'#41b883', Dart:'#00B4AB', Kotlin:'#A97BFF',
  Swift:'#ffac45', C:'#555555', 'C#':'#178600',
}
const langColor = l => LANG_COLORS[l] || '#89b4fa'

function timeAgo(date) {
  const s = Math.floor((Date.now() - date) / 1000)
  if (s < 60)     return 'just now'
  if (s < 3600)   return `${Math.floor(s/60)}m ago`
  if (s < 86400)  return `${Math.floor(s/3600)}h ago`
  if (s < 604800) return `${Math.floor(s/86400)}d ago`
  return date.toLocaleDateString('en-GB', { day:'numeric', month:'short' })
}

async function fetchRepos() {
  const r = await ghFetch(`https://api.github.com/users/${GH}/repos?per_page=100&sort=updated`)
  if (!r.ok) throw new Error('repos')
  return r.json()
}

async function fetchCommits(repos) {
  const res = await Promise.all(
    repos.slice(0,8).map(repo =>
      ghFetch(`https://api.github.com/repos/${GH}/${repo.name}/commits?per_page=2&author=${GH}`)
        .then(r => r.ok ? r.json() : [])
        .then(cs => cs.map(c => ({
          repo: repo.name,
          message: c.commit.message.split('\n')[0],
          date: c.commit.author.date,
          url: c.html_url,
        })))
        .catch(() => [])
    )
  )
  return res.flat().sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0,6)
}

async function fetchLangs(repos) {
  const res = await Promise.all(
    repos.slice(0,15).map(repo =>
      ghFetch(`https://api.github.com/repos/${GH}/${repo.name}/languages`)
        .then(r => r.ok ? r.json() : {}).catch(() => ({}))
    )
  )
  const totals = {}
  res.forEach(obj => Object.entries(obj).forEach(([l,b]) => totals[l]=(totals[l]||0)+b))
  const total = Object.values(totals).reduce((a,b)=>a+b,0)
  return Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,6)
    .map(([lang,bytes]) => ({ lang, pct: Math.round(bytes/total*100) }))
}

function renderCommits(commits) {
  const el = document.getElementById('commits-list')
  if (!commits.length) { el.innerHTML = '<div class="loading-pulse">no commits found</div>'; return }
  el.innerHTML = commits.map(c => {
    const msg = c.message.length > 52 ? c.message.slice(0,52)+'…' : c.message
    return `<div class="commit-item">
      <div class="commit-dot"></div>
      <div>
        <div class="commit-repo">${c.repo}</div>
        <a href="${c.url}" target="_blank" class="commit-msg" style="text-decoration:none;color:inherit">${msg}</a>
        <div class="commit-meta">${timeAgo(new Date(c.date))}</div>
      </div>
    </div>`
  }).join('')
}

function renderLangs(langs) {
  const el = document.getElementById('langs-chart')
  if (!langs.length) { el.innerHTML = '<div class="loading-pulse">no data</div>'; return }
  el.innerHTML = langs.map(({lang,pct}) => `
    <div class="lang-row">
      <span class="lang-name">${lang}</span>
      <div class="lang-bar-wrap"><div class="lang-bar" style="background:${langColor(lang)}" data-pct="${pct}"></div></div>
      <span class="lang-pct">${pct}%</span>
    </div>`).join('')
  requestAnimationFrame(() => {
    document.querySelectorAll('.lang-bar').forEach(b => b.style.width = b.dataset.pct+'%')
  })
}

function renderStats(user, repos) {
  const stars = repos.reduce((s,r) => s+r.stargazers_count, 0)
  const forks = repos.reduce((s,r) => s+r.forks_count, 0)
  document.getElementById('gh-stats').innerHTML = `
    <div class="stat-item"><span class="stat-num">${repos.length}</span><div class="stat-label">repos</div></div>
    <div class="stat-item"><span class="stat-num">${user.followers}</span><div class="stat-label">followers</div></div>
    <div class="stat-item"><span class="stat-num">${stars}</span><div class="stat-label">stars</div></div>
    <div class="stat-item"><span class="stat-num">${forks}</span><div class="stat-label">forks</div></div>
  `
}

async function renderGames() {
  const games = [
    { name:'Roblox',           prefix:'simple-icons', slug:'roblox' },
    { name:'Minecraft',        prefix:'mdi',          slug:'minecraft' },
    { name:'Fortnite',         prefix:'simple-icons', slug:'fortnite' },
    { name:'Counter-Strike 2', prefix:'simple-icons', slug:'counterstrike' },
    { name:'Geometry Dash',    prefix:'arcticons',    slug:'geometry-dash' },
  ]
  const el = document.getElementById('games-list')
  if (!el) return
  try {
    const items = await Promise.all(games.map(async g => {
      const res = await fetch(`https://api.iconify.design/${g.prefix}/${g.slug}.svg`)
      if (!res.ok) return `<div class="game-item"><div style="width:22px;height:22px"></div><span>${g.name}</span></div>`
      let svg = await res.text()
      svg = svg.replace('<svg', '<svg width="22" height="22" fill="#cdd6f4" style="display:block"')
      return `<div class="game-item">${svg}<span>${g.name}</span></div>`
    }))
    el.innerHTML = items.join('')
  } catch(e) {
    el.innerHTML = '<div class="loading-pulse">couldn\'t load games</div>'
  }
}

;(async function () {
  try {
    renderGames()
    const [user, repos] = await Promise.all([
      ghFetch(`https://api.github.com/users/${GH}`).then(r => r.json()),
      fetchRepos(),
    ])
    const [commits, langs] = await Promise.all([fetchCommits(repos), fetchLangs(repos)])
    renderCommits(commits)
    renderLangs(langs)
    renderStats(user, repos)
  } catch(e) {
    ['commits-list','langs-chart','gh-stats'].forEach(id => {
      document.getElementById(id).innerHTML = '<div class="loading-pulse">couldn\'t load — try again later</div>'
    })
  }
})()
