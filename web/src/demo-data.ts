export type Team = 'Todas as equipes' | 'Equipe Centro' | 'Equipe Norte' | 'Equipe Sul'

export type Metric = {
  label: string
  value: string
  change: string
  direction: 'up' | 'down' | 'neutral'
  detail: string
}

export const teams: Team[] = ['Todas as equipes', 'Equipe Centro', 'Equipe Norte', 'Equipe Sul']

export const dashboardByTeam: Record<Team, { metrics: Metric[]; trend: number[]; pending: number }> = {
  'Todas as equipes': {
    metrics: [
      { label: 'Pessoas vinculadas', value: '24.680', change: '+2,4%', direction: 'up', detail: 'em relação à competência anterior' },
      { label: 'Acompanhamento em dia', value: '78,6%', change: '+3,1 p.p.', direction: 'up', detail: 'da população elegível' },
      { label: 'Oportunidades de cuidado', value: '1.284', change: '−8,2%', direction: 'down', detail: 'pendências identificadas' },
      { label: 'Qualidade dos dados', value: '92,3%', change: '+1,8 p.p.', direction: 'up', detail: 'campos essenciais completos' },
    ],
    trend: [61, 64, 63, 67, 69, 68, 73, 74, 72, 76, 77, 79],
    pending: 1284,
  },
  'Equipe Centro': {
    metrics: [
      { label: 'Pessoas vinculadas', value: '8.240', change: '+1,7%', direction: 'up', detail: 'em relação à competência anterior' },
      { label: 'Acompanhamento em dia', value: '82,1%', change: '+2,4 p.p.', direction: 'up', detail: 'da população elegível' },
      { label: 'Oportunidades de cuidado', value: '382', change: '−6,4%', direction: 'down', detail: 'pendências identificadas' },
      { label: 'Qualidade dos dados', value: '94,2%', change: '+1,2 p.p.', direction: 'up', detail: 'campos essenciais completos' },
    ],
    trend: [66, 67, 69, 71, 70, 74, 75, 77, 76, 79, 80, 82],
    pending: 382,
  },
  'Equipe Norte': {
    metrics: [
      { label: 'Pessoas vinculadas', value: '7.950', change: '+3,2%', direction: 'up', detail: 'em relação à competência anterior' },
      { label: 'Acompanhamento em dia', value: '75,4%', change: '+2,9 p.p.', direction: 'up', detail: 'da população elegível' },
      { label: 'Oportunidades de cuidado', value: '486', change: '−4,1%', direction: 'down', detail: 'pendências identificadas' },
      { label: 'Qualidade dos dados', value: '89,8%', change: '+2,1 p.p.', direction: 'up', detail: 'campos essenciais completos' },
    ],
    trend: [58, 60, 61, 63, 64, 65, 67, 70, 69, 72, 73, 75],
    pending: 486,
  },
  'Equipe Sul': {
    metrics: [
      { label: 'Pessoas vinculadas', value: '8.490', change: '+2,3%', direction: 'up', detail: 'em relação à competência anterior' },
      { label: 'Acompanhamento em dia', value: '77,8%', change: '+3,9 p.p.', direction: 'up', detail: 'da população elegível' },
      { label: 'Oportunidades de cuidado', value: '416', change: '−11,5%', direction: 'down', detail: 'pendências identificadas' },
      { label: 'Qualidade dos dados', value: '93,0%', change: '+1,9 p.p.', direction: 'up', detail: 'campos essenciais completos' },
    ],
    trend: [59, 62, 60, 64, 66, 65, 70, 71, 72, 73, 76, 78],
    pending: 416,
  },
}

export const priorities = [
  { title: 'Pré-natal sem consulta recente', group: 'Saúde da mulher', count: 148, note: 'Acompanhamento prioritário' },
  { title: 'Vacinação com registro pendente', group: 'Imunização', count: 326, note: 'Revisar esquema e registro' },
  { title: 'Cadastro com inconsistências', group: 'Qualidade dos dados', count: 214, note: 'Validar identificação e vínculo' },
]

export const teamPerformance = [
  { name: 'Equipe Norte', value: 79.0 },
  { name: 'Equipe Centro', value: 78.0 },
  { name: 'Equipe Sul', value: 77.0 },
]
