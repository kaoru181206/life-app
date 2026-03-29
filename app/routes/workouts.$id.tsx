import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AppLayout } from "~/components/layout/AppLayout";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { useAuth } from "~/hooks/useAuth";
import { useWorkouts } from "~/hooks/useWorkouts";

export default function WorkoutDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { workouts, deleteWorkout } = useWorkouts(profile?.uid);
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const workout = workouts.find((w) => w.id === id);

  if (!workout) {
    return (
      <AppLayout title="トレーニング詳細" showBack>
        <Card padding="lg" className="text-center">
          <p className="text-gray-500">記録が見つかりません</p>
          <Link to="/workouts" className="mt-4 block text-sm text-orange-500">
            一覧に戻る
          </Link>
        </Card>
      </AppLayout>
    );
  }

  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const maxWeight = workout.exercises.reduce((max, e) => {
    const exMax = Math.max(...e.sets.map((s) => s.weight), 0);
    return Math.max(max, exMax);
  }, 0);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteWorkout(id);
      navigate("/workouts");
    } catch {
      alert("削除に失敗しました");
      setDeleting(false);
    }
  };

  const rightAction = (
    <div className="flex gap-2">
      <Link
        to={`/share/${id}`}
        className="flex items-center gap-1 rounded-xl bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        シェア
      </Link>
    </div>
  );

  return (
    <AppLayout title="トレーニング詳細" showBack rightAction={rightAction}>
      <div className="space-y-4">
        {/* サマリーカード */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-400 text-white" padding="lg">
          <p className="text-sm font-medium text-orange-100">
            {format(workout.date, "yyyy年M月d日 (EEEE)", { locale: ja })}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              { label: "種目数", value: workout.exercises.length, unit: "種目" },
              { label: "セット数", value: totalSets, unit: "セット" },
              { label: "総ボリューム", value: workout.totalVolume.toLocaleString(), unit: "kg" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold">
                  {stat.value}
                  <span className="ml-0.5 text-xs font-normal text-orange-100">
                    {stat.unit}
                  </span>
                </p>
                <p className="text-xs text-orange-100">{stat.label}</p>
              </div>
            ))}
          </div>
          {workout.duration && (
            <p className="mt-2 text-center text-xs text-orange-100">
              ⏱️ トレーニング時間: {workout.duration}分
            </p>
          )}
          {maxWeight > 0 && (
            <p className="mt-1 text-center text-xs text-orange-100">
              🏆 最大重量: {maxWeight}kg
            </p>
          )}
        </Card>

        {/* 種目ごとの詳細 */}
        {workout.exercises.map((exercise) => {
          const maxSetWeight = Math.max(...exercise.sets.map((s) => s.weight), 0);
          const exVolume = exercise.sets.reduce(
            (sum, s) => sum + s.weight * s.reps,
            0
          );
          return (
            <Card key={exercise.id} padding="md">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {exercise.exerciseName}
                </h3>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    最大 {maxSetWeight}kg · {exVolume.toLocaleString()}kg vol
                  </p>
                </div>
              </div>

              {/* セットテーブル */}
              <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                        セット
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                        重量
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                        回数
                      </th>
                      <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                        ボリューム
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {exercise.sets.map((set, idx) => (
                      <tr key={idx} className="text-center">
                        <td className="px-3 py-2 font-bold text-orange-500">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {set.weight === 0 ? "自重" : `${set.weight}kg`}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {set.reps}回
                        </td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                          {(set.weight * set.reps).toLocaleString()}kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}

        {/* メモ */}
        {workout.notes && (
          <Card padding="md">
            <h3 className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              📝 メモ
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {workout.notes}
            </p>
          </Card>
        )}

        {/* 削除ボタン */}
        {showDeleteConfirm ? (
          <Card padding="md" className="border-2 border-red-200 dark:border-red-900">
            <p className="mb-3 text-center text-sm font-semibold text-gray-800 dark:text-gray-200">
              このトレーニング記録を削除しますか？
            </p>
            <p className="mb-4 text-center text-xs text-gray-500">
              削除すると元に戻せません
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowDeleteConfirm(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={deleting}
                onClick={handleDelete}
              >
                削除する
              </Button>
            </div>
          </Card>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full text-center text-sm text-red-400 hover:text-red-500"
          >
            この記録を削除する
          </button>
        )}
      </div>
    </AppLayout>
  );
}