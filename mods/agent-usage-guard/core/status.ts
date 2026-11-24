// What the user sees without asking: one status line while something needs
// attention, and the `/agent-guard` command's text.

import { highestLimit } from './agents.ts'
import type { Config } from './config.ts'
import { MAIN, type PeerRecord, type Scope, type SessionState, countOnMachine, runningAgents } from './state.ts'
import { count, duration, shortClock, tokens, windowName } from './text.ts'

/** The line under the prompt, or undefined when there is nothing to say. */
export function statusLine(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number): string | undefined {
  if (!config.enabled) return undefined
  const parts = liftedOrPaused(state, now)
  const limit = highestLimit(state, peers, now)
  if (limit && limit.percent >= config.limitDenyPercent) {
    parts.push(`${windowName(limit.kind)} ウィンドウ ${limit.percent}%：新規エージェント起動を拒否`)
  } else if (limit && limit.percent >= config.limitAskPercent) {
    parts.push(`${windowName(limit.kind)} ウィンドウ ${limit.percent}%：新規エージェント起動に承認が必要`)
  }
  const context = state.loops[MAIN]?.context
  if (context !== undefined && context >= config.contextHard) {
    parts.push(`コンテキスト ${tokens(context)}：/compact の実行を推奨`)
  } else if (context !== undefined && context >= config.contextWarn) {
    parts.push(`コンテキスト ${tokens(context)}`)
  }
  return parts.length > 0 ? parts.join(' · ') : undefined
}

/** Which questions are open now, for the band. */
export type Asking = { agents: boolean; context: boolean }

/**
 * The band above the prompt: the guard's own state while it has something to
 * say, the agents on this machine against their limits first. `alert` when a
 * limit is reached or the guard is holding something.
 */
export function bandLine(
  state: SessionState,
  peers: readonly PeerRecord[],
  config: Config,
  now: number,
  asking: Asking,
): { text: string; alert: boolean } | undefined {
  if (!config.enabled) return undefined
  const window = config.windowMs
  const running = runningAgents(state) + peers.reduce((sum, p) => sum + p.running, 0)
  const starts = countOnMachine(state, peers, 'starts', now, window)
  const declined = state.refusals.agents !== undefined && now < state.refusals.agents ? state.refusals.agents : undefined
  const paused = state.fuseUntil !== undefined && now < state.fuseUntil ? state.fuseUntil : undefined
  const refusal = state.denials.filter((d) => now - d.at < window).at(-1)

  const parts: string[] = []
  if (running > 0 || starts > 0) parts.push(`${running}/${config.agentMax} エージェント実行中`)
  if (starts > 0) parts.push(`直近 ${duration(window)} で ${starts}/${config.rollingMax} 起動済み`)
  if (asking.agents) parts.push('エージェント起動の確認中')
  if (asking.context) parts.push('コンテキストサイズの確認中')
  if (declined !== undefined) parts.push(`新規エージェントを ${shortClock(declined)} まで拒否`)
  if (paused !== undefined) parts.push(`エージェント起動を ${shortClock(paused)} まで一時停止`)
  if (refusal) parts.push(`前回の拒否 ${shortClock(refusal.at)}：${refusal.rule}`)
  if (parts.length === 0) return undefined

  const holding = asking.agents || asking.context || declined !== undefined || paused !== undefined || refusal !== undefined
  const full = running >= config.agentMax || starts >= config.rollingMax
  return { text: `使用量ガード · ${parts.join(' · ')}`, alert: holding || full }
}

/** When the band changes with no event to redraw it: a start, a refusal, a decline or the pause ages out. */
export function bandExpiry(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number): number | undefined {
  if (!config.enabled) return undefined
  const window = config.windowMs
  const aging = [...state.starts, ...peers.flatMap((p) => p.starts), ...state.denials.map((d) => d.at)].map((t) => t + window)
  const later = [...aging, state.refusals.agents, state.fuseUntil].filter((t): t is number => t !== undefined && t > now)
  return later.length > 0 ? Math.min(...later) : undefined
}

/** When the line changes with no event to redraw it: an allow or the fuse ends, or the most-used plan window resets. */
export function statusLineExpiry(state: SessionState, peers: readonly PeerRecord[], config: Config, now: number): number | undefined {
  if (!config.enabled) return undefined
  const times = [state.override?.until, state.fuseUntil, highestLimit(state, peers, now)?.resetsAt]
  const later = times.filter((t): t is number => t !== undefined && t > now)
  return later.length > 0 ? Math.min(...later) : undefined
}

/** What is lifted or paused now, worded alike in the status line and the report. */
function liftedOrPaused(state: SessionState, now: number): string[] {
  const parts: string[] = []
  if (state.override && now < state.override.until) {
    parts.push(`${scopeName(state.override.scope)}を解除、${shortClock(state.override.until)}まで`)
  }
  if (state.fuseUntil !== undefined && now < state.fuseUntil) {
    parts.push(`エージェント起動を ${shortClock(state.fuseUntil)} まで一時停止`)
  }
  return parts
}

export function scopeName(scope: Scope): string {
  if (scope === 'agents') return 'エージェント制限'
  if (scope === 'context') return 'コンテキスト制限'
  return '全制限'
}

/** The text `/agent-guard` and `/agent-guard status` print. */
export function statusReport(
  state: SessionState,
  peers: readonly PeerRecord[],
  config: Config,
  now: number,
  problems: readonly string[],
  version?: string,
  storeFailure?: string,
): string {
  const running = version ? ` (${version})` : ''
  if (!config.enabled) return `オフ${running}：AGENT_GUARD はオフです。`
  const window = config.windowMs
  const lines = [`オン${running}。`]

  const peerRunning = peers.reduce((sum, p) => sum + p.running, 0)
  const starts = countOnMachine(state, peers, 'starts', now, window)
  lines.push(
    `エージェント：本セッション ${runningAgents(state)} 実行中、他 ${peers.length} セッションに ${peerRunning}（上限 ${config.agentMax}）。直近 ${duration(window)} で ${starts} 起動（上限 ${config.rollingMax}）。`,
  )

  const limits = Object.values(state.limits).filter((r) => r.resetsAt === undefined || r.resetsAt > now)
  if (limits.length > 0) {
    const text = limits
      .map((r) => `${windowName(r.kind)} ${r.percent}%${r.resetsAt === undefined ? '' : `（${shortClock(r.resetsAt)} にリセット）`}`)
      .join(', ')
    lines.push(`プランウィンドウ：${text}。${config.limitAskPercent}% で新規エージェント起動に承認が必要、${config.limitDenyPercent}% で拒否。`)
  } else {
    lines.push('プランウィンドウ：まだ読み取りなし（サブスクリプションでは次の応答後に読み取ります）。')
  }

  const context = state.loops[MAIN]?.context
  lines.push(
    `コンテキスト：${context === undefined ? '次の応答まで不明' : `${tokens(context)} tokens`}（${tokens(config.contextWarn)} で警告、${tokens(config.contextHard)} でヒント送信前に承認）。`,
  )

  const held = liftedOrPaused(state, now)
  for (const [key, until] of Object.entries(state.leases)) {
    if (now < until) held.push(`${key} 承認済み${until < Number.MAX_SAFE_INTEGER ? `、${shortClock(until)}まで` : '、コンテキスト縮小まで'}`)
  }
  for (const [key, until] of Object.entries(state.refusals)) if (now < until) held.push(`${key} 拒否、${shortClock(until)}まで`)
  if (held.length > 0) lines.push(`現在：${held.join('、')}。`)
  for (const problem of problems) lines.push(`設定：${problem}。`)
  if (storeFailure !== undefined) {
    lines.push(`ストレージ：ガードがカウントを保存できません（${storeFailure}）。このマシンの他のセッションは、このセッションのエージェントをカウントしません。ログも欠落する可能性があります。`)
  }
  lines.push('', USAGE)
  return lines.join('\n')
}

export const USAGE = [
  'コマンド：',
  '  /agent-guard allow [agents|context] [minutes]   本セッションでガード制限を解除（既定：すべて、10 分）',
  '  /agent-guard pause [minutes]                    allow と同じですが、すべての制限を解除',
  '  /agent-guard resume                             allow/pause を早期終了し、拒否済みの質問をクリア',
  '  /agent-guard report [days]                      このマシンでのガード操作を表示（既定 7 日）',
  '  /agent-guard simulate <rule>                    ルールの効果を表示します。操作をブロックせず、使用量も消費しません',
  '  /agent-guard status                             この概要を表示します',
].join('\n')
