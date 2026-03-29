import type { ExerciseMaster, LevelInfo } from "./types";

// デフォルトのトレーニング種目
export const DEFAULT_EXERCISES: ExerciseMaster[] = [
  // 胸
  { id: "bench_press", name: "ベンチプレス", category: "chest", muscleGroups: ["大胸筋", "三角筋前部", "上腕三頭筋"] },
  { id: "incline_bench", name: "インクラインベンチプレス", category: "chest", muscleGroups: ["大胸筋上部"] },
  { id: "dumbbell_fly", name: "ダンベルフライ", category: "chest", muscleGroups: ["大胸筋"] },
  { id: "push_up", name: "プッシュアップ", category: "chest", muscleGroups: ["大胸筋", "三角筋前部"] },
  // 背中
  { id: "deadlift", name: "デッドリフト", category: "back", muscleGroups: ["脊柱起立筋", "広背筋", "ハムストリング"] },
  { id: "lat_pulldown", name: "ラットプルダウン", category: "back", muscleGroups: ["広背筋"] },
  { id: "barbell_row", name: "バーベルロウ", category: "back", muscleGroups: ["広背筋", "僧帽筋"] },
  { id: "pull_up", name: "懸垂", category: "back", muscleGroups: ["広背筋", "上腕二頭筋"] },
  // 肩
  { id: "overhead_press", name: "オーバーヘッドプレス", category: "shoulders", muscleGroups: ["三角筋"] },
  { id: "lateral_raise", name: "サイドレイズ", category: "shoulders", muscleGroups: ["三角筋中部"] },
  { id: "front_raise", name: "フロントレイズ", category: "shoulders", muscleGroups: ["三角筋前部"] },
  // 腕
  { id: "barbell_curl", name: "バーベルカール", category: "arms", muscleGroups: ["上腕二頭筋"] },
  { id: "dumbbell_curl", name: "ダンベルカール", category: "arms", muscleGroups: ["上腕二頭筋"] },
  { id: "tricep_pushdown", name: "トライセップスプッシュダウン", category: "arms", muscleGroups: ["上腕三頭筋"] },
  { id: "skull_crusher", name: "スカルクラッシャー", category: "arms", muscleGroups: ["上腕三頭筋"] },
  // 脚
  { id: "squat", name: "スクワット", category: "legs", muscleGroups: ["大腿四頭筋", "ハムストリング", "臀筋"] },
  { id: "leg_press", name: "レッグプレス", category: "legs", muscleGroups: ["大腿四頭筋"] },
  { id: "leg_curl", name: "レッグカール", category: "legs", muscleGroups: ["ハムストリング"] },
  { id: "calf_raise", name: "カーフレイズ", category: "legs", muscleGroups: ["下腿三頭筋"] },
  { id: "lunge", name: "ランジ", category: "legs", muscleGroups: ["大腿四頭筋", "臀筋"] },
  // 体幹
  { id: "plank", name: "プランク", category: "core", muscleGroups: ["腹横筋", "脊柱起立筋"] },
  { id: "crunch", name: "クランチ", category: "core", muscleGroups: ["腹直筋"] },
  { id: "leg_raise", name: "レッグレイズ", category: "core", muscleGroups: ["腹直筋下部"] },
  // 有酸素
  { id: "running", name: "ランニング", category: "cardio", muscleGroups: [] },
  { id: "cycling", name: "サイクリング", category: "cardio", muscleGroups: [] },
  { id: "rowing", name: "ローイング", category: "cardio", muscleGroups: [] },
];

// カテゴリ名（日本語）
export const CATEGORY_LABELS: Record<string, string> = {
  chest: "胸",
  back: "背中",
  shoulders: "肩",
  arms: "腕",
  legs: "脚",
  core: "体幹",
  cardio: "有酸素",
  other: "その他",
};

// レベルシステムの設定
// 必要EXP = レベル × 100
export function calculateLevelInfo(totalExp: number): LevelInfo {
  let level = 1;
  let expForCurrentLevel = 0;

  while (true) {
    const expRequired = level * 100;
    if (expForCurrentLevel + expRequired > totalExp) {
      return {
        level,
        currentExp: totalExp - expForCurrentLevel,
        requiredExp: expRequired,
        title: getLevelTitle(level),
      };
    }
    expForCurrentLevel += expRequired;
    level++;
  }
}

// EXP獲得計算
export function calculateExpGain(totalVolume: number, exerciseCount: number): number {
  // ベースEXP: 種目数 × 10
  const baseExp = exerciseCount * 10;
  // ボリュームボーナス: 1000kgごとに5EXP
  const volumeBonus = Math.floor(totalVolume / 1000) * 5;
  return baseExp + volumeBonus;
}

// レベルに応じた称号
export function getLevelTitle(level: number): string {
  if (level >= 50) return "レジェンド";
  if (level >= 40) return "マスター";
  if (level >= 30) return "エキスパート";
  if (level >= 20) return "アドバンス";
  if (level >= 15) return "インターメディエイト";
  if (level >= 10) return "セミプロ";
  if (level >= 7) return "経験者";
  if (level >= 5) return "中級者";
  if (level >= 3) return "初中級者";
  return "ビギナー";
}

// キャラクターの段階（レベルに応じて変化）
export function getCharacterStage(level: number): number {
  if (level >= 30) return 5;
  if (level >= 20) return 4;
  if (level >= 15) return 3;
  if (level >= 10) return 2;
  if (level >= 5) return 1;
  return 0;
}

// 総ボリューム計算
export function calculateTotalVolume(exercises: Array<{ sets: Array<{ weight: number; reps: number }> }>): number {
  return exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => {
      return setTotal + set.weight * set.reps;
    }, 0);
  }, 0);
}