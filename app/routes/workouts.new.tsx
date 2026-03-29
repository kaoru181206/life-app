import { useState } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { AppLayout } from "~/components/layout/AppLayout";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/Input";
import { useAuth } from "~/hooks/useAuth";
import { useWorkouts } from "~/hooks/useWorkouts";
import { DEFAULT_EXERCISES, CATEGORY_LABELS, calculateExpGain } from "~/lib/constants";
import type { Exercise, WorkoutSet } from "~/lib/types";
// exIdx is unused - removed from map
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "~/lib/firebase";

const CATEGORY_ORDER = ["chest", "back", "shoulders", "arms", "legs", "core", "cardio", "other"];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function NewWorkout() {
  const { profile } = useAuth();
  const { addWorkout } = useWorkouts(profile?.uid);
  const navigate = useNavigate();

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("chest");

  const addExercise = (name: string) => {
    setExercises((prev) => [
      ...prev,
      {
        id: generateId(),
        exerciseName: name,
        sets: [{ reps: 10, weight: 0 }],
      },
    ]);
    setShowExercisePicker(false);
    setCustomExerciseName("");
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? { ...e, sets: [...e.sets, { reps: 10, weight: 0 }] }
          : e
      )
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? { ...e, sets: e.sets.filter((_, i) => i !== setIndex) }
          : e
      )
    );
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: number) => {
    setExercises((prev) =>
      prev.map((e) =>
        e.id === exerciseId
          ? {
              ...e,
              sets: e.sets.map((s, i) =>
                i === setIndex ? { ...s, [field]: value } : s
              ),
            }
          : e
      )
    );
  };

  const handleSave = async () => {
    if (!profile || exercises.length === 0) return;
    setSaving(true);
    try {
      const workoutDate = new Date(date + "T00:00:00");
      const totalVolume = exercises.reduce(
        (sum, e) => sum + e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
        0
      );
      const expGain = calculateExpGain(totalVolume, exercises.length);

      await addWorkout(
        exercises,
        workoutDate,
        duration ? parseInt(duration) : undefined,
        notes || undefined
      );

      // EXP & Level更新
      await updateDoc(doc(db, "users", profile.uid), {
        totalExp: increment(expGain),
      });

      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const grouped = CATEGORY_ORDER.reduce<Record<string, typeof DEFAULT_EXERCISES>>(
    (acc, cat) => {
      acc[cat] = DEFAULT_EXERCISES.filter((e) => e.category === cat);
      return acc;
    },
    {}
  );

  return (
    <AppLayout title="トレーニング記録" showBack>
      <div className="space-y-4">
        {/* 日付・時間 */}
        <Card padding="md">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="日付"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              label="時間 (分)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              min={1}
            />
          </div>
        </Card>

        {/* 種目リスト */}
        {exercises.map((exercise) => (
          <Card key={exercise.id} padding="md">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {exercise.exerciseName}
              </h3>
              <button
                onClick={() => removeExercise(exercise.id)}
                className="text-red-400 hover:text-red-500"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* セットヘッダー */}
            <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span className="col-span-2 text-center">セット</span>
              <span className="col-span-4 text-center">重量 (kg)</span>
              <span className="col-span-4 text-center">回数</span>
              <span className="col-span-2" />
            </div>

            {exercise.sets.map((set, setIdx) => (
              <div key={setIdx} className="mb-2 grid grid-cols-12 items-center gap-2">
                <span className="col-span-2 text-center text-sm font-bold text-orange-500">
                  {setIdx + 1}
                </span>
                <div className="col-span-4">
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(exercise.id, setIdx, "weight", parseFloat(e.target.value) || 0)
                    }
                    min={0}
                    step={0.5}
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(exercise.id, setIdx, "reps", parseInt(e.target.value) || 0)
                    }
                    min={1}
                    className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-center text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  {exercise.sets.length > 1 && (
                    <button
                      onClick={() => removeSet(exercise.id, setIdx)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => addSet(exercise.id)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-orange-300 py-2 text-sm text-orange-500 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              セットを追加
            </button>
          </Card>
        ))}

        {/* 種目追加ボタン */}
        {showExercisePicker ? (
          <Card padding="md">
            <h3 className="mb-3 font-bold text-gray-900 dark:text-white">種目を選択</h3>

            {/* カスタム種目 */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                placeholder="カスタム種目名を入力..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <Button
                size="sm"
                onClick={() => customExerciseName && addExercise(customExerciseName)}
                disabled={!customExerciseName}
              >
                追加
              </Button>
            </div>

            {/* カテゴリタブ */}
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {CATEGORY_ORDER.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* 種目リスト */}
            <div className="grid grid-cols-2 gap-2">
              {grouped[selectedCategory]?.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex.name)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-left text-sm hover:border-orange-400 hover:bg-orange-50 dark:border-gray-600 dark:hover:bg-orange-900/20"
                >
                  {ex.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowExercisePicker(false)}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              キャンセル
            </button>
          </Card>
        ) : (
          <button
            onClick={() => setShowExercisePicker(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-orange-300 py-4 text-sm font-semibold text-orange-500 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            種目を追加
          </button>
        )}

        {/* メモ */}
        <Card padding="md">
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            メモ（任意）
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="今日のトレーニングメモ..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </Card>

        {/* 保存ボタン */}
        <Button
          fullWidth
          size="lg"
          loading={saving}
          disabled={exercises.length === 0}
          onClick={handleSave}
        >
          💾 トレーニングを保存
        </Button>
        {exercises.length === 0 && (
          <p className="text-center text-xs text-gray-500">
            種目を1つ以上追加してください
          </p>
        )}
      </div>
    </AppLayout>
  );
}