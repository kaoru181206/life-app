import { useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AppLayout } from "~/components/layout/AppLayout";
import { Card } from "~/components/ui/Card";
import { useAuth } from "~/hooks/useAuth";
import { useWorkouts } from "~/hooks/useWorkouts";

export default function WorkoutsIndex() {
  const { profile } = useAuth();
  const { workouts, loading } = useWorkouts(profile?.uid);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = workouts.filter((w) => {
    if (!searchQuery) return true;
    return w.exercises.some((e) =>
      e.exerciseName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // 月ごとにグループ化
  const grouped = filtered.reduce<Record<string, typeof filtered>>(
    (acc, workout) => {
      const key = format(workout.date, "yyyy年M月", { locale: ja });
      if (!acc[key]) acc[key] = [];
      acc[key].push(workout);
      return acc;
    },
    {}
  );

  return (
    <AppLayout title="トレーニング記録">
      <div className="space-y-4">
        {/* 検索バー */}
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="種目名で検索..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : workouts.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="mb-2 text-4xl">🏋️‍♂️</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              まだ記録がありません
            </p>
            <p className="mt-1 text-sm text-gray-500">
              右下の＋ボタンから追加しましょう
            </p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-sm text-gray-500">
              「{searchQuery}」に一致する記録がありません
            </p>
          </Card>
        ) : (
          Object.entries(grouped).map(([month, monthWorkouts]) => (
            <div key={month}>
              <h3 className="mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                {month}
              </h3>
              <div className="space-y-2">
                {monthWorkouts.map((workout) => {
                  const totalSets = workout.exercises.reduce(
                    (sum, e) => sum + e.sets.length,
                    0
                  );
                  return (
                    <Link key={workout.id} to={`/workouts/${workout.id}`}>
                      <Card
                        padding="md"
                        className="hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                              <span className="text-lg">💪</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {format(workout.date, "d日 (E)", { locale: ja })}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {workout.exercises.length}種目 · {totalSets}セット
                                {workout.duration
                                  ? ` · ${workout.duration}分`
                                  : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-orange-500">
                              {workout.totalVolume.toLocaleString()}
                              <span className="text-xs font-normal">kg</span>
                            </p>
                            <div className="mt-1 flex gap-1 justify-end">
                              {workout.exercises.slice(0, 2).map((ex) => (
                                <span
                                  key={ex.id}
                                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {ex.exerciseName}
                                </span>
                              ))}
                              {workout.exercises.length > 2 && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700">
                                  +{workout.exercises.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}