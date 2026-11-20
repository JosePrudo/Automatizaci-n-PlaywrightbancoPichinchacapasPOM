import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';

/**
 * Reporter HTML con estilo Serenity BDD: tablero de resultados, cobertura funcional
 * por característica, listado de escenarios y narrativa de pasos con evidencias.
 */

interface Options {
  outputFolder?: string;
  title?: string;
}

type Outcome = 'success' | 'failure' | 'error' | 'ignored' | 'compromised';

interface StepNode {
  title: string;
  category: string;
  duration: number;
  outcome: Outcome;
  error?: string;
  children: StepNode[];
}

interface Evidence {
  name: string;
  type: 'image' | 'video' | 'text' | 'file';
  src?: string;
  text?: string;
}

interface Scenario {
  id: string;
  title: string;
  feature: string;
  capability: string;
  file: string;
  outcome: Outcome;
  duration: number;
  startTime: string;
  retries: number;
  error?: string;
  annotations: { type: string; description?: string }[];
  steps: StepNode[];
  evidence: Evidence[];
}

const VISIBLE_CATEGORIES = new Set(['test.step', 'pw:api', 'expect', 'hook']);

export default class SerenityStyleReporter implements Reporter {
  private readonly outputFolder: string;
  private readonly title: string;
  private config!: FullConfig;
  private suite!: Suite;
  private startTime = new Date();

  constructor(options: Options = {}) {
    this.outputFolder = path.resolve(options.outputFolder ?? 'reports/serenity');
    this.title = options.title ?? 'Reporte de pruebas';
  }

  printsToStdio(): boolean {
    return false;
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.suite = suite;
    this.startTime = new Date();
    fs.rmSync(this.outputFolder, { recursive: true, force: true });
    fs.mkdirSync(path.join(this.outputFolder, 'assets'), { recursive: true });
  }

  async onEnd(result: FullResult): Promise<void> {
    const scenarios = this.suite.allTests().map((test, i) => this.toScenario(test, i));
    const project = this.config.projects[0];
    const data = {
      title: this.title,
      generatedAt: new Date().toISOString(),
      startTime: this.startTime.toISOString(),
      duration: Date.now() - this.startTime.getTime(),
      status: result.status,
      environment: {
        Navegador: project?.use?.channel ?? project?.use?.browserName ?? project?.name ?? 'chromium',
        Proyecto: project?.name ?? '-',
        'URL base': String(project?.use?.baseURL ?? '-'),
        'Sistema operativo': `${os.type()} ${os.release()}`,
        'Node.js': process.version,
        Workers: String(this.config.workers),
      },
      scenarios,
    };
    fs.writeFileSync(path.join(this.outputFolder, 'index.html'), renderHtml(data), 'utf-8');
    console.log(`\nReporte estilo Serenity: ${path.join(this.outputFolder, 'index.html')}`);
  }

  private toScenario(test: TestCase, index: number): Scenario {
    const result: TestResult | undefined = test.results[test.results.length - 1];
    const titlePath = test.titlePath().filter(Boolean);
    const file = path.relative(this.config.rootDir, test.location.file).replace(/\\/g, '/');
    // titlePath: [project, archivo, describe..., test]
    const describes = titlePath.slice(2, -1);
    const feature = describes.join(' › ') || path.basename(file);

    if (!result) {
      return {
        id: `s${index}`,
        title: test.title,
        feature,
        capability: path.basename(file),
        file,
        outcome: 'ignored',
        duration: 0,
        startTime: '',
        retries: 0,
        annotations: test.annotations,
        steps: [],
        evidence: [],
      };
    }

    return {
      id: `s${index}`,
      title: test.title,
      feature,
      capability: path.basename(file),
      file,
      outcome: toOutcome(result.status),
      duration: result.duration,
      startTime: result.startTime.toISOString(),
      retries: result.retry,
      error: result.error ? stripAnsi(result.error.message ?? result.error.value ?? '') : undefined,
      annotations: [...test.annotations, ...(result.annotations ?? [])].filter(
        (a, i, arr) => arr.findIndex((b) => b.type === a.type && b.description === a.description) === i,
      ),
      steps: this.toSteps(result.steps),
      evidence: this.collectEvidence(result, index),
    };
  }

  private toSteps(steps: TestStep[]): StepNode[] {
    const nodes: StepNode[] = [];
    for (const step of steps) {
      const children = this.toSteps(step.steps);
      if (!VISIBLE_CATEGORIES.has(step.category)) {
        nodes.push(...children);
        continue;
      }
      if (step.category === 'hook' && children.length === 0) continue;
      nodes.push({
        title: step.category === 'hook' ? translateHook(step.title) : step.title,
        category: step.category,
        duration: step.duration,
        outcome: step.error ? 'failure' : 'success',
        error:
          step.error && !children.some((c) => c.outcome === 'failure')
            ? stripAnsi(step.error.message ?? '')
            : undefined,
        children,
      });
    }
    return nodes;
  }

  private collectEvidence(result: TestResult, index: number): Evidence[] {
    const evidence: Evidence[] = [];
    result.attachments.forEach((att, i) => {
      if (att.body) {
        evidence.push({ name: att.name, type: 'text', text: att.body.toString('utf-8') });
        return;
      }
      if (!att.path || !fs.existsSync(att.path)) return;
      const ext = path.extname(att.path);
      const fileName = `s${index}-${i}${ext}`;
      fs.copyFileSync(att.path, path.join(this.outputFolder, 'assets', fileName));
      const src = `assets/${fileName}`;
      if (att.contentType.startsWith('image/')) evidence.push({ name: att.name, type: 'image', src });
      else if (att.contentType.startsWith('video/')) evidence.push({ name: att.name, type: 'video', src });
      else evidence.push({ name: att.name, type: 'file', src });
    });
    return evidence;
  }
}

function toOutcome(status: TestResult['status']): Outcome {
  switch (status) {
    case 'passed':
      return 'success';
    case 'failed':
      return 'failure';
    case 'timedOut':
      return 'error';
    case 'skipped':
      return 'ignored';
    default:
      return 'compromised';
  }
}

function translateHook(title: string): string {
  if (/^before hooks$/i.test(title)) return 'Preparación del escenario';
  if (/^after hooks$/i.test(title)) return 'Cierre del escenario';
  if (/beforeEach|before each/i.test(title)) return 'Precondición (beforeEach)';
  if (/afterEach|after each/i.test(title)) return 'Postcondición (afterEach)';
  return title;
}

function stripAnsi(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

function renderHtml(data: unknown): string {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reporte estilo Serenity</title>
<style>
:root{--success:#5cb85c;--failure:#d9534f;--error:#f0ad4e;--ignored:#9e9e9e;--compromised:#8e44ad;--brand:#00757f;--dark:#1f2d3d;--bg:#f4f6f8}
*{box-sizing:border-box}body{margin:0;font-family:"Open Sans",Segoe UI,Arial,sans-serif;background:var(--bg);color:#333;font-size:14px}
header{background:var(--dark);color:#fff;padding:14px 28px;display:flex;align-items:center;gap:16px}
header .logo{font-weight:700;font-size:20px;letter-spacing:.5px}header .logo span{color:#7fd3c3}
header .sub{opacity:.75;font-size:13px}
nav{background:var(--brand);padding:0 28px;display:flex;gap:4px}
nav a{color:#e6f4f4;text-decoration:none;padding:12px 16px;display:inline-block;font-weight:600}
nav a.active,nav a:hover{background:rgba(255,255,255,.15);color:#fff}
main{padding:24px 28px;max-width:1400px;margin:auto}
.card{background:#fff;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.12);padding:20px;margin-bottom:20px}
.card h2{margin:0 0 16px;font-size:17px;color:var(--dark);border-bottom:1px solid #eee;padding-bottom:10px}
.grid{display:grid;grid-template-columns:320px 1fr;gap:20px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px}
.kpi{border-radius:6px;padding:14px;color:#fff;text-align:center}.kpi b{display:block;font-size:28px;white-space:nowrap}.kpi b.sm{font-size:20px;line-height:42px}
.bg-success{background:var(--success)}.bg-failure{background:var(--failure)}.bg-error{background:var(--error)}.bg-ignored{background:var(--ignored)}.bg-compromised{background:var(--compromised)}.bg-total{background:var(--dark)}
table{width:100%;border-collapse:collapse}th,td{padding:9px 10px;border-bottom:1px solid #eee;text-align:left;vertical-align:middle}
th{background:#fafafa;color:#555;font-weight:600;cursor:pointer;user-select:none}tr:hover td{background:#f9fcfc}
.badge{display:inline-block;padding:3px 9px;border-radius:12px;color:#fff;font-size:12px;font-weight:600;white-space:nowrap}
.bar{display:flex;height:14px;border-radius:7px;overflow:hidden;background:#eee;min-width:140px}.bar div{height:100%}
a.link{color:var(--brand);text-decoration:none;font-weight:600}a.link:hover{text-decoration:underline}
.env td:first-child{font-weight:600;width:180px;color:#555}
.legend div{display:flex;align-items:center;gap:8px;margin:4px 0}.dot{width:12px;height:12px;border-radius:50%}
.filters{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}.filters input{flex:1;min-width:220px;padding:8px;border:1px solid #ccc;border-radius:4px}
.filters button{border:1px solid #ccc;background:#fff;padding:7px 12px;border-radius:4px;cursor:pointer}.filters button.on{background:var(--brand);color:#fff;border-color:var(--brand)}
.steps{list-style:none;padding-left:0;margin:0}.steps ul{list-style:none;padding-left:26px;margin:0;border-left:2px solid #e3e8ec}
.step{display:flex;align-items:center;gap:8px;padding:6px 8px;border-bottom:1px dotted #eee}
.step .t{flex:1}.step .d{color:#888;font-size:12px;white-space:nowrap}
.step.cat-test-step .t{font-weight:600;color:var(--dark)}.step.cat-hook .t{font-style:italic;color:#555}
.step .tg{cursor:pointer;width:16px;color:#888}.collapsed>ul{display:none}
.icon{width:18px;height:18px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700;flex:none}
.err{background:#fdf0f0;border-left:4px solid var(--failure);padding:10px;white-space:pre-wrap;font-family:Consolas,monospace;font-size:12px;overflow:auto;max-height:300px}
.evidence{display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:16px}.evidence img,.evidence video{width:100%;border:1px solid #ddd;border-radius:4px}
pre.txt{background:#f6f8fa;padding:10px;border-radius:4px;overflow:auto}
.title-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.title-row h1{margin:0;font-size:22px;color:var(--dark)}
.meta{color:#666;font-size:13px;margin-top:6px}.ann{background:#fff8e1;border-left:4px solid var(--error);padding:8px 12px;margin:6px 0}
footer{text-align:center;color:#999;font-size:12px;padding:20px}
</style>
</head>
<body>
<header><div class="logo">Serenity<span>·</span>Style</div><div><div id="h-title"></div><div class="sub" id="h-sub"></div></div></header>
<nav id="nav"><a href="#/" data-v="home">Resumen</a><a href="#/caracteristicas" data-v="features">Características</a><a href="#/escenarios" data-v="scenarios">Escenarios</a></nav>
<main id="app"></main>
<footer>Generado por el reporter estilo Serenity BDD para Playwright</footer>
<script id="data" type="application/json">${json}</script>
<script>
const D=JSON.parse(document.getElementById('data').textContent);
const L={success:'Éxito',failure:'Fallo',error:'Error',ignored:'Omitido',compromised:'Comprometido'};
const IC={success:'✓',failure:'✗',error:'!',ignored:'–',compromised:'?'};
const ORDER=['success','failure','error','compromised','ignored'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dur=ms=>ms<1000?Math.round(ms)+' ms':ms<60000?(ms/1000).toFixed(1)+' s':Math.floor(ms/60000)+' min '+Math.round(ms%60000/1000)+' s';
const fmt=d=>d?new Date(d).toLocaleString('es-EC'):'-';
const badge=o=>'<span class="badge bg-'+o+'">'+L[o]+'</span>';
const icon=o=>'<span class="icon bg-'+o+'">'+IC[o]+'</span>';
const count=list=>{const c={total:list.length};ORDER.forEach(o=>c[o]=list.filter(s=>s.outcome===o).length);return c};
const pct=(n,t)=>t?Math.round(n*100/t):0;
const bar=c=>'<div class="bar" title="'+ORDER.map(o=>L[o]+': '+c[o]).join(' | ')+'">'+ORDER.map(o=>c[o]?'<div class="bg-'+o+'" style="width:'+(c[o]*100/c.total)+'%"></div>':'').join('')+'</div>';
const worst=c=>c.failure?'failure':c.error?'error':c.compromised?'compromised':c.success?'success':'ignored';
const features=()=>{const m=new Map();D.scenarios.forEach(s=>{if(!m.has(s.feature))m.set(s.feature,{name:s.feature,file:s.file,list:[]});m.get(s.feature).list.push(s)});return[...m.values()]};

function donut(c){const r=70,C=2*Math.PI*r;let off=0;const segs=ORDER.filter(o=>c[o]).map(o=>{const len=C*c[o]/c.total;const s='<circle r="'+r+'" cx="90" cy="90" fill="none" stroke="var(--'+o+')" stroke-width="28" stroke-dasharray="'+len+' '+(C-len)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 90 90)"><title>'+L[o]+': '+c[o]+'</title></circle>';off+=len;return s}).join('');
return '<svg width="180" height="180" viewBox="0 0 180 180">'+segs+'<text x="90" y="86" text-anchor="middle" font-size="28" font-weight="700" fill="#1f2d3d">'+pct(c.success,c.total)+'%</text><text x="90" y="108" text-anchor="middle" font-size="12" fill="#777">exitosas</text></svg>'}

function home(){const c=count(D.scenarios);const f=features();
return '<div class="card"><h2>Resumen de la ejecución</h2><div class="kpis">'+
'<div class="kpi bg-total"><b>'+c.total+'</b>Escenarios</div>'+ORDER.map(o=>'<div class="kpi bg-'+o+'"><b>'+c[o]+'</b>'+L[o]+'</div>').join('')+
'<div class="kpi bg-total"><b class="sm">'+dur(D.duration)+'</b>Duración</div></div></div>'+
'<div class="grid"><div class="card"><h2>Resultado de las pruebas</h2><div style="text-align:center">'+donut(c)+'</div><div class="legend">'+ORDER.map(o=>'<div><span class="dot bg-'+o+'"></span>'+L[o]+': <b>'+c[o]+'</b> ('+pct(c[o],c.total)+'%)</div>').join('')+'</div></div>'+
'<div class="card"><h2>Cobertura funcional</h2><table><tr><th>Característica</th><th>Escenarios</th><th>% Éxito</th><th>Resultado</th></tr>'+
f.map(x=>{const k=count(x.list);return '<tr><td><a class="link" href="#/caracteristica/'+encodeURIComponent(x.name)+'">'+esc(x.name)+'</a></td><td>'+k.total+'</td><td>'+pct(k.success,k.total)+'%</td><td>'+bar(k)+'</td></tr>'}).join('')+'</table></div></div>'+
'<div class="card"><h2>Entorno de ejecución</h2><table class="env">'+Object.entries(D.environment).map(([k,v])=>'<tr><td>'+esc(k)+'</td><td>'+esc(v)+'</td></tr>').join('')+
'<tr><td>Inicio</td><td>'+fmt(D.startTime)+'</td></tr><tr><td>Estado global</td><td>'+esc(D.status)+'</td></tr></table></div>'}

function featuresView(){return '<div class="card"><h2>Características</h2><table><tr><th>Característica</th><th>Archivo</th><th>Escenarios</th><th>Éxito</th><th>Fallo</th><th>Duración</th><th>Resultado</th><th>Estado</th></tr>'+
features().map(x=>{const k=count(x.list);return '<tr><td><a class="link" href="#/caracteristica/'+encodeURIComponent(x.name)+'">'+esc(x.name)+'</a></td><td>'+esc(x.file)+'</td><td>'+k.total+'</td><td>'+k.success+'</td><td>'+(k.failure+k.error)+'</td><td>'+dur(x.list.reduce((a,s)=>a+s.duration,0))+'</td><td>'+bar(k)+'</td><td>'+badge(worst(k))+'</td></tr>'}).join('')+'</table></div>'}

function scenarioTable(list,title){return '<div class="card"><h2>'+esc(title)+'</h2><div class="filters"><input id="q" placeholder="Buscar escenario..."><button data-f="all" class="on">Todos</button>'+ORDER.map(o=>'<button data-f="'+o+'">'+L[o]+'</button>').join('')+'</div>'+
'<table id="st"><thead><tr><th>Escenario</th><th>Característica</th><th>Pasos</th><th>Inicio</th><th>Duración</th><th>Resultado</th></tr></thead><tbody>'+
list.map(s=>'<tr data-o="'+s.outcome+'" data-t="'+esc((s.title+' '+s.feature).toLowerCase())+'"><td>'+icon(s.outcome)+' <a class="link" href="#/escenario/'+s.id+'">'+esc(s.title)+'</a></td><td>'+esc(s.feature)+'</td><td>'+countSteps(s.steps)+'</td><td>'+fmt(s.startTime)+'</td><td>'+dur(s.duration)+'</td><td>'+badge(s.outcome)+'</td></tr>').join('')+'</tbody></table></div>'}
const countSteps=st=>st.reduce((a,s)=>a+1+countSteps(s.children),0);

function featureView(name){const list=D.scenarios.filter(s=>s.feature===name);const k=count(list);
return '<div class="card"><div class="title-row"><h1>'+esc(name)+'</h1>'+badge(worst(k))+'</div><div class="meta">'+esc(list[0]?.file)+' · '+k.total+' escenarios · '+pct(k.success,k.total)+'% exitosos</div><div style="margin-top:12px">'+bar(k)+'</div></div>'+scenarioTable(list,'Escenarios de la característica')}

function stepTree(steps){return '<ul class="steps">'+steps.map(s=>'<li class="'+(s.category==='test.step'||s.category==='hook'?'':'collapsed')+'"><div class="step cat-'+s.category.replace(/[^a-z]/g,'-')+'">'+(s.children.length?'<span class="tg">▾</span>':'<span class="tg"></span>')+icon(s.outcome)+'<span class="t">'+esc(s.title)+'</span><span class="d">'+dur(s.duration)+'</span></div>'+(s.error?'<div class="err">'+esc(s.error)+'</div>':'')+(s.children.length?stepTree(s.children):'')+'</li>').join('')+'</ul>'}

function scenarioView(id){const s=D.scenarios.find(x=>x.id===id);if(!s)return '<div class="card">Escenario no encontrado</div>';
const ev=s.evidence.map(e=>e.type==='image'?'<div><h4>📷 '+esc(e.name)+'</h4><a href="'+e.src+'" target="_blank"><img src="'+e.src+'"></a></div>':e.type==='video'?'<div><h4>🎬 '+esc(e.name)+'</h4><video controls preload="metadata" src="'+e.src+'"></video></div>':e.type==='text'?'<div><h4>📄 '+esc(e.name)+'</h4><pre class="txt">'+esc(e.text)+'</pre></div>':'<div><h4>📎 <a class="link" href="'+e.src+'" download>'+esc(e.name)+'</a></h4></div>').join('');
return '<div class="card"><div class="title-row">'+icon(s.outcome)+'<h1>'+esc(s.title)+'</h1>'+badge(s.outcome)+'</div><div class="meta">Característica: <a class="link" href="#/caracteristica/'+encodeURIComponent(s.feature)+'">'+esc(s.feature)+'</a> · '+esc(s.file)+' · Inicio: '+fmt(s.startTime)+' · Duración: '+dur(s.duration)+(s.retries?' · Reintentos: '+s.retries:'')+'</div>'+
s.annotations.map(a=>'<div class="ann"><b>'+esc(a.type)+':</b> '+esc(a.description)+'</div>').join('')+(s.error?'<h3>Error</h3><div class="err">'+esc(s.error)+'</div>':'')+'</div>'+
'<div class="card"><h2>Narrativa de pasos</h2>'+(s.steps.length?stepTree(s.steps):'<i>Sin pasos registrados</i>')+'</div>'+
(ev?'<div class="card"><h2>Evidencias</h2><div class="evidence">'+ev+'</div></div>':'')}

function route(){const h=decodeURIComponent(location.hash.slice(2));const app=document.getElementById('app');let v='home';
if(h.startsWith('escenario/')){app.innerHTML=scenarioView(h.slice(10));v='scenarios'}
else if(h.startsWith('caracteristica/')){app.innerHTML=featureView(h.slice(15));v='features'}
else if(h==='caracteristicas'){app.innerHTML=featuresView();v='features'}
else if(h==='escenarios'){app.innerHTML=scenarioTable(D.scenarios,'Todos los escenarios');v='scenarios'}
else app.innerHTML=home();
document.querySelectorAll('#nav a').forEach(a=>a.classList.toggle('active',a.dataset.v===v));bind();window.scrollTo(0,0)}

function bind(){document.querySelectorAll('.step .tg').forEach(t=>t.onclick=()=>t.closest('li').classList.toggle('collapsed'));
const q=document.getElementById('q');if(!q)return;let f='all';const apply=()=>document.querySelectorAll('#st tbody tr').forEach(r=>r.style.display=(f==='all'||r.dataset.o===f)&&r.dataset.t.includes(q.value.toLowerCase())?'':'none');
q.oninput=apply;document.querySelectorAll('.filters button').forEach(b=>b.onclick=()=>{f=b.dataset.f;document.querySelectorAll('.filters button').forEach(x=>x.classList.toggle('on',x===b));apply()});
document.querySelectorAll('#st th').forEach((th,i)=>th.onclick=()=>{const tb=th.closest('table').tBodies[0];const rows=[...tb.rows];const dir=th.dataset.d=th.dataset.d==='a'?'d':'a';rows.sort((a,b)=>a.cells[i].innerText.localeCompare(b.cells[i].innerText,'es',{numeric:true})*(dir==='a'?1:-1));rows.forEach(r=>tb.appendChild(r))})}

document.getElementById('h-title').textContent=D.title;
document.getElementById('h-sub').textContent='Ejecutado: '+fmt(D.startTime)+' · '+D.scenarios.length+' escenarios · '+dur(D.duration);
window.addEventListener('hashchange',route);route();
</script>
</body>
</html>`;
}
