import { extractFirstEnglishWord } from '../utils/formatWord'

export function useSpeech() {
  function speakText(text: string) {
    const wordToSpeak = extractFirstEnglishWord(text)
    if (!wordToSpeak) return

    const utterance = new SpeechSynthesisUtterance(wordToSpeak)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    utterance.pitch = 1.0
    utterance.volume = 0.9
    speechSynthesis.speak(utterance)
  }

  return { speakText }
}
