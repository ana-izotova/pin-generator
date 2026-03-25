
export const shuffle = <T>(array: T[]): T[] => {
  const shuffledResult = [...array]

  for (let i = shuffledResult.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    [shuffledResult[i], shuffledResult[j]] = [shuffledResult[j], shuffledResult[i]]
  }

  return shuffledResult
}
