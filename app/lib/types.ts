// ユーザープロフィール
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  level: number;
  totalExp: number;
  createdAt: Date;
  photoURL?: string;
}

// トレーニングのセット
export interface WorkoutSet {
  reps: number;
  weight: number; // kg (0の場合は自重)
}

// トレーニング種目
export interface Exercise {
  id: string;
  exerciseName: string;
  sets: WorkoutSet[];
  notes?: string;
}

// トレーニング記録
export interface Workout {
  id: string;
  userId: string;
  date: Date;
  exercises: Exercise[];
  totalVolume: number; // 総ボリューム (重量×回数の合計)
  duration?: number; // 分
  notes?: string;
  createdAt: Date;
}

// トレーニング種目マスタ
export interface ExerciseMaster {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: string[];
}

export type ExerciseCategory =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "cardio"
  | "other";

// レベルシステム
export interface LevelInfo {
  level: number;
  currentExp: number;
  requiredExp: number;
  title: string;
}

// グラフ用データ
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}