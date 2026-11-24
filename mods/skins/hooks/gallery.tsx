import type { RenderElement } from 'claude-code'

import type { Table } from './markdown'
import {
  askBand,
  codeCard,
  desktopSpinnerRow,
  diffCard,
  footerRow,
  groupRow,
  promptRow,
  replyRows,
  spinnerRow,
  terminalCard,
  toolRow,
  usageBand,
} from './rows'
import type { Look } from './rows'
import { codeRows } from './code-rows'
import { shellRows } from './shell-rows'

// Every element the skin draws, numbered, from the same builders the transcript uses, so
// a note on #4 is a note on the real thing.

const done = { isRunning: false, isErrored: false, isInterrupted: false }

const TABLE: Table = {
  kind: 'table',
  header: ['Skin', 'Accent', 'Time'],
  align: ['left', 'left', 'right'],
  rows: [
    ['noir', '#f5f5f5', '41s'],
    ['tokyo-night', '#7aa2f7', '2.1s'],
    ['dracula', '#bd93f9', '340ms'],
  ],
}

const SHELL_FOLD = { stdout: { head: 8, tail: 4 }, stderr: { head: 8, tail: 4 } }

const CODE = ['// Rate limit per route, keyed by user', 'export function limit(route: string, perMinute = 60) {', '  return (used: number) => used < perMinute', '}'].join('\n')

const DIFF = {
  path: '/work/apps/hub/src/server.ts',
  isNewFile: false,
  hunks: [{ oldStart: 12, newStart: 12, lines: [' const app = fastify()', '-app.listen(7447)', '+app.register(rateLimit, { max: 60 })', '+app.listen(7447)'] }],
}

export function galleryPane(look: Look, columns: number) {
  const { Box, Text } = look.ui
  const { palette } = look.skin
  const svg = look.svg
  let number = 0
  const section = (title: string, ...items: RenderElement[]) => {
    number += 1

    return (
      <Box flexDirection="column" marginBottom={1}>
        <Text color={palette.muted} bold>{`${number}  ${title}`}</Text>
        {items}
      </Box>
    )
  }
  const width = Math.max(40, columns - 4)

  return (
    <Box flexDirection="column">
      {section('プロンプト', promptRow(look, 'add rate limiting to the hub api'))}
      {section(
        'ツール行: 完了、実行中、失敗',
        toolRow(look, { tool: 'Bash', input: {}, ...done }, 'run', 'pnpm test --filter hub', { ms: 2140 }),
        toolRow(look, { tool: 'Read', input: {}, ...done, isRunning: true }, 'read', 'docs/protocols.md', {}),
        toolRow(look, { tool: 'Edit', input: {}, ...done, isErrored: true }, 'write', 'apps/hub/src/server.ts', {}),
      )}
      {section('折りたたまれた読み取りと検索のグループ', groupRow(look, [{ tool: 'Read', input: {}, ...done }, { tool: 'Read', input: {}, ...done }, { tool: 'Grep', input: {}, ...done }]))}
      {svg === undefined
        ? section('編集差分カード', <Text color={palette.muted}>デスクトップのみ。ターミナルでは Claude Code 標準の差分表示が使われます。</Text>)
        : section('編集差分カード', diffCard(look, svg, DIFF, 'apps/hub/src/server.ts', width))}
      {svg === undefined
        ? section(
            'シェル出力カード: 成功、失敗（stderr あり）、折りたたみ',
            shellRows(look, 'pnpm test --filter hub', { stdout: 'Test Files  12 passed (12)\n     Tests  148 passed (148)', stderr: '', interrupted: false }, false, SHELL_FOLD),
            shellRows(look, 'pnpm tsc', { stdout: 'src/server.ts', stderr: 'error TS2322: Type string is not assignable to number', interrupted: false, exitCode: 2 }, true, SHELL_FOLD),
            shellRows(look, 'seq 40', { stdout: Array.from({ length: 40 }, (_, i) => String(i + 1)).join('\n'), stderr: '', interrupted: false }, false, SHELL_FOLD),
          )
        : section(
            'シェル出力カード: 成功、失敗',
            terminalCard(look, svg, { stdout: 'Test Files  12 passed (12)\n     Tests  148 passed (148)', stderr: '', interrupted: false }, false, width),
            terminalCard(look, svg, { stdout: '', stderr: 'error TS2322: Type string is not assignable to number', interrupted: false }, true, width, 'copy-output-failed'),
          )}
      {svg === undefined
        ? section('コードブロック（構文強調）', codeRows(look, 'ts', CODE))
        : section('コードブロックカード', codeCard(look, 'ts', CODE, svg, width))}
      {section('表', replyRows(look, [TABLE], width, svg))}
      {svg === undefined
        ? section('スピナー', spinnerRow(look, look.skin.spinner[0] ?? 'Working', 3, 12_000))
        : section(
            'スピナー: 思考中、ツール実行中、記述中、待機中',
            desktopSpinnerRow(look, svg, 'thinking', '思考中'),
            desktopSpinnerRow(look, svg, 'tool-use', 'pnpm test を実行中'),
            desktopSpinnerRow(look, svg, 'responding', '返信を作成中'),
            desktopSpinnerRow(look, svg, 'requesting', 'モデルの応答を待機中'),
          )}
      {section(
        'プロンプト上のステータスバー: 通常、圧縮の通知',
        usageBand(look, [{ label: 'context', percent: 42 }, { label: '5h', percent: 18 }], look.prefs.compact, () => undefined),
        usageBand(look, [{ label: 'context', percent: 85 }, { label: '5h', percent: 61 }], look.prefs.compact, () => undefined),
      )}
      {section('質問上のステータスバー', askBand(look, ['アプローチ', '保存先']))}
      {section('ターンフッター（ターミナル）', footerRow(look, look.skin.done[0] ?? 'Done', 41_000, { tools: 6, added: 18, removed: 3 }))}
    </Box>
  )
}
