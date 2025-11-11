import apiClient from './client'

const TEAM = process.env.REACT_APP_ROLLING_TEAM

export const REACTION_ALIAS_TO_EMOJI = {
  celebrate: '🎉',
  smile: '😊',
  heart: '❤️',
  laugh: '😂',
  clap: '👏',
  fire: '🔥',
  thumbsup: '👍',
  thumbsdown: '👎',
  wow: '😮',
  cry: '😢',
  angry: '😡',
  love: '😍',
  wink: '😉',
  cool: '😎',
  star: '⭐',
  pray: '🙏',
  flex: '💪',
  sparkle: '✨',
  party: '🥳',
  hug: '🤗'
}

export const EMOJI_TO_ALIAS = Object.fromEntries(
  Object.entries(REACTION_ALIAS_TO_EMOJI).map(([alias, emoji]) => [emoji, alias])
)

// 팀 슬러그와 전달받은 경로 조각을 조합해 REST 엔드포인트를 만든다.
const buildTeamPath = (...segments) => {
  const team = TEAM
  if (!team) {
    throw new Error('REACT_APP_ROLLING_TEAM 환경 변수가 설정되어 있지 않습니다.')
  }
  const path = ['/', team, ...segments]
    .join('/')
    .replace(/\/{2,}/g, '/')
  return path.endsWith('/') ? path : `${path}/`
}

export const normalizeReactionsResponse = (data) => {
  const list = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : []

  return list
    .map((item, index) => {
      const emojiSource = item.emoji || item.reaction || item.type || item.name
      const emoji = REACTION_ALIAS_TO_EMOJI[emojiSource] || emojiSource
      const rawCount = item.count ?? item.value ?? item.amount ?? 0
      const count = typeof rawCount === 'number' ? rawCount : Number(rawCount) || 0

      if (!emoji) return null

      return {
        id: item.id ?? `${emoji}-${index}`,
        emoji,
        count
      }
    })
    .filter(Boolean)
}

// 팀의 롤링 페이퍼 목록을 조회한다. (예: 인기/최신 목록)
export const fetchRecipients = (params = {}) =>
  apiClient.get(buildTeamPath('recipients'), { params }).then((res) => res.data)

// 특정 롤링 페이퍼(수신인)의 상세 정보를 조회한다.
export const fetchRecipient = (recipientId) =>
  apiClient.get(buildTeamPath('recipients', recipientId)).then((res) => res.data)

// 특정 롤링 페이퍼에 등록된 메시지 목록을 조회한다.
export const fetchRecipientMessages = (recipientId, params = {}) =>
  apiClient
    .get(buildTeamPath('recipients', recipientId, 'messages'), { params })
    .then((res) => res.data)

// 특정 롤링 페이퍼에 달린 리액션 목록을 조회한다.
export const fetchRecipientReactions = (recipientId, params = {}) =>
  apiClient
    .get(buildTeamPath('recipients', recipientId, 'reactions'), { params })
    .then((res) => res.data)

// 특정 롤링 페이퍼에 새로운 리액션을 추가한다.
export const reactToRecipient = (recipientId, payload) =>
  apiClient.post(buildTeamPath('recipients', recipientId, 'reactions'), payload).then((res) => res.data)

// 새로운 롤링 페이퍼(수신인)를 생성한다.
export const createRecipient = (data) =>
  apiClient.post(buildTeamPath('recipients'), data).then((res) => res.data)

// 특정 롤링 페이퍼를 삭제한다.
export const deleteRecipient = (recipientId) =>
  apiClient.delete(buildTeamPath('recipients', recipientId)).then((res) => res.data)
