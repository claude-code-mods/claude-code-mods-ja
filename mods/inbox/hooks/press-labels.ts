import type { PrPress } from './pr-press'
import type { RowPress } from './presses'

export function actionId(p: RowPress | PrPress): string {
  return p.action === 'step' ? `step-${p.step}` : p.action
}

export function pressText(p: RowPress): string {
  switch (p.action) {
    case 'answer':
      return p.option
    case 'type':
      return '返信'
    case 'issue':
      return ISSUE_LABEL
    case 'show-explanation':
      return SHOW_EXPLANATION_LABEL
    case 'step':
      return p.label
    case 'remove-goal':
      return '削除'
    case 'restore-goal':
      return '元に戻す'
    case 'take-goal':
      return '目標を設定'
    default:
      return capitalized(p.action)
  }
}

export function capitalized(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const ISSUE_LABEL = '問題を起票'
export const SHOW_EXPLANATION_LABEL = '説明を表示'
