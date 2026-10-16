import { useEffect, useState } from 'react'
import { dashboardByTeam, priorities, teamPerformance, teams, type Team } from './demo-data'
import { dataSource, fetchDashboard, fetchOpportunities, type ApiDashboard, type ApiOpportunity } from './api'

type IconName = 'overview' | 'chart' | 'people' | 'layers' | 'quality' | 'report' | 'settings' | 'bell' | 'arrow' | 'chevron' | 'clock' | 'info' | 'search' | 'menu' | 'close' | 'spark' | 'link'

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    chart: <><path d="M4 19V5M4 19h16M8 15l4-4 3 2 5-7"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></>,
    quality: <><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></>,
    report: <><path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM14 3v5h5M8 12h8M8 16h8"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M4.9 4.9 7 7m10 10 2.1 2.1M4 12h3m10 0h3M4.9 19.1 7 17M17 7l2.1-2.1M12 4v3m0 10v3"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8ZM10 20h4"/></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    chevron: <path d="m6 9 6 6 6-6"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
    close: <path d="M5 5l14 14M19 5 5 19"/>,
    spark: <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/>,
    link: <><path d="M10 13a5 5 0 0 0 8 .5l2-2a5 5 0 0 0-7-7l-1.5 1.5M14 11a5 5 0 0 0-8-.5l-2 2a5 5 0 0 0 7 7l1.5-1.5"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const navItems: { icon: IconName; label: string; available: boolean }[] = [
  { icon: 'overview', label: 'Visão geral', available: true },
  { icon: 'chart', label: 'Indicadores', available: false },
  { icon: 'people', label: 'Pessoas', available: false },
  { icon: 'layers', label: 'Produção', available: false },
  { icon: 'report', label: 'Relatórios', available: false },
  { icon: 'quality', label: 'Qualidade dos dados', available: false },
]

function TrendChart({ values }: { values: number[] }) {
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 600},${150 - ((value - 50) / 40) * 150}`).join(' ')
  return <div className="chart-wrap"><div className="chart-grid" aria-hidden="true"><span>90%</span><span>80%</span><span>70%</span><span>60%</span></div><svg viewBox="0 0 600 150" preserveAspectRatio="none" role="img" aria-label={`Acompanhamento em dia: de ${values[0]}% a ${values.at(-1)}% nos últimos 12 meses`}>
    {[0, 1, 2, 3].map(line => <line key={line} x1="0" x2="600" y1={line * 50} y2={line * 50} stroke="#E6EAF0" strokeDasharray="4 5"/>)}
    <polyline points={points} fill="none" stroke="#3C62D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
    <circle cx="600" cy={150 - ((values.at(-1)! - 50) / 40) * 150} r="5" fill="#3C62D9" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
  </svg><div className="chart-months"><span>Out</span><span>Dez</span><span>Fev</span><span>Abr</span><span>Jun</span><span>Set</span></div></div>
}

function App() {
  const [team, setTeam] = useState<Team>('Todas as equipes')
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null)
  const [apiDashboard, setApiDashboard] = useState<ApiDashboard | null>(null)
  const [apiPriorities, setApiPriorities] = useState<ApiOpportunity[] | null>(null)
  const [dataState, setDataState] = useState<'loading' | 'api' | 'snapshot' | 'fallback'>('loading')
  const dashboard = apiDashboard ? {
    metrics: [
      { label: 'Pessoas vinculadas', value: apiDashboard.metrics.people_followed.toLocaleString('pt-BR'), change: '', direction: 'neutral' as const, detail: 'registros sintéticos' },
      { label: 'Acompanhamento em dia', value: `${apiDashboard.metrics.follow_up_rate.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%`, change: `${apiDashboard.metrics.follow_up_change >= 0 ? '+' : ''}${apiDashboard.metrics.follow_up_change.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} p.p.`, direction: 'neutral' as const, detail: 'entre os dois últimos períodos' },
      { label: 'Oportunidades de cuidado', value: apiDashboard.metrics.care_opportunities.toLocaleString('pt-BR'), change: '', direction: 'neutral' as const, detail: 'sinais ilustrativos' },
      { label: 'Qualidade dos dados', value: `${apiDashboard.metrics.data_quality.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}%`, change: '', direction: 'neutral' as const, detail: 'campos essenciais completos' },
    ],
    trend: apiDashboard.metrics.trend,
    pending: apiDashboard.metrics.care_opportunities,
  } : dashboardByTeam[team]
  const activePriorities = apiPriorities || priorities.map(item => ({ ...item, count: Math.round(item.count * dashboard.pending / 1284), reason: item.note, id: item.title }))
  const matches = activePriorities.filter(item => `${item.title} ${item.group}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))

  useEffect(() => {
    const controller = new AbortController()
    setApiDashboard(null)
    setApiPriorities(null)
    setDataState('loading')
    Promise.all([fetchDashboard(team, controller.signal), fetchOpportunities(team, controller.signal)])
      .then(([summary, opportunityList]) => {
        setApiDashboard(summary)
        setApiPriorities(opportunityList)
        setDataState(dataSource)
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setApiDashboard(null)
        setApiPriorities(null)
        setDataState('fallback')
      })
    return () => controller.abort()
  }, [team])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) } if (event.key === 'Escape') setSearchOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`} aria-label="Navegação principal">
      <div className="brand"><img src={`${import.meta.env.BASE_URL}${sidebarCollapsed ? 'brand-mark.svg' : 'logo-sidebar.svg'}`} alt="DataAPS — inteligência para a Atenção Primária" /></div>
      <nav className="primary-nav" aria-label="Áreas do produto">{navItems.map(item => <button key={item.label} className={`nav-item ${item.available ? 'active' : ''}`} disabled={!item.available} title={item.available ? item.label : `${item.label}: próxima etapa`} onClick={() => setMenuOpen(false)}><Icon name={item.icon} size={19}/><span>{item.label}</span>{!item.available && <small>Em breve</small>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-divider"/><button className="nav-item" disabled title="Integrações: próxima etapa"><Icon name="link" size={19}/><span>Integrações</span><small>Em breve</small></button><button className="nav-item" disabled title="Configurações: próxima etapa"><Icon name="settings" size={19}/><span>Configurações</span><small>Em breve</small></button><div className="sidebar-manifesto"><span>Ambiente de demonstração</span><p>Dados sintéticos</p></div><div className="municipality"><span className="municipality-avatar">M</span><span><strong>Município demonstração</strong><small>Ambiente de exemplo</small></span></div></div>
    </aside>
    {menuOpen && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}/>}

    <main className="main-content">
      <header className="topbar"><button className="sidebar-toggle icon-button" aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} onClick={() => setSidebarCollapsed(!sidebarCollapsed)}><Icon name="menu"/></button><button className="mobile-menu icon-button" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'}/></button><button className="search-trigger" onClick={() => setSearchOpen(true)}><Icon name="search" size={20}/><span>Buscar nesta demonstração...</span><kbd>Ctrl + K</kbd></button><div className="topbar-user"><span className="demo-pill">DEMONSTRAÇÃO</span><span className="user-avatar">DA</span><span className="user-label"><strong>DataAPS</strong><small>Protótipo público</small></span></div></header>

      <div className="page-content"><section className="hero"><div className="hero-copy"><span className="eyebrow"><Icon name="spark" size={15}/> VISÃO GERAL DA APS</span><h1>Panorama do território</h1><p>Painel para gestores e equipes da Atenção Primária acompanharem cobertura e qualidade dos registros e identificarem pontos que precisam de análise.</p></div><div className="hero-meta"><span>Competência ilustrativa</span><strong>Setembro de 2026</strong><small>Somente dados sintéticos</small></div></section>

      <div className="demo-notice"><Icon name="info" size={18}/><span><strong>{dataState === 'api' ? 'API local conectada ao snapshot sintético.' : dataState === 'snapshot' ? 'Demonstração pública com dados sintéticos.' : dataState === 'loading' ? 'Carregando dados sintéticos...' : 'Snapshot indisponível; usando exemplos locais.'}</strong> Nenhum dado do e-SUS, de pacientes ou de outro sistema está conectado.</span></div>

      <div className="context-row"><div><span className="section-kicker">RESUMO EXECUTIVO</span><h2>Indicadores e pendências</h2><p>Selecione o recorte para entender onde concentrar a próxima análise.</p></div><div className="filters"><label className="filter-select"><span>Equipe</span><select value={team} onChange={event => setTeam(event.target.value as Team)}>{teams.map(name => <option key={name}>{name}</option>)}</select><Icon name="chevron" size={15}/></label><span className="period-chip"><Icon name="clock" size={15}/> Setembro de 2026</span></div></div>

      <section className="signal-strip" aria-label="Totais do período"><div className="signal-main"><span>Pessoas acompanhadas</span><strong>{dashboard.metrics[0].value}</strong><small>base sintética do território</small></div><div className="signal-item"><span>Equipes demonstrativas</span><strong>{apiDashboard?.metrics.units_and_teams ?? 3}</strong><small>no recorte selecionado</small></div><div className="signal-item warning-signal"><span>Inconsistências de cadastro</span><strong>{(apiDashboard?.metrics.data_inconsistencies ?? 112).toLocaleString('pt-BR')}</strong><small>registros para validar</small></div><div className="signal-item"><span>Oportunidades de cuidado</span><strong>{dashboard.pending.toLocaleString('pt-BR')}</strong><small>situações para revisar</small></div></section>

      <div className="primary-grid"><section className="panel attention-panel" id="prioridades" aria-labelledby="attention-title"><div className="panel-head"><div><span className="section-kicker">PRIORIDADES</span><h3 id="attention-title">Onde agir primeiro</h3><p>Sinais que pedem análise, não conclusões automáticas.</p></div><span className="panel-count">{activePriorities.length} grupos ilustrativos</span></div><div className="priority-list">{activePriorities.map((item,index) => <div className="priority-block" key={item.id}><button className="priority-row" aria-expanded={selectedPriority === item.title} onClick={() => setSelectedPriority(selectedPriority === item.title ? null : item.title)}><span className="priority-rank">0{index+1}</span><span className="priority-copy"><strong>{item.title}</strong><small>{item.group}</small></span><span className="priority-count">{item.count.toLocaleString('pt-BR')}</span><Icon name="arrow" size={17}/></button>{selectedPriority === item.title && <div className="priority-detail"><strong>Por que aparece aqui?</strong><p>{item.reason}. Este é um exemplo sintético; a versão real mostrará regra, evidência e pessoas autorizadas para acompanhamento.</p></div>}</div>)}</div><p className="panel-note">As contagens acima são apenas exemplos e não representam uma lista nominal.</p></section>

      <section className="panel evidence-panel" aria-labelledby="evidence-title"><div className="panel-head"><div><span className="section-kicker">CONFIANÇA</span><h3 id="evidence-title">O que sabemos dos dados</h3><p>Contexto antes de interpretar qualquer resultado.</p></div></div><div className="evidence-line"><span>Fonte</span><strong>Dados sintéticos</strong></div><div className="evidence-line"><span>Integração PEC</span><strong>Não configurada</strong></div><div className="evidence-line"><span>Período exibido</span><strong>Setembro de 2026</strong></div><div className="evidence-line"><span>Regra de indicador</span><strong>Ilustrativa</strong></div><div className="evidence-explain"><Icon name="info" size={18}/><p>Na versão conectada, cada resultado terá fonte, versão da regra, última carga e composição verificável.</p></div></section></div>

      <div className="secondary-grid"><section className="panel trend-panel" aria-labelledby="trend-title"><div className="panel-head"><div><span className="section-kicker">EVOLUÇÃO</span><h3 id="trend-title">Acompanhamento ao longo do tempo</h3><p>Uma tendência para investigar, não apenas um número isolado.</p></div><span className="soft-chip">12 meses</span></div><div className="trend-line"><strong>{dashboard.metrics[1].value}</strong><span>{dashboard.metrics[1].change} na competência</span></div><TrendChart values={dashboard.trend}/><p className="panel-note">Série demonstrativa. A definição oficial será versionada antes da integração.</p></section>

      <section className="panel teams-panel" aria-labelledby="teams-title"><div className="panel-head"><div><span className="section-kicker">TERRITÓRIO</span><h3 id="teams-title">Diferenças entre equipes</h3><p>Comparar com contexto, sem transformar equipes em ranking de mérito.</p></div></div><div className="team-list">{teamPerformance.map(item => <div className="team-row" key={item.name}><div><strong>{item.name}</strong><span>{item.value.toLocaleString('pt-BR',{minimumFractionDigits:1})}%</span></div><div className="bar-track"><span style={{width:`${item.value}%`}}/></div></div>)}</div><p className="panel-note">Considere perfil populacional, cobertura e qualidade dos registros antes de concluir.</p></section></div>

      <footer className="page-footer"><span>DataAPS Demo · Protótipo público</span><span>Dados sintéticos · Nenhuma integração real</span></footer></div>
    </main>

    {searchOpen && <div className="search-overlay" role="presentation" onMouseDown={event => {if(event.target === event.currentTarget) setSearchOpen(false)}}><div className="search-dialog" role="dialog" aria-modal="true" aria-label="Busca da demonstração"><div className="search-input-row"><Icon name="search" size={21}/><input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar prioridades demonstrativas..."/><button aria-label="Fechar busca" onClick={() => setSearchOpen(false)}><Icon name="close" size={19}/></button></div><div className="search-results"><span>RESULTADOS DEMONSTRATIVOS</span>{matches.length ? matches.map(item => <button key={item.title} onClick={() => {setSelectedPriority(item.title);setSearchOpen(false);document.getElementById('prioridades')?.scrollIntoView({behavior:'smooth'})}}>{item.title}<Icon name="arrow" size={16}/></button>) : <p>Nenhum item demonstrativo encontrado.</p>}</div></div></div>}
  </div>
}

export default App
