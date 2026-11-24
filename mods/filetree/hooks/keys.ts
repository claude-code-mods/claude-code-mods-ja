import type { RowSpec } from './rows'

export type ShortcutKey = { key: string; label: string; terminal?: true }
export type ShortcutGroup = { title: string; keys: ShortcutKey[] }

const GROUPS: readonly ShortcutGroup[] = [
  {
    title: '移動',
    keys: [
      { key: 'j / k', label: '下 / 上' },
      { key: 'h / l', label: '折りたたむ / 親ディレクトリへ / 展開' },
      { key: 'o, Enter', label: 'ファイルを開く / フォルダーの展開・折りたたみ' },
      { key: 'z', label: 'フォルダーへ移動' },
      { key: 'Space', label: 'macOS のクイックルック', terminal: true },
    ],
  },
  {
    title: '検索',
    keys: [
      { key: 's', label: '検索欄にフォーカス' },
      { key: 'i', label: 'カーソルがあるフォルダー内を検索' },
      { key: 'c / r', label: '大文字と小文字を区別 / 正規表現' },
      { key: 'q', label: 'ファイル名ではなく内容を検索' },
    ],
  },
  {
    title: 'ファイルと操作',
    keys: [
      { key: 'd', label: '差分表示' },
      { key: 'click', label: '行を選択' },
      { key: 'ctrl+click', label: '行の選択を追加または解除（macOS は alt+click）' },
      { key: 'shift+click', label: 'アンカーから範囲を選択' },
      { key: 'shift+j / k', label: '下 / 上へ選択を拡張' },
      { key: 'v / V', label: '行の選択を追加または解除 / マークを消去' },
      { key: 'y / Y', label: '相対 / 絶対パスをコピー' },
      { key: 'u', label: 'ファイル名をコピー' },
      { key: 't', label: ' の tmux または herdr ペインでターミナルを開く' },
      { key: 'x', label: 'Claude による変更を防止' },
      { key: 'w', label: 'リポジトリ外に書き込まれたファイル' },
    ],
  },
  {
    title: '表示',
    keys: [
      { key: 'p', label: 'プレビューまたはツリー表示', terminal: true },
      { key: 'f / b', label: 'プレビューをページ送り', terminal: true },
      { key: '[ / ]', label: 'PDF または Word の前のページ / 次のページ', terminal: true },
      { key: 'a', label: '自動折りたたみ' },
      { key: 'n / g / m', label: '名前 / Git 状態 / サイズで並べ替え' },
    ],
  },
  {
    title: 'パネル',
    keys: [
      { key: '?', label: 'この一覧を表示または非表示', terminal: true },
      { key: 'ctrl+x tab', label: 'キーボードフォーカスをパネルへ', terminal: true },
      { key: 'alt+l', label: 'キーボードフォーカスをファイルツリーへ', terminal: true },
      { key: 'alt+h', label: '入力欄に戻る', terminal: true },
      { key: '/filetree keys', label: 'alt+l と alt+h を設定', terminal: true },
      { key: 'Esc', label: '入力欄に戻る', terminal: true },
    ],
  },
]

export const SCROLL_KEYS: ReadonlySet<string> = new Set(['up', 'down', 'j', 'k', 'pageup', 'pagedown', 'f', 'b', 'home', 'end'])

export function shortcutGroups(desktop: boolean): ShortcutGroup[] {
  return GROUPS.map(g => ({ title: g.title, keys: g.keys.filter(k => !desktop || !k.terminal) })).filter(g => g.keys.length > 0)
}

export function shortcutRows(accent: string, muted: string): RowSpec[] {
  const groups = shortcutGroups(false)
  const width = Math.max(...groups.flatMap(g => g.keys.map(k => k.key.length))) + 2
  const rows: RowSpec[] = [{ id: '', left: [{ t: ' キーボードショートカット', b: true, c: accent }], right: [{ t: '? 閉じる ', c: muted }] }]
  for (const g of groups) {
    rows.push({ id: '', left: [{ t: ' ' }], right: [] })
    rows.push({ id: '', left: [{ t: ` ${g.title}`, b: true }], right: [] })
    for (const k of g.keys) rows.push({ id: '', left: [{ t: `   ${k.key.padEnd(width)}`, c: accent }, { t: k.label }], right: [] })
  }
  return rows
}
