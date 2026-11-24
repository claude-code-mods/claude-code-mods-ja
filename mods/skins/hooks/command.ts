import type { CalmSnapshot, Prefs } from '../types'
import { SKINS } from './themes'

export const DEFAULT_PREFS: Prefs = {
  skin: 'noir',
  icons: 'unicode',
  prompt: 'left',
  words: 'skin',
  rail: true,
  tables: 'on',
  shimmer: true,
  band: true,
  countdown: false,
  clipOutput: false,
  markdown: true,
  quiet: false,
  charts: true,
  math: true,
  commands: true,
  shell: true,
  highlight: true,
  hints: true,
  links: true,
  copy: true,
  fold: true,
  expand: false,
  compact: true,
  calm: null,
}

// The on/off settings, by the word /skin and the settings pane use for each. Tables have a
// third state, `text`, so they are switched on their own.
export const TOGGLES = {
  rail: 'rail',
  shimmer: 'shimmer',
  band: 'band',
  countdown: 'countdown',
  clip: 'clipOutput',
  markdown: 'markdown',
  quiet: 'quiet',
  charts: 'charts',
  math: 'math',
  commands: 'commands',
  shell: 'shell',
  highlight: 'highlight',
  hints: 'hints',
  links: 'links',
  copy: 'copy',
  fold: 'fold',
  expand: 'expand',
  compact: 'compact',
} as const satisfies Record<string, keyof Prefs>

export type ToggleWord = keyof typeof TOGGLES

export type Outcome = {
  prefs: Prefs
  message: string
  // `row` prints a transcript line (listings, mistakes); `toast` confirms a change quietly.
  channel: 'row' | 'toast'
}

const flagOr = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback

export const TABLE_MODES = ['on', 'text', 'off'] as const satisfies readonly Prefs['tables'][]

// Tables were on/off before `text`, so a stored boolean still reads.
export function tablesOr(value: unknown, fallback: Prefs['tables']): Prefs['tables'] {
  if (typeof value === 'boolean') {
    return value ? 'on' : 'off'
  }

  return TABLE_MODES.find(mode => mode === value) ?? fallback
}

// The settings pane's tables button steps through the modes in order.
export const nextTables = (mode: Prefs['tables']): Prefs['tables'] =>
  TABLE_MODES[(TABLE_MODES.indexOf(mode) + 1) % TABLE_MODES.length] ?? 'on'

// A stored calm snapshot, or null when it is not one: then calm reads as off.
function calmOf(value: unknown): CalmSnapshot | null {
  const saved = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null

  return saved !== null && typeof saved.shimmer === 'boolean' && typeof saved.rail === 'boolean' && typeof saved.quiet === 'boolean'
    ? { shimmer: saved.shimmer, rail: saved.rail, quiet: saved.quiet }
    : null
}

// What the store hands back may be old, hand-edited or from another version.
export function parsePrefs(raw: unknown, names: readonly string[]): Prefs {
  const saved = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const skin = saved.skin

  return {
    skin:
      typeof skin === 'string' && (skin === 'off' || names.includes(skin))
        ? skin
        : DEFAULT_PREFS.skin,
    icons: saved.icons === 'ascii' ? 'ascii' : 'unicode',
    prompt: saved.prompt === 'right' || saved.prompt === 'plain' ? saved.prompt : 'left',
    words: saved.words === 'claude' ? 'claude' : 'skin',
    rail: flagOr(saved.rail, DEFAULT_PREFS.rail),
    tables: tablesOr(saved.tables, DEFAULT_PREFS.tables),
    shimmer: flagOr(saved.shimmer, DEFAULT_PREFS.shimmer),
    band: flagOr(saved.band, DEFAULT_PREFS.band),
    countdown: flagOr(saved.countdown, DEFAULT_PREFS.countdown),
    clipOutput: flagOr(saved.clipOutput, DEFAULT_PREFS.clipOutput),
    markdown: flagOr(saved.markdown, DEFAULT_PREFS.markdown),
    quiet: flagOr(saved.quiet, DEFAULT_PREFS.quiet),
    charts: flagOr(saved.charts, DEFAULT_PREFS.charts),
    math: flagOr(saved.math, DEFAULT_PREFS.math),
    commands: flagOr(saved.commands, DEFAULT_PREFS.commands),
    shell: flagOr(saved.shell, DEFAULT_PREFS.shell),
    highlight: flagOr(saved.highlight, DEFAULT_PREFS.highlight),
    hints: flagOr(saved.hints, DEFAULT_PREFS.hints),
    links: flagOr(saved.links, DEFAULT_PREFS.links),
    copy: flagOr(saved.copy, DEFAULT_PREFS.copy),
    fold: flagOr(saved.fold, DEFAULT_PREFS.fold),
    expand: flagOr(saved.expand, DEFAULT_PREFS.expand),
    compact: flagOr(saved.compact, DEFAULT_PREFS.compact),
    calm: calmOf(saved.calm),
  }
}

// /skin calm: no motion, one line per tool row, read-only output folded. What it changes is
// kept, so calm off puts back what was there before. Failures stay whole either way
// (register.tsx draws them past quiet while calm is on).
export function withCalm(current: Prefs, on: boolean): Prefs {
  if (on) {
    return current.calm !== null
      ? current
      : { ...current, calm: { shimmer: current.shimmer, rail: current.rail, quiet: current.quiet }, shimmer: false, rail: false, quiet: true }
  }

  return current.calm === null ? current : { ...current, ...current.calm, calm: null }
}

const changed = (prefs: Prefs, message: string): Outcome => ({ prefs, message, channel: 'toast' })

const refused = (prefs: Prefs, message: string): Outcome => ({ prefs, message, channel: 'row' })

const onOff = (on: boolean): string => (on ? 'on' : 'off')

// A markdown table, its columns padded so it lines up as plain text too.
export function markdownTable(head: readonly string[], rows: readonly (readonly string[])[]): string {
  const widths = head.map((title, column) => Math.max(title.length, ...rows.map(row => (row[column] ?? '').length)))
  const line = (cells: readonly string[]) => `| ${widths.map((width, column) => (cells[column] ?? '').padEnd(width)).join(' | ')} |`

  return [line(head), line(widths.map(width => '-'.repeat(width))), ...rows.map(line)].join('\n')
}

const isBuiltIn = (name: string): boolean => SKINS.some(skin => skin.name === name)

// /skin list: the skins, then every setting, laid out as skin-code lays out its list.
// `extra` adds rows to the settings that the command reads from elsewhere.
export function listing(current: Prefs, names: readonly string[], extra: readonly (readonly [string, string])[] = []): string {
  const mark = (name: string) => (name === current.skin ? `${name} (current)` : name)

  return [
    `スキン · 現在: ${current.skin}`,
    '',
    markdownTable(
      ['スキン', '種類'],
      [
        ...names.map(name => [mark(name), isBuiltIn(name) ? '組み込み' : 'カスタム']),
        [mark('off'), 'Claude Code 標準の外観'],
      ],
    ),
    '',
    markdownTable(
      ['設定', '値'],
      [
        ['icons', current.icons],
        ['prompt', current.prompt],
        ['words', current.words],
        ['rail', onOff(current.rail)],
        ['tables', current.tables],
        ['shimmer', onOff(current.shimmer)],
        ['band', onOff(current.band)],
        ['clip', onOff(current.clipOutput)],
        ['markdown', onOff(current.markdown)],
        ['quiet', onOff(current.quiet)],
        ['charts', onOff(current.charts)],
        ['math', onOff(current.math)],
        ['commands', onOff(current.commands)],
        ['shell', onOff(current.shell)],
        ['highlight', onOff(current.highlight)],
        ['hints', onOff(current.hints)],
        ['links', onOff(current.links)],
        ['copy', onOff(current.copy)],
        ['fold', onOff(current.fold)],
        ['expand', onOff(current.expand)],
        ['compact', onOff(current.compact)],
        ['calm', onOff(current.calm !== null)],
        ...extra,
      ],
    ),
    '',
    '`/skin <name>` でスキンを選択します。',
    '',
    '`/skin help` でコマンド一覧を表示します。',
  ].join('\n')
}

// /skin help: every argument, laid out as skin-code lays out its help.
export const helpText = (): string =>
  [
    'skins コマンド',
    '',
    markdownTable(
      ['コマンド', '動作'],
      [
        ['`/skin`', '設定を開く'],
        ['`/skin <name>`', 'そのスキンに切り替える'],
        ['`/skin list`', 'すべてのスキンと設定を一覧表示'],
        ['`/skin help`', 'これらのコマンドを表示'],
        ['`/skin off`', 'Claude Code 標準の外観に戻す'],
        ['`/skin on`', 'skins を再び有効にする'],
        ['`/skin gallery`', 'スキンが描画する各要素を番号付きで表示'],
        ['`/skin calm [on/off]`', 'アニメーションを無効化し、ツール行を 1 行にし、読み取り専用出力を折りたたむ'],
        ['`/skin copy` · `copy code`', '直前の返信、またはその最後のコードブロックをコピー'],
        ['`/skin pin` · `unpin` · `share`', 'このフォルダーに固有の外観を設定、解除、またはデフォルトに設定'],
        ['`/skin tables on/text/off`', '表をカード、選択可能なテキスト、または Claude Code 標準の表示にする'],
        ['`/skin prompt left/right/plain`', 'プロンプトの枠を左または右に表示、あるいはシンプルなマーカーにする'],
        ['`/skin words claude/skin`', 'スピナーとターンフッターに誰の文言を使うか'],
        ['`/skin icons unicode/ascii`', 'アイコン文字セット'],
        ['`/skin rail on/off`', 'ツール行の横のカラフルなレール'],
        ['`/skin shimmer on/off`', 'スピナーの文字を流れる光'],
        ['`/skin band on/off`', 'プロンプト上の使用量ステータスバー'],
        ['`/skin countdown on/off`', 'ステータスバーの各制限の残り時間'],
        ['`/skin clip on/off`', 'Claude Code 標準のシェル出力を先頭と末尾だけに切り詰める'],
        ['`/skin markdown on/off`', '警告ボックスとタスク一覧を描画する'],
        ['`/skin quiet on/off`', '読み取り、検索、読み取り専用コマンドを 1 行に折りたたむ'],
        ['`/skin charts on/off`', 'Mermaid コードブロックをチャートとして描画する'],
        ['`/skin math on/off`', '数式を整形する'],
        ['`/skin commands on/off`', 'スラッシュコマンドの出力を表とカードとして描画する'],
        ['`/skin shell on/off`', 'シェル出力をカードとして描画する'],
        ['`/skin highlight on/off`', 'スキンの配色でコードブロックを強調する'],
        ['`/skin hints on/off`', 'Claude にチャートを描画できると伝える'],
        ['`/skin links on/off`', 'URL とパスをリンクとして表示する'],
        ['`/skin copy on/off`', 'カードにコピーボタンを表示する'],
        ['`/skin fold on/off`', '長い内容を `▾ さらに N 行` の後ろに折りたたむ'],
        ['`/skin expand on/off`', 'すべての読み取りと検索のグループを展開する'],
        ['`/skin compact on/off`', 'ステータスバーの圧縮ボタン'],
      ],
    ),
    '',
    '`/skin list` ですべてのスキンと設定を一覧表示します。',
    '',
    '`/skin` で設定を開きます。',
  ].join('\n')

const isToggle = (word: string): word is ToggleWord => Object.hasOwn(TOGGLES, word)

// Every argument but none: with none, /skin opens the settings pane instead.
export function runSkinCommand(args: string, current: Prefs, names: readonly string[]): Outcome {
  const [head = '', value] = args.trim().toLowerCase().split(/\s+/)

  if (isToggle(head)) {
    const field = TOGGLES[head]

    return value === 'on' || value === 'off'
      ? changed({ ...current, [field]: value === 'on' }, `${head} ${value}`)
      : refused(current, `usage: /skin ${head} on|off`)
  }

  switch (head) {
    case 'list':
      return refused(current, listing(current, names))
    case 'help':
      return refused(current, helpText())
    // `default` and `stock` are what people reach for when they want Claude Code's own look.
    case 'off':
    case 'default':
    case 'stock':
      return changed({ ...current, skin: 'off' }, 'skins をオフにしました')
    case 'on':
      return current.skin === 'off'
        ? changed({ ...current, skin: DEFAULT_PREFS.skin }, `skin: ${DEFAULT_PREFS.skin}`)
        : changed(current, `skin: ${current.skin}`)
    case 'calm':
      return value === 'on' || value === undefined
        ? changed(withCalm(current, true), current.calm === null ? 'サイレントをオンにしました' : 'サイレントは既にオンです')
        : value === 'off'
          ? changed(withCalm(current, false), current.calm === null ? 'サイレントは既にオフです' : 'サイレントをオフにしました: 設定が復元されました')
          : refused(current, 'usage: /skin calm [on|off]')
    case 'tables':
      return value === 'on' || value === 'text' || value === 'off'
        ? changed({ ...current, tables: value }, `tables ${value}`)
        : refused(current, 'usage: /skin tables on|text|off')
    case 'prompt':
      return value === 'left' || value === 'right' || value === 'plain'
        ? changed({ ...current, prompt: value }, `prompt ${value}`)
        : refused(current, 'usage: /skin prompt left|right|plain')
    case 'words':
      return value === 'claude' || value === 'skin'
        ? changed({ ...current, words: value }, `words: ${value}`)
        : refused(current, 'usage: /skin words claude|skin')
    case 'icons':
      return value === 'unicode' || value === 'ascii'
        ? changed({ ...current, icons: value }, `icons: ${value}`)
        : refused(current, 'usage: /skin icons unicode|ascii')
    default:
      return names.includes(head)
        ? changed({ ...current, skin: head }, `skin: ${head}`)
        : refused(current, `unknown skin "${head}". /skin list shows them, /skin help the commands`)
  }
}
