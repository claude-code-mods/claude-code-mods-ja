import { childrenOf, currentStage, effectiveStatus, GATE_PARTS, isOpen, isRunLive, slicesWithoutP0, stageMarks, STAGES, tasksOfType, uncoveredCriteria, type GateValue, type SpecState, type StageMark, type Task } from './replay.ts'

export type Tone = 'plain' | 'dim' | 'good' | 'bad' | 'warn' | 'ask'
export type Line = { text: string; tone: Tone }
export type Section = { key: string; title: string; lines: Line[] }
export type Live = { isAsking: boolean; runningAgents: number; now: number }
export type View = { title: string; stepper: string; stageLine: Line; sections: Section[] }

export const TONE_STYLE: Record<Tone, { color?: string; dimColor?: boolean }> = {
  plain: {},
  dim: { dimColor: true },
  good: { color: 'success' },
  bad: { color: 'error' },
  warn: { color: 'warning' },
  ask: { color: 'suggestion' },
}

const STAGE_GLYPH: Record<StageMark, string> = { done: '●', current: '◐', todo: '○' }
const GATE_GLYPH: Record<GateValue, string> = { approved: '✓', skipped: '✓', draft: '◐', pending: '○' }
const ACTIVE_STATUSES = ['building', 'built', 'evaluating', 'in_progress']
const RESULT_LINE: Record<string, { glyph: string; label: string; tone: Tone }> = {
  stalled: { glyph: '⏸', label: 'stalled', tone: 'warn' },
  'blocked-environment': { glyph: '⛔', label: 'blocked-environment', tone: 'bad' },
  'harness-abort': { glyph: '↻', label: 'harness-abort', tone: 'warn' },
  failed: { glyph: '✗', label: 'failed', tone: 'bad' },
}
const SCORE_WIDTH = 7
const UNCOVERED_SHOWN = 3
const WIDE_STEPPER = 44

function line(text: string, tone: Tone = 'plain'): Line {
  return { text, tone }
}

function statusGlyph(status: string): { glyph: string; tone: Tone } {
  if (status === 'passed') return { glyph: '✓', tone: 'good' }
  if (status === 'failed') return { glyph: '✗', tone: 'bad' }
  if (status === 'blocked') return { glyph: '⛔', tone: 'bad' }
  if (ACTIVE_STATUSES.includes(status)) return { glyph: '◐', tone: 'warn' }
  return { glyph: '○', tone: 'dim' }
}

function sliceGlyph(state: SpecState, slice: Task): { glyph: string; tone: Tone } {
  const outcome = RESULT_LINE[state.results.get(slice.id)?.result ?? '']
  return outcome === undefined || effectiveStatus(state, slice.id) === 'passed' ? statusGlyph(effectiveStatus(state, slice.id)) : outcome
}

export function specLabel(name: string): string {
  return /^\d{3}/.exec(name)?.[0] ?? name
}

export function duration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

function clip(text: string, width: number): string {
  return text.length <= width ? text.padEnd(width) : `${text.slice(0, Math.max(0, width - 1))}…`
}

function percent(value: number | undefined): string {
  return value === undefined ? '--' : String(Math.round(value * 100))
}

function byPhaseNumber(a: Task, b: Task): number {
  return a.name.localeCompare(b.name, undefined, { numeric: true })
}

function phases(state: SpecState): Task[] {
  return tasksOfType(state, 'phase').sort(byPhaseNumber)
}

function counted<T>(items: T[], test: (item: T) => boolean): number {
  return items.filter(test).length
}

function stepper(state: SpecState, columns: number): string {
  const marks = stageMarks(state)
  return STAGES.map((stage) => `${STAGE_GLYPH[marks[stage]]} ${stage}`).join(columns >= WIDE_STEPPER ? ' ── ' : ' ')
}

function stageLine(state: SpecState): Line {
  const stage = currentStage(state)
  if (stage === 'Define') return line(GATE_PARTS.map((part) => `${part} ${GATE_GLYPH[state.gates[part]]}`).join('  '), 'dim')
  if (stage === 'Build') {
    const slices = tasksOfType(state, 'slice')
    const passed = counted(slices, (slice) => effectiveStatus(state, slice.id) === 'passed')
    const marks = phases(state).map((phase, index) => `P${index + 1} ${statusGlyph(effectiveStatus(state, phase.id)).glyph}`)
    return line([...marks, `スライス ${passed}/${slices.length}`].join('  '), 'dim')
  }
  if (stage === 'Verify') {
    if (state.verify === undefined) return line('検証記録なし', 'dim')
    const drift = tasksOfType(state, 'drift').some(isOpen) ? '◐' : '✓'
    const constitution = { pass: '✓', fail: '✗', none: '–' }[state.verify.constitution]
    return line(`偏移 ${drift}  憲章 ${constitution}`, 'dim')
  }
  return line(state.archivedAt === undefined ? 'アーカイブ可' : `アーカイブ済み ${state.archivedAt.slice(0, 10)}`, 'dim')
}

export function needsYou(state: SpecState, live: Live): Line[] {
  const items: Line[] = []
  if (live.isAsking) items.push(line('? Claude があなたに質問しています', 'ask'))
  for (const part of GATE_PARTS) if (state.gates[part] === 'draft') items.push(line(`◆ ${part} 承認待ちドラフト`, 'ask'))
  for (const decision of state.decisions.values()) if (!decision.confirmed) items.push(line(`? ${decision.id} ${decision.title ?? ''} — 確認待ち`.trim(), 'ask'))
  for (const question of state.questions.values()) if (!question.resolved) items.push(line(`? ${question.id} ${question.text ?? ''}`.trim(), 'ask'))
  for (const assumption of state.assumptions.values()) {
    if (assumption.observable && assumption.status === 'proposed') items.push(line(`? ${assumption.id} ${assumption.text ?? ''}`.trim(), 'ask'))
  }
  const uncovered = uncoveredCriteria(state)
  if (uncovered.length > 0) {
    const shown = uncovered.slice(0, UNCOVERED_SHOWN).join(', ')
    items.push(line(`✗ ${uncovered.length} 件の受入基準がどのスライスにも含まれません：${shown}${uncovered.length > UNCOVERED_SHOWN ? '、…' : ''}`, 'bad'))
  }
  for (const slice of slicesWithoutP0(state)) items.push(line(`✗ ${slice.name}：P0 シナリオなし`, 'bad'))
  for (const slice of tasksOfType(state, 'slice')) {
    const status = effectiveStatus(state, slice.id)
    const outcome = RESULT_LINE[state.results.get(slice.id)?.result ?? '']
    const iterations = state.results.get(slice.id)?.iterations
    const max = state.run?.maxIterations
    const tries = iterations === undefined ? '' : `  ${iterations}${max === undefined ? '' : `/${max}`} 回目`
    if (status !== 'passed' && outcome !== undefined) items.push(line(`${outcome.glyph} ${slice.name}  ${outcome.label}${tries}`, outcome.tone))
    else if (status === 'failed' || status === 'blocked') items.push(line(`${statusGlyph(status).glyph} ${slice.name}  ${status}`, 'bad'))
    else if (ACTIVE_STATUSES.includes(status) && !isRunLive(state)) items.push(line(`⚠ ${slice.name}  ${status}、実行中のワークフローはありません`, 'warn'))
  }
  for (const drift of tasksOfType(state, 'drift')) if (isOpen(drift)) items.push(line(`⚠ 偏移：${drift.name}`, 'warn'))
  const stage = currentStage(state)
  if (stage === 'Verify' && state.verify === undefined) items.push(line('◆ run /start:validate drift', 'ask'))
  if (stage === 'Ship' && state.archivedAt === undefined) items.push(line('◆ run /start:archive', 'ask'))
  return items
}

function nowSection(state: SpecState, live: Live): Section | undefined {
  const isLive = isRunLive(state) || live.runningAgents > 0
  if (!isLive && currentStage(state) !== 'Build') return undefined
  if (!isLive) return { key: 'now', title: '現在', lines: [line('実行中のワークフローはありません', 'dim')] }
  const lines: Line[] = []
  if (isRunLive(state)) lines.push(line(`/start:implement を実行中 · ${duration(live.now - Date.parse(state.run!.at))}`))
  if (live.runningAgents > 0) lines.push(line(`${live.runningAgents} 体のエージェントが実行中`, 'dim'))
  for (const slice of tasksOfType(state, 'slice')) {
    if (ACTIVE_STATUSES.includes(slice.status)) lines.push(line(`◐ ${slice.name}  ${slice.status}`, 'warn'))
  }
  return { key: 'now', title: '現在', lines }
}

function defineSection(state: SpecState): Section {
  const acs = [...state.requirements.values()].flat().length
  const decisions = [...state.decisions.values()]
  const confirmed = counted(decisions, (decision) => decision.confirmed)
  const lines = [
    line(`FR ${state.requirements.size} · AC ${acs}`),
    line(`ADR ${decisions.length} （${confirmed} 確認済み · ${decisions.length - confirmed} 保留中）`),
  ]
  const slices = tasksOfType(state, 'slice')
  if (slices.some((slice) => slice.covers !== undefined)) lines.push(line(`スライス内の受入基準  ${acs - uncoveredCriteria(state).length}/${acs}`))
  const scenarios = tasksOfType(state, 'scenario')
  if (scenarios.some((scenario) => scenario.priority !== undefined)) {
    lines.push(line(`P0 のないスライス  ${slicesWithoutP0(state).length}/${slices.length}`))
    const byPriority = ['P0', 'P1', 'P2'].map((priority) => `${priority} ${counted(scenarios, (scenario) => scenario.priority === priority)}`)
    lines.push(line(`シナリオ  ${byPriority.join(' · ')}`))
  }
  return { key: 'define', title: '定義', lines }
}

function buildSection(state: SpecState, columns: number): Section {
  const ordered = phases(state)
  const index = Math.max(0, ordered.findIndex((phase) => effectiveStatus(state, phase.id) !== 'passed'))
  const phase = ordered[index]
  const slices = phase === undefined ? tasksOfType(state, 'slice') : childrenOf(state, phase.id).filter((task) => task.type === 'slice')
  const max = state.run?.maxIterations
  const nameWidth = Math.max(8, columns - SCORE_WIDTH - 13)
  const threshold = state.run?.threshold === undefined ? '' : `  threshold ${percent(state.run.threshold)}%`
  const header = line(`${''.padEnd(nameWidth + 3)}${'ビジネス/技術'.padStart(SCORE_WIDTH + 1)}  イテレーション`, 'dim')
  const rows = slices.map((slice) => {
    const result = state.results.get(slice.id)
    const { glyph, tone } = sliceGlyph(state, slice)
    const score = `${percent(result?.business).padStart(3)}/${percent(result?.technical).padStart(3)}`
    const tries = `${result?.iterations ?? '-'}${max === undefined ? '' : `/${max}`}`
    return line(`${glyph} ${clip(slice.name, nameWidth)}  ${score.padStart(SCORE_WIDTH)}  ${tries}`, tone)
  })
  const title = `BUILD${phase === undefined ? '' : ` · P${index + 1}`}${threshold}`
  return { key: 'build', title, lines: rows.length === 0 ? [line('スライスはまだありません', 'dim')] : [header, ...rows] }
}

function verifySection(state: SpecState): Section {
  const drift = tasksOfType(state, 'drift')
  const gaps = tasksOfType(state, 'gap')
  const constitution = state.verify === undefined ? '未確認' : { pass: 'pass', fail: 'fail', none: '憲章なし' }[state.verify.constitution]
  return {
    key: 'verify',
    title: '検証',
    lines: [
      line(`偏移の検出  ${counted(drift, isOpen)} 件未解決 · ${counted(drift, (task) => !isOpen(task))} 件修正済み`),
      line(`既知のギャップ  ${counted(gaps, isOpen)} 件未解決`),
      line(`憲章  ${constitution}`, state.verify?.constitution === 'fail' ? 'bad' : 'plain'),
    ],
  }
}

function openClosed(label: string, tasks: Task[], closedWord = '完了'): Line | undefined {
  if (tasks.length === 0) return undefined
  return line(`${label}  ${counted(tasks, isOpen)} 件未解決 · ${counted(tasks, (task) => !isOpen(task))} ${closedWord}`)
}

function trackerSection(state: SpecState): Section | undefined {
  if (state.tasks.size === 0) return undefined
  const slices = tasksOfType(state, 'slice').map((slice) => effectiveStatus(state, slice.id))
  const scenarios = tasksOfType(state, 'scenario').map((scenario) => scenario.status)
  const lines: Line[] = [line(`フェーズ ${phases(state).length}  スライス ${slices.length}  シナリオ ${scenarios.length}`)]
  if (slices.length > 0) {
    const active = counted(slices, (status) => ACTIVE_STATUSES.includes(status))
    lines.push(line(`スライス     ✓ ${counted(slices, (s) => s === 'passed')}  ◐ ${active}  ✗ ${counted(slices, (s) => s === 'failed' || s === 'blocked')}  ○ ${counted(slices, (s) => s === 'pending')}`))
  }
  if (scenarios.some((status) => status !== 'pending')) {
    lines.push(line(`シナリオ  ✓ ${counted(scenarios, (s) => s === 'passed')}  ✗ ${counted(scenarios, (s) => s === 'failed')}  ○ ${counted(scenarios, (s) => s !== 'passed' && s !== 'failed')}`))
  }
  for (const extra of [openClosed('bugs', tasksOfType(state, 'bug')), openClosed('gaps', tasksOfType(state, 'gap')), openClosed('drift', tasksOfType(state, 'drift'), '修正済み')]) {
    if (extra !== undefined) lines.push(extra)
  }
  return { key: 'tracker', title: 'トラッカー', lines }
}

function ledgerSection(state: SpecState): Section {
  const questions = [...state.questions.values()]
  const assumptions = [...state.assumptions.values()]
  const decisions = [...state.decisions.values()]
  const proposed = counted(assumptions, (assumption) => assumption.status === 'proposed')
  return {
    key: 'ledger',
    title: '台帳',
    lines: [line(`Q ${counted(questions, (question) => !question.resolved)} 件未解決 · A ${assumptions.length}（${proposed} 件保留中） · ADR ${decisions.length}`)],
  }
}

export function view(state: SpecState, live: Live, columns: number): View {
  const needs = needsYou(state, live)
  const stage = currentStage(state)
  const stageSection = stage === 'Define' ? defineSection(state) : stage === 'Build' ? buildSection(state, columns) : stage === 'Verify' ? verifySection(state) : undefined
  const sections = [
    { key: 'needs', title: `要対応 (${needs.length})`, lines: needs.length === 0 ? [line('要対応事項はありません', 'dim')] : needs },
    nowSection(state, live),
    stageSection,
    trackerSection(state),
    ledgerSection(state),
  ].filter((section): section is Section => section !== undefined)
  return { title: `start · ${state.name}`, stepper: stepper(state, columns), stageLine: stageLine(state), sections }
}

export function footerText(state: SpecState, live: Live): string {
  const marks = stageMarks(state)
  const count = needsYou(state, live).length
  const glyphs = STAGES.map((stage) => STAGE_GLYPH[marks[stage]]).join('')
  return `${specLabel(state.name)} ${glyphs}${count > 0 ? ` · ${count} need${count === 1 ? 's' : ''} you` : ''}`
}
