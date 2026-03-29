import { useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "~/components/layout/AppLayout";
import { Card } from "~/components/ui/Card";
import { Button } from "~/components/ui/Button";
import { CharacterAvatar } from "~/components/ui/CharacterAvatar";
import { useAuth } from "~/hooks/useAuth";
import { useWorkouts } from "~/hooks/useWorkouts";
import { calculateLevelInfo, getCharacterStage } from "~/lib/constants";

export default function Profile() {
  const { profile, logout } = useAuth();
  const { workouts } = useWorkouts(profile?.uid);
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const levelInfo = profile
    ? calculateLevelInfo(profile.totalExp)
    : { level: 1, currentExp: 0, requiredExp: 100, title: "ビギナー" };
  const characterStage = getCharacterStage(levelInfo.level);
  const expPercent = Math.min(
    Math.round((levelInfo.currentExp / levelInfo.requiredExp) * 100),
    100
  );

  const totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/");
    } catch {
      setLoggingOut(false);
    }
  };

  // 称号リスト（解放済み）
  const unlockedTitles = [
    { level: 1, title: "ビギナー", unlocked: levelInfo.level >= 1 },
    { level: 3, title: "初中級者", unlocked: levelInfo.level >= 3 },
    { level: 5, title: "中級者", unlocked: levelInfo.level >= 5 },
    { level: 7, title: "経験者", unlocked: levelInfo.level >= 7 },
    { level: 10, title: "セミプロ", unlocked: levelInfo.level >= 10 },
    { level: 15, title: "インターメディエイト", unlocked: levelInfo.level >= 15 },
    { level: 20, title: "アドバンス", unlocked: levelInfo.level >= 20 },
    { level: 30, title: "エキスパート", unlocked: levelInfo.level >= 30 },
    { level: 40, title: "マスター", unlocked: levelInfo.level >= 40 },
    { level: 50, title: "レジェンド", unlocked: levelInfo.level >= 50 },
  ];

  return (
    <AppLayout title="プロフィール">
      <div className="space-y-4">
        {/* キャラクター&プロフィール */}
        <Card padding="lg" className="text-center">
          <div className="flex flex-col items-center">
            <CharacterAvatar
              stage={characterStage}
              level={levelInfo.level}
              size="lg"
              animated
            />
            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">
              {profile?.displayName ?? "ユーザー"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile?.email}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                Lv.{levelInfo.level}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {levelInfo.title}
              </span>
            </div>
          </div>
        </Card>

        {/* EXPバー */}
        <Card padding="md">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
              経験値
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {levelInfo.currentExp} / {levelInfo.requiredExp} EXP
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-700"
              style={{ width: `${expPercent}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Lv.{levelInfo.level}</span>
            <span>{expPercent}%</span>
            <span>Lv.{levelInfo.level + 1}</span>
          </div>
          <p className="mt-1 text-center text-xs text-gray-500">
            次のレベルまで {levelInfo.requiredExp - levelInfo.currentExp} EXP
          </p>
        </Card>

        {/* 統計 */}
        <Card padding="md">
          <h3 className="mb-3 font-bold text-gray-900 dark:text-white">📊 実績</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "総トレーニング", value: workouts.length, unit: "回" },
              {
                label: "総ボリューム",
                value:
                  totalVolume >= 1000
                    ? `${(totalVolume / 1000).toFixed(1)}t`
                    : totalVolume.toLocaleString(),
                unit: totalVolume >= 1000 ? "" : "kg",
              },
              { label: "今月", value: workouts.filter((w) => {
                const now = new Date();
                return w.date.getMonth() === now.getMonth() && w.date.getFullYear() === now.getFullYear();
              }).length, unit: "回" },
              {
                label: "総EXP",
                value: (profile?.totalExp ?? 0).toLocaleString(),
                unit: "EXP",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-700"
              >
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                  <span className="text-xs font-normal text-gray-500">
                    {stat.unit}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* 称号コレクション */}
        <Card padding="md">
          <h3 className="mb-3 font-bold text-gray-900 dark:text-white">
            🏆 称号コレクション
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {unlockedTitles.map((item) => (
              <div
                key={item.title}
                className={`flex items-center gap-2 rounded-xl p-2.5 ${
                  item.unlocked
                    ? "bg-orange-50 dark:bg-orange-900/20"
                    : "bg-gray-50 opacity-40 dark:bg-gray-700"
                }`}
              >
                <span className="text-base">
                  {item.unlocked ? "⭐" : "🔒"}
                </span>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      item.unlocked
                        ? "text-orange-700 dark:text-orange-400"
                        : "text-gray-500"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400">Lv.{item.level}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* EXP獲得の仕組み */}
        <Card padding="md" className="bg-blue-50 dark:bg-blue-900/20">
          <h3 className="mb-2 text-sm font-bold text-blue-700 dark:text-blue-400">
            ⚡ EXP獲得の仕組み
          </h3>
          <ul className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
            <li>• 種目1つにつき +10 EXP</li>
            <li>• ボリューム1,000kgごとに +5 EXP</li>
            <li>• たくさんトレーニングしてレベルアップ！</li>
          </ul>
        </Card>

        {/* ログアウト */}
        {showLogoutConfirm ? (
          <Card padding="md" className="border-2 border-red-200 dark:border-red-900">
            <p className="mb-3 text-center text-sm font-semibold text-gray-800 dark:text-gray-200">
              ログアウトしますか？
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowLogoutConfirm(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="danger"
                fullWidth
                loading={loggingOut}
                onClick={handleLogout}
              >
                ログアウト
              </Button>
            </div>
          </Card>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full text-center text-sm text-red-400 hover:text-red-500"
          >
            ログアウト
          </button>
        )}
      </div>
    </AppLayout>
  );
}