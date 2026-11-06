'use strict';
const $ = selector => document.querySelector(selector);
const snapshot = JSON.parse($('#repository-data').textContent);
let repositories = snapshot;
let filter = 'All';
let visibleCount = 6;
const curated = new Map(snapshot.map(repo => [repo.name, { title: repo.title, summary: repo.summary }]));
const icons = {JavaScript:'javascript', TypeScript:'typescript', Python:'python', PHP:'php', Dart:'dart', Java:'java', HTML:'html5', CSS:'css3', 'Jupyter Notebook':'jupyter'};
const category = repo => repo.language === 'Dart' ? 'Mobile' : ['Python','Jupyter Notebook'].includes(repo.language) ? 'AI & data' : repo.language === 'Java' ? 'Games & Java' : 'Web';
function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}
function projectCard(repo, index) {
  const details = curated.get(repo.name);
  const card = element('article', 'project-card');
  const top = element('div', 'card-top');
  top.append(element('span', 'project-number', `${String(index + 1).padStart(2, '0')} / ${category(repo)}`));
  const arrow = element('span', '', '↗'); arrow.setAttribute('aria-hidden','true'); top.append(arrow);
  const heading = element('h3');
  const link = element('a', '', details?.title || repo.name.replace(/[_-]/g, ' ').trim());
  link.href = `https://github.com/Nicookie19/${encodeURIComponent(repo.name)}`;
  link.target = '_blank'; link.rel = 'noopener noreferrer'; heading.append(link);
  const description = element('p', '', repo.description || details?.summary || `Explore the source code and project files for this ${repo.language || 'software'} project on GitHub.`);
  const bottom = element('div', 'card-bottom');
  const language = element('span', 'language');
  if (icons[repo.language]) {
    const image = element('img'); image.src = `assets/icons/${icons[repo.language]}.svg`; image.alt = ''; image.width = 18; image.height = 18; language.append(image);
  }
  language.append(document.createTextNode(repo.language || 'Code'));
  const date = new Date(repo.updated_at);
  const updated = element('span', '', `Updated ${Number.isNaN(date.getTime()) ? 'on GitHub' : date.toLocaleDateString('en-US', {month:'short', day:'numeric',year:'numeric'})}`);
  bottom.append(language, updated); card.append(top, heading, description, bottom); return card;
}
function renderProjects() {
  const query = $('#project-search').value.trim().toLowerCase();
  const sort = $('#project-sort').value;
  const matching = repositories.filter(repo => repo.name !== 'Nicookies-Portfolio' && !repo.fork)
    .filter(repo => filter === 'All' || category(repo) === filter)
    .filter(repo => [repo.name,repo.description,repo.language,curated.get(repo.name)?.title,curated.get(repo.name)?.summary].join(' ').toLowerCase().includes(query))
    .sort((a,b) => sort === 'name' ? (curated.get(a.name)?.title || a.name).localeCompare(curated.get(b.name)?.title || b.name) : sort === 'stars' ? b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at) : new Date(b.updated_at) - new Date(a.updated_at));
  const shown = matching.slice(0, visibleCount);
  $('#project-grid').replaceChildren(...shown.map(projectCard));
  $('#project-count').textContent = `${shown.length} of ${matching.length} projects`;
  $('#empty-state').hidden = matching.length !== 0;
  $('#show-more').hidden = shown.length >= matching.length;
  $('#show-more').textContent = `Show more projects (${matching.length - shown.length} remaining) ↓`;
}
$('.project-controls').hidden = false;
$('.filters').addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]'); if (!button) return;
  filter = button.dataset.filter; visibleCount = 6;
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
  renderProjects();
});
$('#project-search').addEventListener('input', () => { visibleCount = 6; renderProjects(); });
$('#project-sort').addEventListener('change', () => { visibleCount = 6; renderProjects(); });
$('#show-more').addEventListener('click', () => {
  const previousCount = $('#project-grid').children.length;
  visibleCount += 6; renderProjects();
  $('#project-grid').children[previousCount]?.querySelector('a').focus({preventScroll:true});
});
$('#reset-filters').addEventListener('click', () => { $('#project-search').value = ''; $('[data-filter="All"]').click(); $('#project-search').focus(); });
renderProjects();
// Keep the embedded snapshot usable when GitHub is unavailable or rate-limited.
async function refreshRepositories() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const fresh = [];
    for (let page = 1; ; page++) {
      const response = await fetch(`https://api.github.com/users/Nicookie19/repos?sort=updated&per_page=100&page=${page}`, {signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});
      if (!response.ok) throw new Error(`GitHub ${response.status}`);
      const batch = await response.json();
      if (!Array.isArray(batch) || batch.some(repo => typeof repo.name !== 'string' || typeof repo.updated_at !== 'string')) throw new Error('Invalid GitHub response');
      fresh.push(...batch);
      if (batch.length < 100) break;
    }
    repositories = fresh; renderProjects();
    $('#sync-status').textContent = 'Synced with GitHub · just now';
  } catch {
    $('#sync-status').textContent = 'Saved GitHub snapshot · Nov 5, 2026';
  } finally {clearTimeout(timeout);}
}
refreshRepositories();
const themeButton = $('#theme-toggle');
function updateThemeLabel() { themeButton.setAttribute('aria-label', `Switch to ${document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'} mode`); }
updateThemeLabel();
themeButton.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try {localStorage.setItem('theme',theme);} catch {}
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#101211' : '#f7f8f2';
  updateThemeLabel();
});
const menu = $('.menu-toggle');
function closeMenu() { $('#nav-links').classList.remove('open'); menu.setAttribute('aria-expanded','false'); }
menu.addEventListener('click', () => menu.setAttribute('aria-expanded',String($('#nav-links').classList.toggle('open'))));
$('#nav-links').addEventListener('click', event => {if (event.target.closest('a')) closeMenu();});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {closeMenu();menu.focus();} });
document.addEventListener('click', event => {if (!event.target.closest('.navigation')) closeMenu();});
window.matchMedia('(min-width: 541px)').addEventListener('change',event => {if(event.matches) closeMenu();});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      document.querySelectorAll('#nav-links a').forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
      });
    }
  }, {rootMargin:'-15% 0px -60% 0px',threshold:0});
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
}
function progress() {
  const range = document.documentElement.scrollHeight - innerHeight;
  $('.scroll-progress').style.transform = `scaleX(${range > 0 ? Math.min(1,scrollY / range) : 0})`;
}
window.addEventListener('scroll',progress,{passive:true});
window.addEventListener('resize',progress);progress();
function updateTime() { $('#local-time').textContent = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date()) + ' PHT'; }
updateTime();setInterval(updateTime,60000);
$('#year').textContent = new Date().getFullYear();
const copy = $('#copy-email');copy.hidden = false;
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('nmahipus_240000001368@uic.edu.ph');
    $('#copy-status').textContent = 'Email copied. Say hello whenever you’re ready.';
  } catch { $('#copy-status').textContent = 'Email: nmahipus_240000001368@uic.edu.ph'; }
});

// CSS handles the animation; pause it when the tab is hidden or on request.
const motionToggle = $('#motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let backgroundPaused = false;
try { backgroundPaused = localStorage.getItem('background-paused') === 'true'; } catch {}
function updateBackgroundMotion() {
  document.documentElement.setAttribute('data-background-enabled', '');
  document.documentElement.toggleAttribute('data-background-paused', backgroundPaused || reducedMotion.matches);
  motionToggle.hidden = reducedMotion.matches;
  const label = backgroundPaused ? 'Resume background animation' : 'Pause background animation';
  motionToggle.setAttribute('aria-label', label);
  motionToggle.title = label;
  motionToggle.firstElementChild.textContent = backgroundPaused ? '▶' : 'Ⅱ';
}
motionToggle.addEventListener('click', () => {
  backgroundPaused = !backgroundPaused;
  try { localStorage.setItem('background-paused', String(backgroundPaused)); } catch {}
  updateBackgroundMotion();
});
reducedMotion.addEventListener('change', updateBackgroundMotion);
function updateBackgroundVisibility() {
  document.documentElement.toggleAttribute('data-page-hidden', document.hidden);
}
document.addEventListener('visibilitychange', updateBackgroundVisibility);
updateBackgroundVisibility();
updateBackgroundMotion();
