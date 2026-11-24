// What the band, `/agentctl` and `/agentctl policy|events` say (requirements FR-2, FR-3, FR-17,
// FR-23; tech spec § 3.3). Pure: every input arrives as data, every line names its source and age,
// and a field whose source did not answer says so instead of showing a value.

import { checkLine } from './firstrun.js'
import { digest } from './fingerprint.js'
import { sanitize } from './sanitize.js'

// The opaque key evidence for a declared check is stored under: arguments never become a stored
// identifier in plaintext.
export function checkKey(argv) {
  return 'check-' + digest(argv.join('\u0000'))
}

// Evidence counts as current only when the check reported no error, the tree did not change during
// the run, the run's reading matches the last one, and no reading was partial.
export function evidenceCurrent(ev, fingerprint) {
  if (!fingerprint || !ev || ev.outcome !== 'ok' || !ev.before || !ev.after) return false
  if (ev.before.value !== ev.after.value || ev.after.value !== fingerprint.value) return false
  return ![ev.coverage, ev.before.coverage, ev.after.coverage, fingerprint.coverage].includes('partial')
}

// Where the task's declared checks stand on the current tree: how many there are, how many have run
// at all, and which are not current (never run, failed, or stale).
export function checkProgress(task, evidence, fingerprint) {
  const rows = (task?.executors ?? []).filter((e) => e.check).map((e) => {
    const ev = evidence?.[checkKey(e.argv)]
    // Never shortened: the line is one Claude runs, and a cut command would not match the check.
    return { argv: sanitize(checkLine(e.argv), Infinity), ran: Boolean(ev), current: evidenceCurrent(ev, fingerprint) }
  })
  return { declared: rows.length, ran: rows.filter((r) => r.ran).length, pending: rows.filter((r) => !r.current).map((r) => r.argv) }
}

// The four states a field can be in (FR-3).
export function field(label, reading, now) {
  if (!reading) return `${label}：取得できません`
  if (reading.failed) return `${label}：利用不可（${reading.failed}）`
  const age = Math.max(0, Math.round((now - reading.at) / 1000))
  const stale = reading.staleAfterMs !== undefined && now - reading.at > reading.staleAfterMs
  return `${label}：${reading.value} — ${reading.source}、${age} 秒前${stale ? '（古い）' : ''}`
}

// review-state.js check --format=json → a gate reading. A gate pass is a gate pass, never a test pass.
export function gateReading(run, at) {
  if (typeof run === 'string') return { failed: run, at }
  if (!run || run.exitCode !== 0) return { failed: `チェックが終了しました（${run ? run.exitCode : '結果なし'}）`, at }
  let s
  try { s = JSON.parse(run.stdout) } catch { return { failed: 'JSON ではありません', at } }
  const word = (p) => (!p ? '?' : p.passed ? '✅' : p.verdict === 'fail' && p.digest_match ? '⛔' : p.noted && !p.digest_match ? '⏳ 古い' : p.owed ? '⏳ 未対応' : '·')
  return { value: `コード ${word(s.code_review)} · ドキュメント ${word(s.doc_review)} · precommit ${word(s.precommit)}`, source: 'review-state.js check', at }
}

// Usage windows are read by kind; a missing window is missing, never 0%. One account's windows are
// shown for this session only and never summed with other sessions.
export function usageReading(usage, kind, at) {
  if (!usage) return null
  const w = (usage.rateLimits ?? []).find((r) => r.kind === kind)
  if (!w) return null
  return { value: `${Math.round(w.percentUsed)}%${w.resetsAt ? `（リセット ${w.resetsAt}）` : ''}`, source: `セッション使用量（${w.source ?? 'ホスト'}）`, at }
}

export function contextReading(usage, at) {
  const p = usage?.context?.percent
  return typeof p === 'number' ? { value: `${Math.round(p)}%`, source: 'セッション使用量', at } : null
}

function evidenceLines(evidence, currentFingerprint, now) {
  const out = []
  for (const ev of Object.values(evidence ?? {})) {
    const fresh = currentFingerprint && ev.after && ev.after.value === currentFingerprint.value && ev.before && ev.before.value === ev.after.value
    const state = ev.outcome === 'backgrounded' ? '開始したが完了は未確認'
      : ev.outcome === 'refused' ? '拒否'
      : !ev.after || !ev.before ? '証拠を取得できません'
      : ev.before.value !== ev.after.value ? '実行中にツリーが変化 — バインドできません'
      : fresh && [ev.coverage, ev.before.coverage, ev.after.coverage, currentFingerprint.coverage].includes('partial') ? '一致するが読み取りが一部のみ'
      : fresh ? '最新'
      : '古い（その後ツリーが変化）'
    const age = Math.max(0, Math.round((now - ev.at) / 1000))
    out.push(`  ${sanitize(ev.requested, 120)}：${ev.outcome === 'ok' ? 'エラー報告なし' : ev.outcome} · ${state} · ${ev.coverage ?? 'カバレッジ不明'} · ${age} 秒前`)
  }
  return out
}

const REASON_LABEL = {
  input: 'あなたの入力待ち',
  permission: '権限の決定待ち',
  'policy-denied': 'タスクのポリシーにより拒否',
  'rate-limit': 'レート制限に到達',
  'suspected-stall': 'アクティビティなし（停止は未確認）',
}

function interventionLines(state, now) {
  return Object.entries(state.interventions ?? {}).map(([reason, v]) => {
    const age = Math.max(0, Math.round((now - v.since) / 1000))
    const detail = typeof v.detail === 'string' ? sanitize(v.detail, 120) : v.detail?.resetsAt ? `リセット ${v.detail.resetsAt}` : ''
    return `  ${REASON_LABEL[reason] ?? reason}${detail ? ` — ${detail}` : ''} · ${age} 秒前から`
  })
}

// Compact by default — it reaches Claude — and the diagnostic lines on `/agentctl status --details`.
// Labels say what they measure (found in a first-run test: "Observation: ok" read as "work passed").
export function statusText(m, { details = false } = {}) {
  const { now, task, state } = m
  const lines = []
  lines.push(task ? `タスク：${sanitize(task.goal, 120)}（${task.id}）` : 'タスク：未バインド')
  const iv = interventionLines(state, now)
  lines.push(iv.length ? '対応が必要：' : '対応が必要なもの：観測されず')
  lines.push(...iv)
  lines.push(field('レビューゲート', m.gate, now))
  const ev = evidenceLines(m.evidence, m.fingerprint, now)
  lines.push(ev.length ? '実行証拠（レビュー判定ではありません）：' : '実行証拠：宣言されたチェックは未実行')
  lines.push(...ev)
  const bg = Object.entries(state.background ?? {}).filter(([, b]) => b.status === 'started' || b.status === 'in-flight')
  if (bg.length) lines.push(`実行中のバックグラウンド：${bg.length}（${bg.map(([id]) => id).join('、')}）`)
  if (!details) {
    lines.push('詳細：/agentctl status --details · /agentctl help')
    return lines.join('\n')
  }
  lines.push(`状態ストレージ：${m.health === 'ok' ? '正常' : m.health}`)
  lines.push(`実行状態: ${state.runtime.value}${state.runtime.tool ? ` (${state.runtime.tool})` : ''} から ${Math.max(0, Math.round((now - state.runtime.since) / 1000))} 秒 · フェーズ ${state.phase.value} · 結果 ${state.result.value}`)
  // A usage reading arrives with Claude's first reply in the session; before that it is absent.
  const usage = (label, r) => (r ? field(label, r, now) : `${label}：取得できません（Claude の最初の応答後に読み取ります）`)
  lines.push(usage('コンテキスト', m.context))
  lines.push(usage('5 時間ウィンドウ', m.fiveHour))
  return lines.join('\n')
}

export function bandText(m) {
  const { task, state, now } = m
  const iv = Object.keys(state.interventions ?? {})
  const attention = iv.length ? `⚠ ${iv.map((r) => REASON_LABEL[r] ?? r).join('、')}` : '対応不要'
  const head = task ? `agentctl · ${sanitize(task.goal, 40)}` : 'agentctl · タスクなし'
  const rt = `${state.runtime.value}${state.runtime.tool ? `:${state.runtime.tool}` : ''} ${Math.max(0, Math.round((now - state.runtime.since) / 1000))}秒`
  let gate = 'ゲート情報なし'
  if (m.gate?.failed) gate = 'ゲート利用不可'
  else if (m.gate) {
    const age = Math.max(0, Math.round((now - m.gate.at) / 1000))
    const stale = m.gate.staleAfterMs !== undefined && now - m.gate.at > m.gate.staleAfterMs
    gate = `${m.gate.value}（${age} 秒${stale ? '、古い' : ''}）`
  }
  const resume = m.checkpoint ? ` · 直前の引き継ぎ ${new Date(m.checkpoint.savedAt).toISOString()}` : ''
  const proposal = m.pending ? ` · 草案 ${m.pending.digest.slice(0, 8)} が保留中 — /agentctl accept` : ''
  return `${head} · ${rt} · ${attention} · ${gate}${proposal}${resume}${m.health === 'ok' ? '' : ` · ${m.health}`}`
}

export const LIMITS = [
  'この mod は制御と表示を行うもので、分離境界ではありません。production への読み取り専用制限は認証情報と対象自身の権限で enforce されます。',
  'ホストがこの mod のフックをスキップすると（ワーカー障害、mod 無効化）ここでは何も拒否しません。危険なコマンドは permissions.deny ルールに登録してください。',
  'ネイティブの権限ルールはプログラムではなくコマンドのテキストに一致します。他の mod が tool.check で判定を変更できます。',
  '許可された実行者は、その影響が分類されないまま実行されます。',
]

export function policyText(task) {
  if (!task) return ['タスク未バインド：組み込みの production 書き込み・リモート git 書き込みカテゴリは引き続き拒否されます。それ以外はホスト自身の権限フローに任せます。', ...LIMITS].join('\n')
  const one = (x) => (Array.isArray(x) ? x.join(' ') : Array.isArray(x?.argv) ? x.argv.join(' ') + (x.check ? '（チェック）' : '') : String(x))
  const fmt = (xs) => (xs?.length ? xs.map((x) => sanitize(one(x), 200)).join('； ') : 'なし')
  return [
    `タスク ${task.id} · ポリシーバージョン ${task.policyVersion ?? 1}`,
    ...(task.recordMissing ? ['バインド済みタスクのレコードがありません。ワークツリー内の読み取り以外はすべて拒否されます。タスクを再度設定してください。'] : []),
    `ワークツリー：${sanitize(task.worktree, 200)}`,
    `編集：${(task.allow ?? []).includes('edit') ? `${fmt(task.editRoots ?? ['.'])} で許可` : '許可されていません'}`,
    `禁止（タスク）：${fmt(task.forbid)} · および組み込みの production 書き込み・リモート git 書き込みカテゴリ`,
    `許可された実行者：${fmt(task.executors)}`,
    `人の確認が必要：${fmt(task.needsUser)}`,
    `許可されたその他のツール：${fmt(task.tools)}`,
    'それ以外はホスト自身の権限フロー（または自動モード）に任せます。この mod は分類しません。',
    'ベストエフォート：この mod は各ツール呼び出しを読み取りますが、スクリプトの内容やそこから起動するコマンドは読み取りません。',
    ...LIMITS,
  ].join('\n')
}

export function eventsText(decisions, n, now) {
  const list = (decisions ?? []).slice(-n)
  if (!list.length) return 'このセッションでは判定が記録されていません。'
  return list.map((d) => `${Math.max(0, Math.round((now - d.at) / 1000))} 秒前 · ${d.outcome} · ${d.tool} · ${sanitize(d.requested, 160)} · ${sanitize(d.rule, 160)}`).join('\n')
}
