/**
 * The command the mod answers, and the fixed texts it prints.
 *
 * The name is namespaced by the plugin (`shunt` + `commands/usage.md`), which
 * is what keeps it off the built-in `/usage`: `$.command.register` takes a
 * bare global name and refuses `usage` outright ("it is the built-in /usage"),
 * while a plugin's markdown command lists as `shunt:usage` and is free.
 */
export const COMMAND_NAME = 'shunt:usage'

/**
 * The path `[server.usage]` registers on the gateway.
 */
export const USAGE_PATH = '/usage'

export const NO_BASE_URL_TEXT =
  '問い合わせ先のゲートウェイがありません —— SHUNT_BASE_URL と ANTHROPIC_BASE_URL の ' +
  'どちらも未設定のため、このセッションは Anthropic に直接接続しています。Claude Code を ' +
  'ゲートウェイに向ける（export ANTHROPIC_BASE_URL=http://127.0.0.1:3001）してから ' +
  '/shunt:usage を再実行してください。'

export const NO_TOKEN_TEXT =
  '認証に使える資格情報がありません —— SHUNT_TOKEN、' +
  'ANTHROPIC_AUTH_TOKEN、ANTHROPIC_API_KEY が未設定で、shunt ' +
  'gateway token の apiKeyHelper も利用できません。' +
  'shunt gateway login でログインするか、ゲートウェイ管理者にクライアント token を依頼してください。'

export const NOT_ENABLED_TEXT =
  'ゲートウェイは応答しましたが、GET /usage は有効ではありません。ゲートウェイ設定に ' +
  '[server.usage] テーブルを追加して再起動してください。このテーブルにキーは不要ですが、' +
  '[server.auth]（クライアント token）または [server.gateway]（ゲートウェイログイン）が必要です。'

export const REFUSED_TEXT =
  'ゲートウェイがこのセッションの資格情報を拒否しました。SHUNT_TOKEN、ANTHROPIC_AUTH_TOKEN、' +
  'ANTHROPIC_API_KEY および shunt gateway token helper のうち ' +
  '最初に設定されたものが送信され、残りは無視されます。クライアント token はゲートウェイの ' +
  '[server.auth] が受け付ける token でなければなりません。ゲートウェイログインは期限切れまたは失効の可能性があるため、' +
  'shunt gateway login で再ログインしてください。'

export const HOOK_FAILED_TEXT =
  'プール使用量を読み取れませんでした —— このコマンドに応答するフックが ' +
  '失敗したか時間予算を超過しました。/shunt:usage を再実行してください。それでも ' +
  '失敗する場合は、ゲートウェイが起動しており到達可能か確認してください。'

export const NO_POOL_TEXT =
  'ゲートウェイがプール化プロバイダを報告していないため、共有クォータを表示できません。' +
  'いずれかのプロバイダでプール化アカウント ' +
  '（認証モードが oauth または chatgpt）が設定されると、プール使用量が表示されます。'
