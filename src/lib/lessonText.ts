import type { LessonDef, TopicDef } from '@/types/vocab'
import { LESSONS } from '@/data/topics'
import { MATH_LESSONS } from '@/data/mathTopic'
import { LANGUAGE_LESSONS } from '@/data/languageTopic'
import { WORKSHOP_3_LESSONS } from '@/data/workshopTopic'

type Lang = 'en' | 'es'

const ALL_LESSONS: LessonDef[] = [...LESSONS, ...MATH_LESSONS, ...LANGUAGE_LESSONS, ...WORKSHOP_3_LESSONS]

export function lessonName(lesson: LessonDef, lang: Lang): string {
  return lang === 'es' && lesson.nameEs ? lesson.nameEs : lesson.name
}

export function lessonDescription(lesson: LessonDef, lang: Lang): string {
  return lang === 'es' && lesson.descriptionEs ? lesson.descriptionEs : lesson.description
}

// Header title for a lesson view, looked up by lesson id.
export function lessonTitle(id: string, lang: Lang): string {
  const lesson = ALL_LESSONS.find((l) => l.id === id)
  return lesson ? lessonName(lesson, lang) : ''
}

// Topics carry a Spanish `name` and an English `displayName`.
export function topicTitle(topic: TopicDef, lang: Lang): string {
  return lang === 'es' ? topic.name : topic.displayName
}

export function topicSubtitle(topic: TopicDef, lang: Lang): string {
  return lang === 'es' ? topic.displayName : topic.name
}
