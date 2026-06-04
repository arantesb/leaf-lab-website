// ── State ─────────────────────────────────────────────────
const REPO = 'arantesb/leaf-lab-website';
const BRANCH = 'main';
const DATA_PREFIX = 'content';
let GH_TOKEN = '', GH_USER = '';
let currentSection = 'dashboard';
let editingType = null, editingId = null;
let data = { news:[], team:[], projects:[], pubs:[], home:{}, contact:{}, settings:{} };
let fileShas = {};

const COLOR_LABELS = {
  '--deep-forest': 'Floresta Escura (fundo escuro)',
  '--canopy':      'Canopy / Verde Médio',
  '--gold':        'Dourado / Detalhes',
  '--sunlight':    'Amarelo Claro / Fundo suave',
  '--paper':       'Paper / Fundo principal',
  '--sky':         'Azul Céu / Links',
  '--ink':         'Tinta / Texto principal'
};

// ── Auth ──────────────────────────────────────────────────
async function login() {
  var user = document.getElementById('ghUser').value.trim();
  var token = document.getElementById('ghToken').value.trim();
  if (!user || !token) { showToast('Preencha usuário e token', 'error'); return; }
  try {
    var r = await fetch('https://api.github.com/user', { headers: { Authorization: 'token ' + token } });
    if (!r.ok) throw new Error('invalid');
    GH_TOKEN = token; GH_USER = user;
    localStorage.setItem('ll_token', token);
    localStorage.setItem('ll_user', user);
    startApp();
  } catch(e) { showToast('Token inválido. Verifique e tente novamente.', 'error'); }
}

function logout() {
  localStorage.removeItem('ll_token'); localStorage.removeItem('ll_user');
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
}

window.onload = function() {
  var t = localStorage.getItem('ll_token'), u = localStorage.getItem('ll_user');
  if (t && u) {
    document.getElementById('ghUser').value = u;
    document.getElementById('ghToken').value = t;
    GH_TOKEN = t; GH_USER = u;
    startApp();
  }
};

async function startApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('topbarStatus').textContent = '@' + GH_USER;
  await loadAllData();
  renderDashboard();
}

// ── GitHub API ────────────────────────────────────────────
async function ghGet(path) {
  var r = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + path, {
    headers: { Authorization: 'token ' + GH_TOKEN, Accept: 'application/vnd.github.v3+json' }
  });
  if (!r.ok) return null;
  return r.json();
}

async function ghPut(path, content, sha) {
  var body = { message: 'CMS: update ' + path, content: btoa(unescape(encodeURIComponent(content))), branch: BRANCH };
  if (sha) body.sha = sha;
  var r = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + path, {
    method: 'PUT',
    headers: { Authorization: 'token ' + GH_TOKEN, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  var res = await r.json();
  if (!r.ok) throw new Error(res.message || 'GitHub API error');
  return res;
}

function decodeFile(file) {
  return JSON.parse(decodeURIComponent(escape(atob(file.content.replace(/\n/g,'')))));
}

async function loadAllData() {
  var files = ['news','team','projects','publications','home','contact','settings'];
  var keys  = ['news','team','projects','pubs',         'home','contact','settings'];
  for (var i = 0; i < files.length; i++) {
    var f = await ghGet(DATA_PREFIX + '/' + files[i] + '.json');
    if (f) { fileShas[keys[i]] = f.sha; data[keys[i]] = decodeFile(f); }
  }
}

async function saveData(key, fileKey) {
  var fname = fileKey || key;
  var json = JSON.stringify(data[key], null, 2);
  var res = await ghPut(DATA_PREFIX + '/' + fname + '.json', json, fileShas[key]);
  fileShas[key] = res.content.sha;
}

// ── Navigation ────────────────────────────────────────────
function showSection(name, el) {
  document.querySelectorAll('.section-panel').forEach(function(p){ p.style.display='none'; });
  document.querySelectorAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
  var sec = document.getElementById('sec-' + name);
  if (sec) sec.style.display = 'block';
  if (el) el.classList.add('active');
  currentSection = name;
  if (name === 'news')      renderNews();
  if (name === 'team')      renderTeam();
  if (name === 'projects')  renderProjects();
  if (name === 'pubs')      renderPubs();
  if (name === 'dashboard') renderDashboard();
  if (name === 'home')      populateHomeEditor();
  if (name === 'contact')   populateContactEditor();
  if (name === 'colors')    renderColors();
}

// ── Dashboard ─────────────────────────────────────────────
function renderDashboard() {
  var stats = [
    { icon:'📰', num:data.news.length, label:'Notícias' },
    { icon:'👥', num:data.team.filter(function(m){return m.status==='current';}).length, label:'Membros ativos' },
    { icon:'🔬', num:data.projects.filter(function(p){return p.status==='active';}).length, label:'Projetos ativos' },
    { icon:'📚', num:data.pubs.length, label:'Publicações' }
  ];
  document.getElementById('dashStats').innerHTML = stats.map(function(s) {
    return '<div class="stat-card"><div class="stat-icon">'+s.icon+'</div><div class="stat-num">'+s.num+'</div><div class="stat-label">'+s.label+'</div></div>';
  }).join('');
}

// ── Render lists ──────────────────────────────────────────
function renderNews() {
  document.getElementById('news-count').textContent = data.news.length + ' item(ns)';
  if (!data.news.length) { document.getElementById('news-list').innerHTML = emptyState('Nenhuma notícia ainda','📰'); return; }
  document.getElementById('news-list').innerHTML = data.news.map(function(n,i) {
    return '<div class="item-card"><div class="item-card-left"><div class="item-emoji">'+(n.emoji||'📰')+'</div><div><div class="item-card-name">'+n.title+'</div><div class="item-card-meta">'+n.source+' · '+n.date+' · '+n.category+'</div></div></div><div class="item-actions">'+(n.featured?'<span class="item-badge badge-active">Destaque</span>':'')+'<button class="btn btn-outline btn-sm" onclick="openModal(\'news\','+i+')">Editar</button><button class="btn btn-danger btn-sm" onclick="deleteItem(\'news\','+i+')">✕</button></div></div>';
  }).join('');
}

function renderTeam() {
  document.getElementById('team-count').textContent = data.team.length + ' pessoa(s)';
  if (!data.team.length) { document.getElementById('team-list').innerHTML = emptyState('Nenhum membro ainda','👥'); return; }
  document.getElementById('team-list').innerHTML = data.team.map(function(m,i) {
    var initials = m.initials || (m.name||'').split(' ').map(function(x){return x[0];}).join('').slice(0,2);
    var isAlumni = m.status === 'alumni';
    return '<div class="item-card"><div class="item-card-left"><div class="item-emoji" style="width:38px;height:38px;border-radius:50%;background:var(--sun);display:flex;align-items:center;justify-content:center;font-family:\'Cormorant Garamond\',serif;font-weight:700;font-size:1rem;color:var(--green);">'+initials+'</div><div><div class="item-card-name">'+m.name+'</div><div class="item-card-meta">'+m.role+'</div></div></div><div class="item-actions"><span class="item-badge '+(isAlumni?'badge-alumni':'badge-current')+'">'+(isAlumni?'Alumni':'Ativo')+'</span><button class="btn btn-outline btn-sm" onclick="openModal(\'team\','+i+')">Editar</button><button class="btn btn-danger btn-sm" onclick="deleteItem(\'team\','+i+')">✕</button></div></div>';
  }).join('');
}

function renderProjects() {
  document.getElementById('projects-count').textContent = data.projects.length + ' projeto(s)';
  if (!data.projects.length) { document.getElementById('projects-list').innerHTML = emptyState('Nenhum projeto ainda','🔬'); return; }
  document.getElementById('projects-list').innerHTML = data.projects.map(function(p,i) {
    return '<div class="item-card"><div class="item-card-left"><div class="item-emoji">'+(p.emoji||'🔬')+'</div><div><div class="item-card-name">'+p.title+'</div><div class="item-card-meta">'+p.funder+'</div></div></div><div class="item-actions"><span class="item-badge '+(p.status==='active'?'badge-active':'badge-completed')+'">'+(p.status==='active'?'Ativo':'Concluído')+'</span><button class="btn btn-outline btn-sm" onclick="openModal(\'projects\','+i+')">Editar</button><button class="btn btn-danger btn-sm" onclick="deleteItem(\'projects\','+i+')">✕</button></div></div>';
  }).join('');
}

function renderPubs() {
  document.getElementById('pubs-count').textContent = data.pubs.length + ' publicação(ões)';
  if (!data.pubs.length) { document.getElementById('pubs-list').innerHTML = emptyState('Nenhuma publicação ainda','📚'); return; }
  var typeLabel = { article:'Artigo', thesis:'Dissertação', book:'Capítulo' };
  var typeBadge = { article:'badge-active', thesis:'badge-alumni', book:'badge-current' };
  document.getElementById('pubs-list').innerHTML = data.pubs.map(function(p,i) {
    return '<div class="item-card"><div class="item-card-left"><div class="item-emoji">📄</div><div><div class="item-card-name">'+p.title+'</div><div class="item-card-meta">'+p.authors+' · '+p.journal+' · '+p.year+'</div></div></div><div class="item-actions"><span class="item-badge '+(typeBadge[p.type]||'badge-current')+'">'+(typeLabel[p.type]||p.type)+'</span><button class="btn btn-outline btn-sm" onclick="openModal(\'pubs\','+i+')">Editar</button><button class="btn btn-danger btn-sm" onclick="deleteItem(\'pubs\','+i+')">✕</button></div></div>';
  }).join('');
}

function emptyState(msg, icon) {
  return '<div class="empty-state"><div class="empty-icon">'+icon+'</div><p>'+msg+'</p></div>';
}

// ── Modals ────────────────────────────────────────────────
function openModal(type, idx) {
  editingType = type;
  editingId = (idx !== undefined) ? idx : null;
  var item = (editingId !== null) ? data[type][editingId] : {};
  var titles = { news:'Notícia', team:'Membro da Equipe', projects:'Projeto', pubs:'Publicação' };
  document.getElementById('modal-title').textContent = (editingId !== null ? 'Editar ' : 'Novo ') + titles[type];
  document.getElementById('modal-body').innerHTML = buildForm(type, item);
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('open');
  editingType = null; editingId = null;
}

function esc(str) {
  return String(str||'').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function sel(val, opt) { return val === opt ? 'selected' : ''; }

function buildForm(type, item) {
  var today = new Date().toISOString().split('T')[0];
  var yr = new Date().getFullYear();

  if (type === 'news') {
    var cats = ['Press','NASA','Research','Video','Event','Talk','Award'];
    var catOpts = cats.map(function(c){ return '<option '+sel(item.category,c)+'>'+c+'</option>'; }).join('');
    return '<div class="form-row"><div class="form-group"><label>Emoji</label><input id="f-emoji" value="'+esc(item.emoji||'📰')+'"/></div><div class="form-group"><label>Categoria</label><select id="f-category">'+catOpts+'</select></div></div><div class="form-group"><label>Título *</label><input id="f-title" value="'+esc(item.title)+'"/></div><div class="form-row"><div class="form-group"><label>Fonte</label><input id="f-source" value="'+esc(item.source)+'"/></div><div class="form-group"><label>Data</label><input id="f-date" type="date" value="'+esc(item.date||today)+'"/></div></div><div class="form-group"><label>Resumo</label><textarea id="f-excerpt">'+esc(item.excerpt)+'</textarea></div><div class="form-group"><label>URL</label><input id="f-url" value="'+esc(item.url)+'"/></div><div class="form-group"><label><input type="checkbox" id="f-featured" '+(item.featured?'checked':'')+' style="width:auto;margin-right:.4rem"/>Destacar no topo</label></div>';
  }

  if (type === 'team') {
    return '<div class="form-row"><div class="form-group"><label>Nome completo *</label><input id="f-name" value="'+esc(item.name)+'"/></div><div class="form-group"><label>Iniciais</label><input id="f-initials" value="'+esc(item.initials)+'" maxlength="3"/></div></div><div class="form-row"><div class="form-group"><label>Cargo</label><input id="f-role" value="'+esc(item.role)+'"/></div><div class="form-group"><label>Status</label><select id="f-status"><option value="pi" '+sel(item.status,'pi')+'>PI</option><option value="current" '+sel(item.status,'current')+'>Membro ativo</option><option value="alumni" '+sel(item.status,'alumni')+'>Alumni</option></select></div></div><div class="form-group"><label>Biografia</label><textarea id="f-bio1">'+esc(item.bio1||item.bio)+'</textarea></div><div class="form-group"><label>Especialidades (separadas por ·)</label><input id="f-expertise" value="'+esc(item.expertise)+'"/></div><div class="form-group"><label>Formação (separada por |)</label><input id="f-education" value="'+esc(item.education)+'"/></div><div class="form-section-title">Links (opcional)</div><div class="form-row"><div class="form-group"><label>URL Foto</label><input id="f-photo" value="'+esc(item.photo)+'"/></div><div class="form-group"><label>Google Scholar</label><input id="f-scholar" value="'+esc(item.scholar)+'"/></div></div><div class="form-group"><label>Perfil institucional</label><input id="f-profile" value="'+esc(item.profile)+'"/></div>';
  }

  if (type === 'projects') {
    return '<div class="form-row"><div class="form-group"><label>Emoji</label><input id="f-emoji" value="'+esc(item.emoji||'🔬')+'"/></div><div class="form-group"><label>Status</label><select id="f-status"><option value="active" '+sel(item.status,'active')+'>Ativo</option><option value="completed" '+sel(item.status,'completed')+'>Concluído</option></select></div></div><div class="form-group"><label>Título *</label><input id="f-title" value="'+esc(item.title)+'"/></div><div class="form-group"><label>Financiador e período</label><input id="f-funder" value="'+esc(item.funder)+'"/></div><div class="form-group"><label>Descrição</label><textarea id="f-description">'+esc(item.description)+'</textarea></div><div class="form-group"><label>Pessoas envolvidas</label><input id="f-people" value="'+esc(item.people)+'"/></div><div class="form-group"><label>Localização</label><input id="f-location" value="'+esc(item.location)+'"/></div>';
  }

  if (type === 'pubs') {
    return '<div class="form-row"><div class="form-group"><label>Tipo</label><select id="f-type"><option value="article" '+sel(item.type,'article')+'>Artigo</option><option value="book" '+sel(item.type,'book')+'>Capítulo de Livro</option><option value="thesis" '+sel(item.type,'thesis')+'>Dissertação / Tese</option></select></div><div class="form-group"><label>Ano</label><input id="f-year" type="number" value="'+(item.year||yr)+'" min="1990" max="2099"/></div></div><div class="form-group"><label>Título *</label><input id="f-title" value="'+esc(item.title)+'"/></div><div class="form-group"><label>Autores</label><input id="f-authors" value="'+esc(item.authors)+'"/></div><div class="form-row"><div class="form-group"><label>Revista / Editora</label><input id="f-journal" value="'+esc(item.journal)+'"/></div><div class="form-group"><label>Volume/Detalhes</label><input id="f-details" value="'+esc(item.details)+'"/></div></div><div class="form-row"><div class="form-group"><label>DOI</label><input id="f-doi" value="'+esc(item.doi)+'"/></div><div class="form-group"><label>URL</label><input id="f-url" value="'+esc(item.url)+'"/></div></div><div class="form-group"><label><input type="checkbox" id="f-highlight" '+(item.highlight?'checked':'')+' style="width:auto;margin-right:.4rem"/>Marcar como Highly Cited</label></div>';
  }
  return '';
}

function g(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

function collectForm(type) {
  var id = (editingId !== null) ? data[type][editingId].id : Date.now().toString(36);
  if (type === 'news') return { id:id, emoji:g('f-emoji'), category:g('f-category'), title:g('f-title'), source:g('f-source'), date:g('f-date'), year:g('f-date').slice(0,4), excerpt:g('f-excerpt'), url:g('f-url'), featured:document.getElementById('f-featured').checked };
  if (type === 'team') return { id:id, name:g('f-name'), initials:g('f-initials'), role:g('f-role'), status:g('f-status'), bio1:g('f-bio1'), bio2:'', expertise:g('f-expertise'), education:g('f-education'), photo:g('f-photo'), scholar:g('f-scholar'), profile:g('f-profile') };
  if (type === 'projects') return { id:id, emoji:g('f-emoji'), status:g('f-status'), title:g('f-title'), funder:g('f-funder'), description:g('f-description'), people:g('f-people'), location:g('f-location') };
  if (type === 'pubs') return { id:id, type:g('f-type'), year:parseInt(g('f-year'))||new Date().getFullYear(), title:g('f-title'), authors:g('f-authors'), journal:g('f-journal'), details:g('f-details'), doi:g('f-doi'), url:g('f-url'), highlight:document.getElementById('f-highlight').checked };
}

async function saveItem() {
  var btn = document.getElementById('modal-save-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Salvando...';
  try {
    var item = collectForm(editingType);
    if (!item.title && !item.name) { showToast('Preencha o campo obrigatório','error'); btn.disabled=false; btn.textContent='Salvar'; return; }
    if (editingId !== null) data[editingType][editingId] = item;
    else data[editingType].unshift(item);
    var fileMap = { pubs:'publications' };
    await saveData(editingType, fileMap[editingType]);
    closeModal();
    if (editingType==='news') renderNews();
    if (editingType==='team') renderTeam();
    if (editingType==='projects') renderProjects();
    if (editingType==='pubs') renderPubs();
    renderDashboard();
    showToast('Salvo! O site atualiza em ~1 min ✓','success');
  } catch(e) { showToast('Erro: '+e.message,'error'); }
  btn.disabled=false; btn.textContent='Salvar';
}

async function deleteItem(type, idx) {
  if (!confirm('Remover "' + (data[type][idx].title || data[type][idx].name) + '"?')) return;
  data[type].splice(idx, 1);
  try {
    var fileMap = { pubs:'publications' };
    await saveData(type, fileMap[type]);
    if (type==='news') renderNews();
    if (type==='team') renderTeam();
    if (type==='projects') renderProjects();
    if (type==='pubs') renderPubs();
    renderDashboard();
    showToast('Removido ✓');
  } catch(e) { showToast('Erro: '+e.message,'error'); }
}

// ── Home editor ───────────────────────────────────────────
function populateHomeEditor() {
  var h = data.home; if (!h || !h.hero) return;

  document.getElementById('h-tag').value       = h.hero.tag || '';
  document.getElementById('h-title').value     = h.hero.title || '';
  document.getElementById('h-highlight').value = h.hero.titleHighlight || '';
  document.getElementById('h-desc').value      = h.hero.description || '';

  document.getElementById('h-stats-fields').innerHTML = (h.hero.stats||[]).map(function(s,i) {
    return '<div class="form-row" style="margin-bottom:.5rem;"><div class="form-group"><label>Número '+(i+1)+'</label><input id="hs-num-'+i+'" value="'+esc(s.num)+'"/></div><div class="form-group"><label>Label '+(i+1)+'</label><input id="hs-lbl-'+i+'" value="'+esc(s.label)+'"/></div></div>';
  }).join('');

  document.getElementById('m-label').value = h.mission.label || '';
  document.getElementById('m-title').value = h.mission.title || '';
  document.getElementById('m-text1').value = h.mission.text1 || '';
  document.getElementById('m-text2').value = h.mission.text2 || '';

  document.getElementById('m-cards-fields').innerHTML = (h.mission.cards||[]).map(function(c,i) {
    return '<div style="border:1px solid rgba(83,109,74,.15);border-radius:var(--radius);padding:1rem;margin-bottom:.75rem;"><div class="form-row" style="margin-bottom:.5rem;"><div class="form-group"><label>Emoji '+(i+1)+'</label><input id="mc-emoji-'+i+'" value="'+esc(c.emoji)+'"/></div><div class="form-group"><label>Título '+(i+1)+'</label><input id="mc-title-'+i+'" value="'+esc(c.title)+'"/></div></div><div class="form-group"><label>Texto '+(i+1)+'</label><input id="mc-text-'+i+'" value="'+esc(c.text)+'"/></div></div>';
  }).join('');

  document.getElementById('hl-blocks').innerHTML = (h.highlights||[]).map(function(hl,i) {
    return '<div class="highlight-block"><div class="highlight-block-num">Destaque '+(i+1)+'</div><div class="form-group"><label>Tag</label><input id="hl-tag-'+i+'" value="'+esc(hl.tag)+'"/></div><div class="form-group"><label>Título</label><input id="hl-title-'+i+'" value="'+esc(hl.title)+'"/></div><div class="form-group"><label>Texto</label><textarea id="hl-text-'+i+'">'+esc(hl.text)+'</textarea></div><div class="form-row"><div class="form-group"><label>Texto do link</label><input id="hl-lt-'+i+'" value="'+esc(hl.linkText)+'"/></div><div class="form-group"><label>Href</label><input id="hl-lh-'+i+'" value="'+esc(hl.linkHref)+'"/></div></div></div>';
  }).join('');

  document.getElementById('c-label').value = h.cta.label || '';
  document.getElementById('c-title').value = h.cta.title || '';
  document.getElementById('c-text').value  = h.cta.text  || '';
}

async function savePageSection(section) {
  try {
    if (section === 'hero') {
      var stats = (data.home.hero.stats||[]).map(function(_,i){ return { num:g('hs-num-'+i), label:g('hs-lbl-'+i) }; });
      data.home.hero = { tag:g('h-tag'), title:g('h-title'), titleHighlight:g('h-highlight'), description:g('h-desc'), stats:stats };
    }
    if (section === 'mission') {
      var cards = (data.home.mission.cards||[]).map(function(_,i){ return { emoji:g('mc-emoji-'+i), title:g('mc-title-'+i), text:g('mc-text-'+i) }; });
      data.home.mission = { label:g('m-label'), title:g('m-title'), text1:g('m-text1'), text2:g('m-text2'), cards:cards };
    }
    if (section === 'highlights') {
      data.home.highlights = (data.home.highlights||[]).map(function(_,i){ return { tag:g('hl-tag-'+i), title:g('hl-title-'+i), text:g('hl-text-'+i), linkText:g('hl-lt-'+i), linkHref:g('hl-lh-'+i) }; });
    }
    if (section === 'cta') {
      data.home.cta = { label:g('c-label'), title:g('c-title'), text:g('c-text') };
    }
    await saveData('home');
    showToast('Home atualizada! ✓','success');
  } catch(e) { showToast('Erro: '+e.message,'error'); }
}

// ── Contact editor ────────────────────────────────────────
function populateContactEditor() {
  var c = data.contact; if (!c || !c.info) return;
  document.getElementById('ct-address').value    = c.info.address || '';
  document.getElementById('ct-email').value      = c.info.email   || '';
  document.getElementById('ct-phone').value      = c.info.phone   || '';
  document.getElementById('ct-hero-label').value = (c.hero && c.hero.label)    || '';
  document.getElementById('ct-hero-title').value = (c.hero && c.hero.title)    || '';
  document.getElementById('ct-hero-sub').value   = (c.hero && c.hero.subtitle) || '';
  renderLinkFields(c.info.links || []);
  renderInquiryFields(c.inquiries || []);
}

function renderLinkFields(links) {
  document.getElementById('ct-links-fields').innerHTML = links.map(function(l,i) {
    return '<div class="form-row" style="margin-bottom:.5rem;"><div class="form-group"><label>Label '+(i+1)+'</label><input id="cl-label-'+i+'" value="'+esc(l.label)+'"/></div><div class="form-group"><label>URL '+(i+1)+'</label><input id="cl-url-'+i+'" value="'+esc(l.url)+'"/></div></div>';
  }).join('');
}

function addLinkField() { var links = collectLinks(); links.push({label:'',url:''}); renderLinkFields(links); }

function collectLinks() {
  var fields = document.querySelectorAll('[id^="cl-label-"]');
  var result = [];
  fields.forEach(function(_, i) {
    var lbl = (document.getElementById('cl-label-'+i)||{value:''}).value.trim();
    var url = (document.getElementById('cl-url-'+i)||{value:''}).value.trim();
    if (lbl || url) result.push({label:lbl, url:url});
  });
  return result;
}

function renderInquiryFields(inquiries) {
  document.getElementById('ct-inquiries-fields').innerHTML = inquiries.map(function(q,i) {
    return '<div style="border:1px solid rgba(83,109,74,.15);border-radius:var(--radius);padding:1rem;margin-bottom:.75rem;"><div class="form-row" style="margin-bottom:.5rem;"><div class="form-group"><label>Emoji '+(i+1)+'</label><input id="ci-emoji-'+i+'" value="'+esc(q.emoji)+'"/></div><div class="form-group"><label>Título '+(i+1)+'</label><input id="ci-title-'+i+'" value="'+esc(q.title)+'"/></div></div><div class="form-group"><label>Texto '+(i+1)+'</label><textarea id="ci-text-'+i+'">'+esc(q.text)+'</textarea></div></div>';
  }).join('');
}

function addInquiryField() { var inqs = collectInquiries(); inqs.push({emoji:'',title:'',text:''}); renderInquiryFields(inqs); }

function collectInquiries() {
  var fields = document.querySelectorAll('[id^="ci-emoji-"]');
  var result = [];
  fields.forEach(function(_, i) {
    var emoji = (document.getElementById('ci-emoji-'+i)||{value:''}).value.trim();
    var title = (document.getElementById('ci-title-'+i)||{value:''}).value.trim();
    var text  = (document.getElementById('ci-text-'+i)||{value:''}).value.trim();
    if (title || text) result.push({emoji:emoji, title:title, text:text});
  });
  return result;
}

async function saveContactSection(section) {
  try {
    if (section === 'info')      data.contact.info = { address:g('ct-address'), email:g('ct-email'), phone:g('ct-phone'), links:(data.contact.info||{}).links||[] };
    if (section === 'links')     data.contact.info = Object.assign({}, data.contact.info, { links:collectLinks() });
    if (section === 'inquiries') data.contact.inquiries = collectInquiries();
    if (section === 'hero')      data.contact.hero = { label:g('ct-hero-label'), title:g('ct-hero-title'), subtitle:g('ct-hero-sub') };
    await saveData('contact');
    showToast('Contato atualizado! ✓','success');
  } catch(e) { showToast('Erro: '+e.message,'error'); }
}

// ── Colors editor ─────────────────────────────────────────
function renderColors() {
  var colors = (data.settings && data.settings.colors) || {};
  document.getElementById('color-grid').innerHTML = Object.keys(COLOR_LABELS).map(function(varName) {
    var label = COLOR_LABELS[varName];
    var val = colors[varName] || '#cccccc';
    var key = varName.replace(/-/g,'_');
    return '<div class="color-item"><input type="color" class="color-swatch" id="clr-'+key+'" value="'+val+'" oninput="previewColor(\''+varName+'\',this.value)"/><div><div class="color-label">'+label+'</div><div class="color-value" id="clrv-'+key+'">'+val+'</div></div></div>';
  }).join('');
}

function previewColor(varName, val) {
  document.documentElement.style.setProperty(varName, val);
  var key = varName.replace(/-/g,'_');
  var lbl = document.getElementById('clrv-'+key);
  if (lbl) lbl.textContent = val;
}

async function saveColors() {
  var colors = {};
  Object.keys(COLOR_LABELS).forEach(function(varName) {
    var key = varName.replace(/-/g,'_');
    var el = document.getElementById('clr-'+key);
    if (el) colors[varName] = el.value;
  });
  if (!data.settings) data.settings = {};
  data.settings.colors = colors;
  try {
    await saveData('settings');
    showToast('Cores salvas! O site atualiza em ~1 min ✓','success');
  } catch(e) { showToast('Erro: '+e.message,'error'); }
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show ' + (type || 'success');
  setTimeout(function(){ t.className = ''; }, 3500);
}
