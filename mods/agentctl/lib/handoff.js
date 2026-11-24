// Model-free hand-over (requirements FR-15, UC-6; tech spec § 3.4). Pure: built only from records.
// It answers the eight questions and keeps three sources apart: what the user confirmed (the task),
// what tools observed (operations, evidence), and what Claude only claimed (never stored as a fact,
// so the hand-over says plainly that nothing claimed is shown as verified).

import { CAPS, sanitize } from './sanitize.js'
import { HARD_FORBIDDEN } from './policy.js'
import { evidenceCurrent } from './view.js'

const s = (x, n = 200) => sanitize(x, n)

// Each section is { heading, items, fixed }: headings and `fixed` lines always appear; `items` fill the
// remaining budget in order and the rest is counted, so the size cap never drops a heading or the
// limits disclosure (INV-005) the way truncating the finished text would.
function assemble(head, sections, cap) {
  const fixedText = [...head, ...sections.flatMap((x) => ['', x.heading, ...x.fixed])].join('\n')
  const omitLine = (n) => `- … 残り ${n} 件を省略（引き継ぎのサイズ上限）`
  let budget = cap - fixedText.length - sections.length * omitLine(99999).length
  const out = [...head]
  for (const x of sections) {
    out.push('', x.heading)
    let shown = 0
    for (const it of x.items) {
      if (it.length + 1 > budget) break
      out.push(it); budget -= it.length + 1; shown++
    }
    if (shown < x.items.length) out.push(omitLine(x.items.length - shown))
    out.push(...x.fixed)
  }
  return out.join('\n')
}

export function handoff({ task, state, evidence, fingerprint, decisions, now, sessionId }) {
  // When the last tree reading was taken: the hand-over starts no process, so it never re-reads.
  const seenAt = typeof fingerprint?.at === 'number' ? `（${new Date(fingerprint.at).toISOString()} 時点）` : ''
  const head = [
    `# 引き継ぎ — ${task ? s(task.goal, 120) : 'タスク未バインド'}`,
    '',
    `${new Date(now).toISOString()} に構造化レコードから生成（セッション ${s(sessionId, 60)}）。モデルは呼び出していません。`,
  ]
  const sec = []
  sec.push({ heading: '## 1. 目標', items: [], fixed: [task ? s(task.goal, 500) : 'このセッションではタスクが宣言されていません。'] })
  const scope = []
  if (task) {
    scope.push(`- ワークツリー：${s(task.worktree)}`)
    scope.push(`- 編集：${(task.allow ?? []).includes('edit') ? `${(task.editRoots ?? ['.']).map((r) => s(r)).join('、')} で許可` : '許可されていません'}`)
    scope.push(`- 許可された実行者：${(task.executors ?? []).map((e) => s(e.argv.join(' '))).join('； ') || 'なし'}`)
    scope.push(`- 禁止：${(task.forbid ?? []).map((f) => s(Array.isArray(f) ? f.join(' ') : f)).join('； ') || 'なし'}、および ${[...new Set(HARD_FORBIDDEN.map((h) => h.rule))].join('、')}`)
    if (task.acceptance?.length) scope.push(`- 受け入れ条件：${task.acceptance.map((a) => s(a)).join('； ')}`)
  }
  sec.push({ heading: '## 2. 許可・禁止の範囲', items: scope, fixed: task ? [] : ['- 範囲は宣言されていません。'] })
  const ops = Object.entries(state.ops ?? {})
  const edits = ops.filter(([, o]) => ['Write', 'Edit', 'NotebookEdit', 'MultiEdit'].includes(o.tool) && o.outcome === 'ok')
  sec.push({ heading: '## 3. 変更内容', items: [], fixed: [
    fingerprint ? `- ツリー：HEAD ${s(fingerprint.head, 60)}、変更または未追跡のパス ${fingerprint.changedCount ?? '?'} 件（${fingerprint.coverage}）${seenAt ? `、読み取り${seenAt}` : ''}` : '- ツリー：この引き継ぎでは読み取っていません',
    // Only the edit tools are counted here; a file changed through Bash shows in the tree line above
    // (found in an uncoached run: "Edits observed: 0" beside a changed README read as "nothing changed").
    `- このセッションの編集ツール呼び出し：${edits.length} 回（Bash 経由の変更はここに数えません。ツリーの行が記録です）`,
  ] })
  const ev = Object.values(evidence ?? {})
  const matches = (e) => fingerprint && e.after && e.before && e.before.value === e.after.value && e.after.value === fingerprint.value && e.outcome === 'ok'
  // Partial coverage is never "verified": what a reading did not cover may have changed — the
  // before, the after and the last reading must each be complete. The same rule `/agentctl` uses.
  const current = (e) => evidenceCurrent(e, fingerprint)
  const verified = ev.filter(current).map((e) => `- ${s(e.requested)} — エラー報告なし、直近のツリー読み取りと一致${seenAt}（${e.coverage}）`)
  sec.push({ heading: '## 4. 検証済み（直近のツリー読み取りによる実行証拠）', items: verified, fixed: verified.length ? [] : ['- なし。'] })
  const notVerified = ev.filter((e) => !current(e)).map((e) => {
    const why = e.outcome === 'backgrounded' ? '開始したが完了は未確認' : e.outcome !== 'ok' ? `結果 ${e.outcome}` : !e.after || !e.before ? '証拠を取得できません' : e.before.value !== e.after.value ? '実行中にツリーが変化' : matches(e) ? '一部のみ読み取り — ツリーの一部を確認できていません' : '古い — その後ツリーが変化しました'
    return `- ${s(e.requested)} — ${why}`
  })
  sec.push({ heading: '## 5. 未検証', items: notVerified, fixed: ['- 上記の証拠なしに Claude が完了・成功・修正済みと述べたことは、あくまで Claude 自身の判断です。'] })
  const open = ops.filter(([, o]) => o.endedAt === undefined && o.outcome !== 'refused')
  const bg = Object.entries(state.background ?? {}).filter(([, b]) => b.status === 'started' || b.status === 'in-flight')
  const running = [
    ...open.map(([id, o]) => `- ${s(o.requested)} (${o.tool}, ${o.outcome}) — ${id}`),
    ...bg.map(([id, b]) => `- バックグラウンド ${s(id, 60)} — ${b.status}${b.asOf ? `（${new Date(b.asOf).toISOString()} 時点）` : ''}`),
  ]
  sec.push({ heading: '## 6. 実行中または不明', items: running, fixed: running.length ? [] : ['- 実行中のものは観測されませんでした。追跡外のプロセスについては確認できません。'] })
  const iv = Object.keys(state.interventions ?? {})
  sec.push({ heading: '## 7. 次のステップ', items: [], fixed: [iv.length ? `- 対処が必要：${iv.map((x) => s(x, 60)).join('、')}` : '- 記録なし。第 4〜6 節から判断してください。'] })
  const refused = (decisions ?? []).filter((d) => d.outcome === 'deny' || d.outcome === 'unknown' || d.outcome === 'needs-user-refused')
  sec.push({ heading: '## 8. まだ許可されていないこと', items: [], fixed: [
    ...(refused.length ? refused.slice(-10).map((d) => `- ${s(d.requested)} — ${s(d.rule)}`) : ['- このセッションで拒否された呼び出しはありません。第 2 節の禁止範囲は引き続き適用されます。']),
    '- 以前の承認は引き継がれません。再開時はすべての呼び出しが再度分類され、ホストが再度確認します。',
    // INV-005: what this mod cannot refuse is disclosed here as in /agentctl policy, never silent.
    '- 限界：ホストがこの mod のフックをスキップすると（ワーカー障害、mod 無効化）ここでは何も拒否しません。他の mod が tool.check で判定を変更できます。確実なルールは permissions.deny に設定してください。',
  ] })
  return assemble(head, sec, CAPS.handoff)
}
