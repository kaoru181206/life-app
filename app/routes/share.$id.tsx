import { useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { toPng } from "html-to-image";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AppLayout } from "~/components/layout/AppLayout";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { CharacterAvatar } from "~/components/ui/CharacterAvatar";
import { useAuth } from "~/hooks/useAuth";
import { useWorkouts } from "~/hooks/useWorkouts";
import { calculateLevelInfo, getCharacterStage } from "~/lib/constants";

const THEMES = [
  { id: "orange", label: "オレンジ", bg: "from-orange-500 to-orange-400", text: "white" },
  { id: "dark", label: "ダーク", bg: "from-gray-900 to-gray-800", text: "white" },
  { id: "blue", label: "ブルー", bg: "from-blue-600 to-blue-500", text: "white" },
  { id: "green", label: "グリーン", bg: "from-emerald-600 to-emerald-500", text: "white" },
];

export default function ShareWorkout() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { workouts } = useWorkouts(profile?.uid);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  const workout = workouts.find((w) => w.id === id);

  const levelInfo = profile
    ? calculateLevelInfo(profile.totalExp)
    : { level: 1, currentExp: 0, requiredExp: 100, title: "ビギナー" };
  const characterStage = getCharacterStage(levelInfo.level);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `fitquest-${id?.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("画像の生成に失敗しました");
    } finally {
      setDownloading(false);
    }
  };

  if (!workout) {
    return (
      <AppLayout title="シェア" showBack>
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

  return (
    <AppLayout title="SNSシェア" showBack>
      <div className="space-y-4">
        {/* テーマ選択 */}
        <Card padding="md">
          <h3 className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">
            テーマを選択
          </h3>
          <div className="flex gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`h-8 w-8 rounded-full bg-gradient-to-br ${theme.bg} border-2 transition-all ${
                  selectedTheme.id === theme.id
                    ? "border-orange-500 scale-110"
                    : "border-transparent"
                }`}
              />
            ))}
          </div>
        </Card>

        {/* シェア用カード（画像生成ターゲット） */}
        <div ref={cardRef} className="overflow-hidden rounded-2xl">
          <div className={`bg-gradient-to-br ${selectedTheme.bg} p-6`}>
            {/* ヘッダー */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium opacity-80" style={{ color: selectedTheme.text }}>
                  {format(workout.date, "yyyy年M月d日 (E)", { locale: ja })}
                </p>
                <h2 className="text-xl font-bold" style={{ color: selectedTheme.text }}>
                  💪 トレーニング完了！
                </h2>
              </div>
              <CharacterAvatar
                stage={characterStage}
                level={levelInfo.level}
                size="sm"
                animated={false}
              />
            </div>

            {/* ユーザー情報 */}
            <div className="mb-4 flex items-center gap-2">
              <div
                className="rounded-lg px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: selectedTheme.text,
                }}
              >
                {profile?.displayName ?? "ユーザー"}
              </div>
              <div
                className="rounded-lg px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  color: selectedTheme.text,
                }}
              >
                Lv.{levelInfo.level} {levelInfo.title}
              </div>
            </div>

            {/* 統計 */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { label: "種目", value: workout.exercises.length, unit: "種目" },
                { label: "セット", value: totalSets, unit: "set" },
                {
                  label: "ボリューム",
                  value: workout.totalVolume >= 1000
                    ? `${(workout.totalVolume / 1000).toFixed(1)}t`
                    : workout.totalVolume,
                  unit: workout.totalVolume >= 1000 ? "" : "kg",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl py-3 text-center"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <p className="text-xl font-black" style={{ color: selectedTheme.text }}>
                    {stat.value}
                    <span className="text-xs font-normal opacity-80">{stat.unit}</span>
                  </p>
                  <p className="text-xs opacity-80" style={{ color: selectedTheme.text }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* 種目リスト */}
            <div className="mb-4 space-y-1.5">
              {workout.exercises.slice(0, 4).map((exercise) => {
                const maxSetWeight = Math.max(...exercise.sets.map((s) => s.weight), 0);
                return (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: selectedTheme.text }}
                    >
                      {exercise.exerciseName}
                    </span>
                    <span className="text-xs opacity-80" style={{ color: selectedTheme.text }}>
                      {exercise.sets.length}set
                      {maxSetWeight > 0 ? ` · MAX ${maxSetWeight}kg` : ""}
                    </span>
                  </div>
                );
              })}
              {workout.exercises.length > 4 && (
                <p
                  className="text-center text-xs opacity-70"
                  style={{ color: selectedTheme.text }}
                >
                  +{workout.exercises.length - 4}種目
                </p>
              )}
            </div>

            {/* フッター */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold opacity-70" style={{ color: selectedTheme.text }}>
                #FitQuest #筋トレ
              </p>
              <p className="text-xs font-bold opacity-70" style={{ color: selectedTheme.text }}>
                FitQuest 💪
              </p>
            </div>
          </div>
        </div>

        {/* ダウンロードボタン */}
        <Button fullWidth size="lg" loading={downloading} onClick={handleDownload}>
          📥 画像をダウンロード
        </Button>

        {/* シェアヒント */}
        <Card padding="md" className="bg-orange-50 dark:bg-orange-900/20">
          <h3 className="mb-2 text-sm font-bold text-orange-700 dark:text-orange-400">
            📸 シェアの方法
          </h3>
          <ol className="list-decimal pl-4 text-xs text-orange-600 dark:text-orange-400 space-y-1">
            <li>「画像をダウンロード」ボタンを押す</li>
            <li>カメラロールに保存された画像をSNSにアップ</li>
            <li>#FitQuest #筋トレ などのタグをつけてシェア！</li>
          </ol>
        </Card>
      </div>
    </AppLayout>
  );
}