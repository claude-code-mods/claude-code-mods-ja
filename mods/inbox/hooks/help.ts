import type { Finding, SubjectStatus } from '../types'
import type { ClosedState } from './ledger-close'
import type { ToneName } from './tones'
import type { Look } from './rows'
import { versionLabel } from './banners'
import { shownTabs } from './tabs'

export const FINDING_GROUPS: Record<Finding['kind'], { title: string; mark: string; tone: 'issue' | 'opportunity' }> = {
  issue: { title: '問題', mark: '▲', tone: 'issue' },
  opportunity: { title: '改善点', mark: '✦', tone: 'opportunity' },
}

/** The mark a group title on the Asks tab leads with, as a Finds group title leads with its kind's mark. */
export const NEEDS_YOU_MARKS = {
  question: { mark: '?', tone: 'needsYou' },
  task: { mark: '☑', tone: 'tasks' },
} as const

/** A mark's tone on the Status. Null draws it muted. */
export type StatusTone = 'needsYou' | 'done' | 'success' | 'working' | null

export const SUBJECT_MARKS: Record<SubjectStatus, { mark: string; tone: StatusTone }> = {
  working: { mark: '●', tone: 'working' },
  queued: { mark: '○', tone: null },
  'waits-on-other': { mark: '◌', tone: null },
  done: { mark: '✓', tone: 'done' },
  dropped: { mark: '✗', tone: null },
}
/** The mark of an open subject that an open ask holds up, in place of its status's mark, and of a delegate that waits for the person. */
export const HELD_MARK: { mark: string; tone: 'needsYou' } = { mark: '◆', tone: 'needsYou' }

/** The marks a running row cycles through in the text looks, one each `RUNNING_FRAME_MS`. */
export const RUNNING_FRAMES = ['●', '◉', '◎', '◉'] as const

/** The running mark's first frame, which the Codex tab fades instead of cycling the frames. */
export const RUNNING_MARK = RUNNING_FRAMES[0]

/** The mark of a working subject while no turn runs and no child under it works. */
export const IDLE_MARK: { mark: string; tone: StatusTone } = { mark: '◐', tone: 'working' }

export const CLOSED_MARKS: Record<ClosedState, string> = {
  handled: SUBJECT_MARKS.done.mark,
  dismissed: '✕',
  lapsed: SUBJECT_MARKS.dropped.mark,
}

/** A PR row's mark: a review thread that waits on the person, one sent to the agent, a failing check and a cancelled one. */
export const PR_MARKS = {
  waiting: { text: HELD_MARK.mark, tone: 'needsYou' },
  sent: { text: SUBJECT_MARKS.done.mark, tone: 'done' },
  failing: { text: FINDING_GROUPS.issue.mark, tone: 'error' },
  cancelled: { text: '⊘', tone: null },
} as const

/** One mark the legend explains. `isRunning` draws it as the running mark. */
export type LegendEntry = { mark: string; tone: ToneName | null; isRunning: boolean; words: string }

/**
 * The words of the two marks that mean a thing stopped before it finished. The terminal and omp draw both as ⊘, so
 * their Help lines start alike.
 */
const stoppedWords = (what: string) => `完了前に停止：${what}`

/** Every mark a look draws on a row or a group title, once each, with what it means wherever it appears. */
export const MARK_LEGEND: readonly LegendEntry[] = [
  {
    mark: RUNNING_MARK,
    tone: 'working',
    isRunning: true,
    words: '作業中です。作業が進んでいる間やメッセージが送信中に、このマークが動きます。',
  },
  { mark: IDLE_MARK.mark, tone: IDLE_MARK.tone, isRunning: false, words: '作業中ですが、現在実行中のタスクはありません' },
  { mark: SUBJECT_MARKS.queued.mark, tone: null, isRunning: false, words: '待機中：まだ開始していません' },
  {
    mark: SUBJECT_MARKS['waits-on-other'].mark,
    tone: null,
    isRunning: false,
    words: 'ビルドやレビューなど、あなた以外のことを待っています',
  },
  { mark: HELD_MARK.mark, tone: HELD_MARK.tone, isRunning: false, words: 'あなたの対応を待っています' },
  {
    mark: NEEDS_YOU_MARKS.question.mark,
    tone: NEEDS_YOU_MARKS.question.tone,
    isRunning: false,
    words: 'エージェントがあなたに尋ねた質問',
  },
  {
    mark: NEEDS_YOU_MARKS.task.mark,
    tone: NEEDS_YOU_MARKS.task.tone,
    isRunning: false,
    words: 'あなたにしかできない作業',
  },
  { mark: SUBJECT_MARKS.done.mark, tone: 'done', isRunning: false, words: '完了するか、エージェントに引き継がれました' },
  { mark: SUBJECT_MARKS.dropped.mark, tone: null, isRunning: false, words: stoppedWords('dropped work') },
  { mark: CLOSED_MARKS.dismissed, tone: null, isRunning: false, words: 'あなたが閉じました' },
  {
    mark: FINDING_GROUPS.issue.mark,
    tone: FINDING_GROUPS.issue.tone,
    isRunning: false,
    words: '問題が発生：不具合やチェックの失敗',
  },
  {
    mark: PR_MARKS.cancelled.text,
    tone: PR_MARKS.cancelled.tone,
    isRunning: false,
    words: stoppedWords('a cancelled check, which needs another run'),
  },
  {
    mark: FINDING_GROUPS.opportunity.mark,
    tone: FINDING_GROUPS.opportunity.tone,
    isRunning: false,
    words: '改善点：より良くできる箇所',
  },
]

/**
 * The words of Help. `name` is the control's accessible name and tooltip, since its drawn form is a question mark in
 * every look. `icon` is that mark where a look draws only text. `close` is the control's text while Help shows.
 */
export const HELP_COPY = {
  name: 'ヘルプ',
  icon: '?',
  keys: 'キー',
  indicators: 'マーク',
  version: 'インボックス',
} as const

/** The words at the right end of Help's Keys title that say which inbox build this is. */
export const helpVersionText = (version: string, isNextBuild: boolean): string =>
  `${HELP_COPY.version} ${versionLabel(version, isNextBuild)}`

export type HelpKey = { keys: string; does: string }

/** The key that presses Undo, which no row's selection holds: a closed row settles and the selection moves on. */
export const UNDO_KEY = 'u'
/** Collapses the selected row, or expands it once collapsed. */
export const COLLAPSE_KEY = 'z'
/**
 * Folds every fold on the tab, or opens every one. It is not Shift+z because the engine binds a hotkey by its letter and
 * ignores Shift, so the terminal cannot tell the two apart.
 */
export const FOLD_ALL_KEY = 'w'

/** The PRs tab's own keys, which `hooks/pr-order.ts:prOrderActions` and `hooks/pr-tab.ts:prClearActions` bind from any row of the tab. */
const PR_TAB_HELP_KEYS: HelpKey[] = [
  { keys: 'g', does: 'PR タブで、並べ替えた PR に変化があったら再び並べ替える' },
  { keys: 'm', does: 'PR タブで、マージ済みとクローズ済みの PR を消去する' },
]

/**
 * The keys a look's Help lists. Help is one page whatever tab it opened over, and switching tabs closes it. Desktop
 * takes no keys, so its Help lists marks only. Each look binds these keys in its own adapter.
 */
export function helpKeys(look: Look): HelpKey[] {
  const tabKeys = shownTabs()
    .map(t => t.hotkey)
    .join(' ')
  const switchTabs = { keys: tabKeys, does: 'タブを切り替える' }
  const undoKey = { keys: UNDO_KEY, does: '直前のクローズを元に戻す' }
  const collapseKey = { keys: COLLAPSE_KEY, does: '選択中の行を折りたたむ／展開する' }
  const foldAllKey = { keys: FOLD_ALL_KEY, does: '現在のタブのすべてのグループを折りたたむ／開く' }
  switch (look) {
    case 'desktop':
      return []
    case 'terminal':
      return [
        switchTabs,
        { keys: 'j k', does: '次の行または前の行を選ぶ' },
        collapseKey,
        foldAllKey,
        undoKey,
        ...PR_TAB_HELP_KEYS,
        { keys: 'ctrl+x tab', does: 'フォーカスをプロンプト上の行、ペイン、プロンプトの順に移す' },
      ]
    case 'codex':
      return [
        switchTabs,
        { keys: 'j k ↑ ↓', does: '次の行または前の行を選ぶ' },
        collapseKey,
        foldAllKey,
        undoKey,
        ...PR_TAB_HELP_KEYS,
        { keys: '?', does: 'ヘルプを開く／閉じる' },
        { keys: 'esc', does: 'ヘルプを閉じるか、返信欄から出る' },
      ]
    case 'omp':
      return [
        { keys: `tab ${tabKeys}`, does: 'タブを切り替える' },
        { keys: '↑ ↓ j k', does: '行間を移動するか、ページをスクロールする' },
        { keys: '← →', does: 'ボタンを選ぶ' },
        { keys: '↵', does: '選んだボタンを押す' },
        { keys: 't', does: '選択中の行に返信する' },
        collapseKey,
        foldAllKey,
        undoKey,
        ...PR_TAB_HELP_KEYS,
        { keys: '?', does: 'ヘルプを開く／閉じる' },
        { keys: 'esc', does: 'ヘルプを閉じ、次にペインを閉じる' },
      ]
    case 'herdr':
      return [
        { keys: '← →', does: 'タブを切り替える' },
        { keys: 'j k', does: '次の行または前の行を選ぶ' },
        collapseKey,
        foldAllKey,
        undoKey,
        ...PR_TAB_HELP_KEYS,
        { keys: 'esc', does: "フォーカスをエージェントのターミナルに戻す" },
      ]
  }
}
