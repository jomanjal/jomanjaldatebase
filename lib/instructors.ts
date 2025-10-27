export interface Instructor {
  id: number
  name: string
  image: string
  specialty: string
  tier: string
  style: string
  rating: number
  reviews: number
  games: string[]
  description: string
  experience?: string
  students?: number
}

export const instructors: Instructor[] = [
  {
    id: 1,
    name: "Jomanjal",
    image: "/asd.jpg",
    specialty: "발로란트",
    tier: "레디언트",
    style: "전략, 에이밍",
    rating: 5.0,
    reviews: 200,
    games: ["발로란트"],
    description: "전문 코치",
    experience: "3년",
    students: 200,
  },
]

// 게임에 맞는 강사 찾기
export function findInstructorByGame(game: string): Instructor | null {
  return instructors.find(instructor => 
    instructor.games.includes(game)
  ) || null
}

