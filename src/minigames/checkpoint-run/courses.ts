export interface CoursePoint {
  x: number
  z: number
}

interface Course {
  buoy: CoursePoint
  rings: CoursePoint[]
  finish: CoursePoint
  goldSeconds: number
  windAngle: number
}

export const COURSES = {
  openSeaSprint: {
    buoy: { x: 170, z: -300 },
    rings: [
      { x: 82, z: -422 },
      { x: 60, z: -700 },
      { x: 270, z: -780 },
      { x: 470, z: -660 },
      { x: 500, z: -420 },
    ],
    finish: { x: 285, z: -300 },
    goldSeconds: 37,
    windAngle: Math.PI / 4,
  },
  islandHop: {
    buoy: { x: -657, z: -69 },
    rings: [
      { x: -682, z: 79 },
      { x: -680, z: 360 },
      { x: -540, z: 560 },
      { x: -300, z: 600 },
      { x: -120, z: 430 },
      { x: -60, z: 200 },
      { x: -170, z: -30 },
      { x: -300, z: -220 },
      { x: -480, z: -240 },
    ],
    finish: { x: -565, z: -130 },
    goldSeconds: 58,
    windAngle: (5 * Math.PI) / 4,
  },
  grandRegatta: {
    buoy: { x: 293, z: 851 },
    rings: [
      { x: 326, z: 705 },
      { x: 370, z: 420 },
      { x: 470, z: 265 },
      { x: 650, z: 210 },
      { x: 780, z: 110 },
      { x: 690, z: -100 },
      { x: 580, z: -225 },
      { x: 420, z: -380 },
      { x: 210, z: -420 },
      { x: 70, z: -280 },
      { x: 75, z: -60 },
      { x: 60, z: 170 },
      { x: 70, z: 380 },
      { x: 20, z: 570 },
      { x: 100, z: 740 },
    ],
    finish: { x: 200, z: 815 },
    goldSeconds: 78,
    windAngle: Math.PI / 2,
  },
} satisfies Record<string, Course>

export type CourseKey = keyof typeof COURSES
export const COURSE_KEYS = Object.keys(COURSES) as CourseKey[]
