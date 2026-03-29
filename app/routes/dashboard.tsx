import { useNavigate, Link } from "react-router";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AppLayout } from "~/components/layout/AppLayout";
import { Card } from "~/components/ui/Card";
import { CharacterAvatar } from "~/components/ui/CharacterAvatar";
import { useAuth } from "~/hooks/useAuth";
import { useWorkouts } from "~/hooks/useWorkouts";
import { calculateLevelInfo, getCharacterStage } from "~/lib/constants";

export default function Dashboard() {
  const { profile } = useAuth();
  const { workouts } = useWorkouts(profile?.uid);
  const navigate = useNavigate();

  const levelInfo = profile
    ? calculateLevelInfo(profile.totalExp)
    : { level: 1, currentExp: 0, requiredExp: 100, title: "ビギナー" };

  const characterStage = getCharacterStage(levelInfo.level);
  const expPercent = Math.min(
    Math.round((levelInfo.currentExp / levelInfo.requiredExp) * 100),
    100
  );

  const todayWorkouts = workouts.filter((w) => {
    const today = new Date();
    return (
      w.date.getFullYear() === today.getFullYear() &&
      w.date.getMonth() === today.getMonth() &&
      w.date.getDate() === today.getDate()
    );
  });

  const weeklyCount = workouts.filter((w) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return w.date >= weekAgo;
  }).length;

  const totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* グリーティング＆キャラクター */}
        <Card className="bg-gradient-to-br from-orange-500 to-orange-400 text-white" padding="lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-100">
                {format(new Date(), "M月d日 (E)", { locale: ja })}
              </p>
              <h2 className="mt-1 text-xl font-bold">
                こんにちは！{profile?.displayName ?? ""}さん 👋
              </h2>
              <p className="mt-1 text-sm text-orange-100">
                {todayWorkouts.length > 0
                  ? `今日のトレーニング完了！素晴らしい 🔥`
                  : "今日もトレーニングしよう！"}
              </p>
            </div>
            <CharacterAvatar
              stage={characterStage}
              level={levelInfo.level}
              size="md"
              animated={false}
            />
          </div>
        </Card>

        {/* レベル・EXP */}
        <Card padding="md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Lv.{levelInfo.level} {levelInfo.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {levelInfo.currentExp} / {levelInfo.requiredExp} EXP
              </p>
            </div>
            <span className="text-2xl">⚡</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-700"
              style={{ width: `${expPercent}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-gray-500 dark:text-gray-400">
            {expPercent}%
          </p>
        </Card>

        {/* 統計サマリー */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "今週", value: weeklyCount, unit: "回", icon: "📅" },
            {
              label: "総回数",
              value: workouts.length,
              unit: "回",
              icon: "💪",
            },
            {
              label: "総ボリューム",
              value:
                totalVolume >= 1000
                  ? `${(totalVolume / 1000).toFixed(1)}t`
                  : `${totalVolume}`,
              unit: totalVolume >= 1000 ? "" : "kg",
              icon: "🏋️",
            },
          ].map((stat) => (
            <Card key={stat.label} padding="sm" className="text-center">
              <p className="text-lg">{stat.icon}</p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                {stat.value}
                <span className="text-xs font-normal text-gray-500">
                  {stat.unit}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </Card>
          ))}
        </div>

        {/* 今日のトレーニング / クイックアクション */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 dark:text-white">最近の記録</h3>
          <Link
            to="/workouts"
            className="text-sm font-medium text-orange-500 hover:text-orange-600"
          >
            すべて見る
          </Link>
        </div>

        {workouts.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="mb-3 text-4xl">🏋️‍♂️</p>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              まだトレーニング記録がありません
            </p>
            <p className="mt-1 text-sm text-gray-500">
              最初のトレーニングを記録してみましょう！
            </p>
            <button
              onClick={() => navigate("/workouts/new")}
              className="mt-4 rounded-xl bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              記録を始める
            </button>
          </Card>
        ) : (
          <div className="space-y-3">
            {workouts.slice(0, 3).map((workout) => (
              <Link key={workout.id} to={`/workouts/${workout.id}`}>
                <Card padding="md" className="hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {format(workout.date, "M月d日 (E)", { locale: ja })}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {workout.exercises.length}種目 ·{" "}
                        {workout.totalVolume.toLocaleString()}kg
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {workout.exercises.slice(0, 2).map((ex) => (
                          <span
                            key={ex.id}
                            className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
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
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}