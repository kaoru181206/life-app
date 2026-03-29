import { useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { CharacterAvatar } from "~/components/ui/CharacterAvatar";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* ヒーローセクション */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        {/* ロゴ＆キャラクター */}
        <div className="mb-6 flex flex-col items-center">
          <CharacterAvatar stage={3} level={15} size="xl" animated />
          <h1 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">
            Fit<span className="text-orange-500">Quest</span>
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            トレーニングでキャラクターを育てよう
          </p>
        </div>

        {/* 特徴 */}
        <div className="mb-10 grid w-full max-w-sm gap-3">
          {[
            { icon: "💪", text: "トレーニングを記録・管理" },
            { icon: "📊", text: "重量・回数をグラフで可視化" },
            { icon: "🎮", text: "レベルアップでキャラクターが成長" },
            { icon: "📸", text: "SNSに投稿用の画像を生成" },
          ].map((feature) => (
            <div
              key={feature.text}
              className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-gray-800"
            >
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTAボタン */}
        <div className="flex w-full max-w-sm flex-col gap-3">
          <Link
            to="/signup"
            className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-orange-600 active:scale-95 transition-all"
          >
            無料で始める
          </Link>
          <Link
            to="/login"
            className="flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            ログイン
          </Link>
        </div>
      </main>

      {/* フッター */}
      <footer className="py-6 text-center text-xs text-gray-400">
        <p>© 2024 FitQuest. All rights reserved.</p>
      </footer>
    </div>
  );
}