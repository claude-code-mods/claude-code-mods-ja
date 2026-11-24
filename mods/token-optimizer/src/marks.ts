// The five marks, their hover cards and the detail row as plain
// data the drawing layer maps to elements. Pure.
import type { CacheView, Limit, Snapshot } from './contracts.ts'
import type { IconName } from './icons.ts'
import { ago, clock, duration, minutes, gradeOf, relative, renewal, tokens, type FormatOptions } from './format.ts'
import { KEEP_WARM_MARGIN_MS } from './clock.ts'
import { LIMIT_WARN, QUALITY_FLOOR, loseRun, type Action, type Run, type Sentence, type Tone } from './ladder.ts'
import type { BandSize } from './size.ts'

const KEEP_WARM_MARGIN_S = KEEP_WARM_MARGIN_MS / 1000

export type MarkId = 'quality' | 'context' | 'cache' | 'fiveHour' | 'week'
/** 'none' means no data: the drawing layer shows the mark uncoloured. */
export type MarkTone = Tone | 'none'

export type Mark = {
  id: MarkId
  icon: IconName
  /** The figure on the bar, "--" when unavailable. */
  value: string
  label: string
  tone: MarkTone
  /** 0..100 for ring marks (context, cache, limits). */
  ringPercent?: number
  /** The grade letter on the quality mark. */
  badge?: string
  /** Alt text naming the state. */
  alt: string
}

/** A hover card: title, then "What it means:" (`means`) and "What to do:" (`todo`), then action buttons. */
export type Card = { id: MarkId; title: string; means: Run[]; todo: Run[]; actions: Action[] }

export type Fact = { icon: IconName; runs: Run[] }

export type SavingsBlock = {
  state: 'ready' | 'loading' | 'unavailable'
  sessionTokens: number | null
  last30Tokens: number | null
  sessionText: string
  last30Text: string
  /** Raw daily figures, oldest first, today last; empty when unavailable. */
  daily: number[]
  /** Bar heights in percent of the tallest day, at least 8 so a quiet day still shows. */
  bars: number[]
  /** One short reason when unavailable. */
  reason: string | null
}

export type Row = { facts: Fact[]; savings: SavingsBlock }

const clamp = (p: number) => Math.max(0, Math.min(100, Math.round(p)))
const plain = (text: string): Run => ({ text })
const strong = (text: string): Run => ({ text, strong: true })

export function qualityTone(score: number): Tone {
  return score >= 80 ? 'good' : score >= QUALITY_FLOOR ? 'caution' : 'bad'
}
export function fillTone(p: number): Tone {
  return p >= 80 ? 'bad' : p >= 60 ? 'caution' : 'good'
}
export function limitTone(p: number): Tone {
  return p >= LIMIT_WARN ? 'bad' : p >= 75 ? 'caution' : 'good'
}

function estimateNote(c: CacheView): string {
  return c.measured ? '推定値' : '推定値（寿命は未計測）'
}

function cacheMark(c: CacheView): Mark {
  const base = { id: 'cache' as const, label: 'キャッシュ' }
  const est = estimateNote(c)
  switch (c.state) {
    case 'warm':
    case 'warning': {
      const left = c.secondsLeft ?? 0
      const tone: Tone = c.state === 'warm' ? 'good' : 'caution'
      const word = c.state === 'warm' ? '温かい状態' : '失効間近'
      return { ...base, icon: 'hourglass', value: minutes(left), tone, ringPercent: clamp((left / c.lifetime) * 100), alt: `キャッシュ${word}、残り${minutes(left)}、${est}` }
    }
    case 'cold':
      return { ...base, icon: 'cold', value: '冷', tone: 'cold', ringPercent: 0, alt: `キャッシュはコールド、${est}` }
    case 'refreshing':
      return { ...base, icon: 'hourglass', value: minutes(c.lifetime), tone: 'good', ringPercent: 100, alt: '現在のターン中にキャッシュを更新中' }
    case 'warming':
      return {
        ...base,
        icon: 'hourglass',
        value: c.secondsLeft != null ? minutes(c.secondsLeft) : '--',
        tone: 'good',
        ringPercent: c.secondsLeft != null ? clamp((c.secondsLeft / c.lifetime) * 100) : 0,
        alt: 'キャッシュをウォームアップ中',
      }
    default:
      return { ...base, icon: 'hourglass', value: '--', tone: 'none', ringPercent: 0, alt: 'キャッシュの計測は最初の返信後に始まります' }
  }
}

function limitMark(id: 'fiveHour' | 'week', limit: Limit, now: number, opts: FormatOptions): Mark {
  const p = Math.round(limit.percentUsed)
  const name = id === 'fiveHour' ? '5時間' : '週次'
  const when = renewal(limit.resetsAt, now, opts)
  return {
    id,
    icon: 'clock',
    value: `${p}%`,
    label: id === 'fiveHour' ? '5時間' : '週次',
    tone: limitTone(limit.percentUsed),
    ringPercent: clamp(limit.percentUsed),
    alt: `${name}の使用量 ${p}%` + (when ? `、${when}更新` : ''),
  }
}

/** The marks under the sentence, in order. Limit marks are omitted when the limit is null. */
export function marks(s: Snapshot, opts: FormatOptions = {}): Mark[] {
  const q = s.quality
  const quality: Mark = q
    ? {
        id: 'quality',
        icon: q.score < QUALITY_FLOOR ? 'slip' : 'check',
        value: String(Math.round(q.score)),
        badge: gradeOf(q.score),
        label: '品質',
        tone: qualityTone(q.score),
        alt: `品質等級 ${gradeOf(q.score)}、スコア ${Math.round(q.score)}/100`,
      }
    : { id: 'quality', icon: 'check', value: '--', badge: '--', label: '品質', tone: 'none', alt: '品質はまだ計測されていません' }

  const p = s.contextPercent
  const context: Mark =
    p != null
      ? { id: 'context', icon: 'gauge', value: `${Math.round(p)}%`, label: 'コンテキスト', tone: fillTone(p), ringPercent: clamp(p), alt: `コンテキストの使用率 ${Math.round(p)}%` }
      : { id: 'context', icon: 'gauge', value: '--', label: 'コンテキスト', tone: 'none', ringPercent: 0, alt: 'コンテキストの使用率はまだ報告されていません' }

  const out = [quality, context, cacheMark(s.cache)]
  if (s.fiveHour) out.push(limitMark('fiveHour', s.fiveHour, s.now, opts))
  if (s.week) out.push(limitMark('week', s.week, s.now, opts))
  return out
}

function cacheCard(c: CacheView): Card {
  const est = `計測値は${estimateNote(c)}。`
  // Offered only while a press can still run: not in the last seconds before the cache drops.
  const warm: Action[] = c.measured && (c.secondsLeft ?? 0) > KEEP_WARM_MARGIN_S ? [{ id: 'warm', label: '温かく保つ' }] : []
  const stake = c.tokensAtStake
  const left = minutes(c.secondsLeft ?? 0)
  switch (c.state) {
    case 'warm':
      return {
        id: 'cache',
        title: `あと${left}温かく保てます`,
        means: [plain(`メッセージは${stake != null ? `${tokens(stake)}トークン` : 'コンテキスト'}を1/10の価格で再読み込みます。${est}`)],
        todo: [plain(warm.length ? `${left}以内に返信するか、休憩前に「温かく保つ」をクリックしてください。` : `温かく保つには${left}以内に返信してください。`)],
        actions: warm,
      }
    case 'warning':
      return {
        id: 'cache',
        title: c.secondsLeft != null ? `${left}後に失効` : '失効間近',
        means: [
          ...(stake != null ? [plain('その時点で次のメッセージは '), loseRun(stake), plain(`を正価で再読み込みします。${est}`)] : [plain(`その時点で次のメッセージはコンテキスト全体を正価で再読み込みます。${est}`)]),
        ],
        todo: [plain(warm.length ? '今すぐ「温かく保つ」をクリックしてください。' : '今すぐ返信してください。失効後は「先にクリーンアップ」で次の読み込みを安くできます。')],
        actions: warm,
      }
    case 'cold':
      return {
        id: 'cache',
        title: 'コールド',
        means: [
          ...(stake != null ? [plain('次のメッセージは '), loseRun(stake), plain('を正価で再読み込みします。')] : [plain('次のメッセージはコンテキスト全体を正価で再読み込みます。')]),
        ],
        todo: [plain('「先にクリーンアップ」は一度再読み込みして、以降のメッセージを安くします。')],
        actions: [{ id: 'clean-first', label: '先にクリーンアップ' }],
      }
    case 'refreshing':
      return { id: 'cache', title: '更新中', means: [plain('このターンの各リクエストでキャッシュを温かく保っています。')], todo: [plain('操作は不要です。')], actions: [] }
    case 'warming':
      return { id: 'cache', title: '温かく保っています', means: [plain('一行のウォームアップを実行中です。')], todo: [plain('操作は不要です。')], actions: [] }
    default:
      return { id: 'cache', title: '未開始', means: [plain('キャッシュの計測は最初の返信後に始まります。')], todo: [plain('操作は不要です。')], actions: [] }
  }
}

function limitCard(id: 'fiveHour' | 'week', limit: Limit, now: number, opts: FormatOptions): Card {
  const p = Math.round(limit.percentUsed)
  const name = id === 'fiveHour' ? '5時間' : '週次'
  const when = renewal(limit.resetsAt, now, opts)
  const at = limit.resetsAt ? Date.parse(limit.resetsAt) : NaN
  if (!when || !Number.isFinite(at)) {
    return { id, title: `${name}の使用量 ${p}%`, means: [plain('更新時刻は報告されていません。')], todo: [plain('操作は不要です。')], actions: [] }
  }
  return {
    id,
    title: `${when}更新`,
    means: [plain(`${name}の使用量 ${p}%。${when}にリセット（${relative(at, now)}）。`)],
    todo: [plain(p >= LIMIT_WARN ? '「クリーンアップ」でより早くコンテキストを解放できます。' : '操作は不要です。')],
    actions: [],
  }
}

/** Hover card bodies, one per mark, same order and omissions as `marks`. */
export function cards(s: Snapshot, opts: FormatOptions = {}): Card[] {
  const q = s.quality
  const qualityActions: Action[] = [
    { id: 'clean', label: 'クリーンアップ' },
    { id: 'fresh', label: s.freshArmed ? 'もう一度クリックしてクリア' : '最初からやり直す' },
  ]
  const quality: Card = q
    ? {
        id: 'quality',
        title: `品質 ${gradeOf(q.score)} ${Math.round(q.score)}`,
        means: [plain(`Claude の作業コンテキストの整理度，範囲 0 から 100。${q.drag ? ` 最大の足かせ：${q.drag}。` : ' 足かせとなるものはありません。'}`)],
        todo: [plain(q.score < QUALITY_FLOOR ? '「クリーンアップ」は圧縮してあなたの方向性を保ちます。「最初からやり直す」は先にチェックポイントを保存します。' : '操作は不要です。')],
        actions: qualityActions,
      }
    : { id: 'quality', title: '品質 --', means: [plain('スコアは最初のツール呼び出し後に表示されます。')], todo: [plain('操作は不要です。')], actions: qualityActions }

  // With a smaller auto-compact ceiling the ring measures distance to compaction, while
  // quality follows the model window, so the card names both and makes no quality claim.
  const model = s.contextModelWindow
  const context: Card =
    s.contextTokens != null && s.contextWindow != null
      ? model != null && model > s.contextWindow
        ? {
            id: 'context',
            title: `自動圧縮前 ${tokens(s.contextTokens)} / ${tokens(s.contextWindow)}`,
            means: [plain(`${tokens(model)}のモデルウィンドウの${Math.round((s.contextTokens / model) * 100)}%を使用中。`)],
            todo: [plain('ほぼ満杯になると自動圧縮で詳細が失われる可能性があります。「クリーンアップ」ならより早く圧縮し、あなたの方向性を保ちます。')],
            actions: [],
          }
        : {
            id: 'context',
            title: `${tokens(s.contextTokens)} / ${tokens(s.contextWindow)} token`,
            means: [plain('使用率が半分未満だと最適です。')],
            todo: [plain('80%を超えたら「クリーンアップ」で圧縮し、あなたの方向性を保ちましょう。')],
            actions: [],
          }
      : { id: 'context', title: 'コンテキスト --', means: [plain('使用量は最初の返信後に表示されます。')], todo: [plain('操作は不要です。')], actions: [] }

  const out = [quality, context, cacheCard(s.cache)]
  if (s.fiveHour) out.push(limitCard('fiveHour', s.fiveHour, s.now, opts))
  if (s.week) out.push(limitCard('week', s.week, s.now, opts))
  return out
}

export type SavingsPill = { text: string; url: string | null }

/**
 * Sentence plus savings text that must fit beside "Token Optimizer" on the
 * title row; past this the pill drops to `display.short`.
 */
const PILL_FIT_CELLS = 100

/**
 * The green savings chip on the title row. It only joins a calm line: a good
 * tone with no action button always wins, and without `savings_headline`
 * (older installs, nothing worth a number) there is no pill at all.
 */
export function savingsPill(s: Snapshot, say: Sentence, size: BandSize): SavingsPill | null {
  if (say.tone !== 'good' || say.action !== null) return null
  const display = s.savingsHeadline?.display
  if (!display) return null
  const sentenceCells = say.runs.reduce((n, r) => n + r.text.length, 0)
  const long = display.long !== '' && sentenceCells + display.long.length <= PILL_FIT_CELLS ? display.long : ''
  const text = size === 'full' ? long || display.short || display.long : display.short || display.long
  return text === '' ? null : { text, url: display.url }
}

function savingsBlock(s: Snapshot): SavingsBlock {
  const sv = s.savings
  if (!sv) {
    return {
      state: s.savingsLoading ? 'loading' : 'unavailable',
      sessionTokens: null,
      last30Tokens: null,
      sessionText: '--',
      last30Text: '--',
      daily: [],
      bars: [],
      reason: s.savingsLoading ? null : 'Token Optimizer が計測すると節約量が表示されます。',
    }
  }
  const top = Math.max(1, ...sv.daily)
  return {
    state: s.savingsLoading ? 'loading' : 'ready',
    sessionTokens: sv.sessionTokens,
    last30Tokens: sv.last30Tokens,
    sessionText: sv.sessionTokens != null ? tokens(sv.sessionTokens) : '--',
    last30Text: sv.last30Tokens != null ? tokens(sv.last30Tokens) : '--',
    daily: sv.daily,
    bars: sv.daily.map((v) => Math.max(8, Math.round((Math.max(0, v) / top) * 100))),
    reason: null,
  }
}

/**
 * The detail row under Clawd: only what the bar does not show.
 * `s.now` is epoch milliseconds; the quality cache's epochs are seconds.
 */
/** Longer branch names are cut so the unfolded row stays on one line. */
const BRANCH_MAX = 20

export function row(s: Snapshot, _opts: FormatOptions = {}): Row {
  const q = s.quality
  const facts: Fact[] = []
  // One line in the band: every fact in its shortest plain form.
  if (s.branch) facts.push({ icon: 'branch', runs: [strong(s.branch.length > BRANCH_MAX ? `${s.branch.slice(0, BRANCH_MAX - 1)}…` : s.branch)] })
  // The band's own sightings fill in until Token Optimizer's quality file exists (a new session).
  const startS = q?.sessionStartEpoch ?? (s.startedAtMs != null ? s.startedAtMs / 1000 : null)
  if (startS != null) facts.push({ icon: 'clock', runs: [strong(duration(s.now / 1000 - startS))] })
  const tools = Math.max(q?.toolCalls ?? 0, s.toolCallsSeen ?? 0)
  if (q?.toolCalls != null || (s.toolCallsSeen ?? 0) > 0) facts.push({ icon: 'tool', runs: [strong(String(tools)), plain(tools === 1 ? '回のツール呼び出し' : '回のツール呼び出し')] })
  const compacted = Math.max(q?.compactions ?? 0, s.compactionsSeen ?? 0)
  if (compacted > 0) facts.push({ icon: 'compact', runs: [strong(`${compacted}×`), plain('回圧縮済み')] })
  facts.push({
    icon: 'bookmark',
    runs: (s.checkpointEpoch ?? q?.checkpointEpoch) != null
      ? [plain('チェックポイント '), strong(ago((s.checkpointEpoch ?? q!.checkpointEpoch!) * 1000, s.now))]
      : s.earlierCheckpoint
        ? [plain('より古いチェックポイント '), strong(ago(s.earlierCheckpoint.epoch * 1000, s.now))]
        : [plain('チェックポイントなし')],
  })
  return { facts, savings: savingsBlock(s) }
}
