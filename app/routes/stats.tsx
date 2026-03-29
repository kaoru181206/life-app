import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { AppLayout } from "~/components/layout/AppLayout";
import { Card } from "~/components/ui/Card";
import { useAuth } from "~/hooks/useAuth";
import { useWorkouts } from "~/hooks/useWorkouts";
import { DEFAULT_EXERCISES } from "~/lib/constants";

type TabType = "volume" | "exercise" | "frequency";

export default function Stats() {
  const { profile } = useAuth();
  const { workouts, getExerciseHistory, getWeeklyFrequency } = useWorkouts(
    profile?.uid
  );
  const [activeTab, setActiveTab] = useState<TabType>("volume");
  const [selectedExercise, setSelectedExercise] = useState(
    DEFAULT_EXERCISES[0].name
  );

  // 直近30日のボリュームデータ
  const volumeData = workouts
    .slice(0, 30)
    .reverse()
    .map((w) => ({
      date: format(w.date, "M/d", { locale: ja }),
      ボリューム: w.totalVolume,
    }));

  // 選択種目の履歴
  const exerciseHistory = getExerciseHistory(selectedExercise).map((h) => ({
    date: format(h.date, "M/d", { locale: ja }),
    最大重量: h.maxWeight,
    ボリューム: h.totalVolume,
  }));

  // 週次頻度
  const weeklyData = getWeeklyFrequency().map((w) => ({
    week: w.week.replace(/^\d{4}-/, ""),
    回数: w.count,
  }));

  // 月別統計
  const monthlyStats = workouts.reduce<
    Record<string, { count: number; volume: number }>
  >((acc, w) => {
    const key = format(w.date, "yyyy/MM", { locale: ja });
    if (!acc[key]) acc[key] = { count: 0, volume: 0 };
    acc[key].count++;
    acc[key].volume += w.totalVolume;
    return acc;
  }, {});

  // よく行う種目トップ5
  const exerciseCount = workouts.reduce<Record<string, number>>((acc, w) => {
    w.exercises.forEach((e) => {
      acc[e.exerciseName] = (acc[e.exerciseName] || 0) + 1;
    });
    return acc;
  }, {});
  const topExercises = Object.entries(exerciseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const TABS: { id: TabType; label: string }[] = [
    { id: "volume", label: "ボリューム" },
    { id: "exercise", label: "種目別" },
    { id: "frequency", label: "頻度" },
  ];

  return (
    <AppLayout title="統計">
      <div className="space-y-4">
        {/* タブ */}
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-orange-600 shadow dark:bg-gray-700 dark:text-orange-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ボリュームタブ */}
        {activeTab === "volume" && (
          <>
            <Card padding="md">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">
                総ボリューム推移（直近）
              </h3>
              {volumeData.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ボリューム"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={{ fill: "#f97316", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                  データが不足しています（2件以上必要）
                </div>
              )}
            </Card>

            {/* 月別サマリー */}
            <Card padding="md">
              <h3 className="mb-3 font-bold text-gray-900 dark:text-white">
                月別まとめ
              </h3>
              {Object.keys(monthlyStats).length === 0 ? (
                <p className="text-sm text-gray-500">データがありません</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(monthlyStats)
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .slice(0, 6)
                    .map(([month, stats]) => (
                      <div
                        key={month}
                        className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-700"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {month}
                        </span>
                        <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>{stats.count}回</span>
                          <span>{stats.volume.toLocaleString()}kg</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* 種目別タブ */}
        {activeTab === "exercise" && (
          <>
            {/* 種目選択 */}
            <Card padding="md">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                種目を選択
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-orange-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {DEFAULT_EXERCISES.map((ex) => (
                  <option key={ex.id} value={ex.name}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </Card>

            <Card padding="md">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">
                {selectedExercise} - 最大重量推移
              </h3>
              {exerciseHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={exerciseHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="最大重量"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={{ fill: "#f97316", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                  {exerciseHistory.length === 0
                    ? "この種目のデータがありません"
                    : "データが不足しています（2件以上必要）"}
                </div>
              )}
            </Card>

            {/* よく行う種目 */}
            <Card padding="md">
              <h3 className="mb-3 font-bold text-gray-900 dark:text-white">
                よく行う種目 TOP5
              </h3>
              {topExercises.length === 0 ? (
                <p className="text-sm text-gray-500">データがありません</p>
              ) : (
                <div className="space-y-2">
                  {topExercises.map(([name, count], idx) => (
                    <div key={name} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                          idx === 0
                            ? "bg-yellow-400"
                            : idx === 1
                            ? "bg-gray-400"
                            : idx === 2
                            ? "bg-orange-400"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                        {name}
                      </span>
                      <span className="text-sm font-bold text-orange-500">
                        {count}回
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* 頻度タブ */}
        {activeTab === "frequency" && (
          <>
            <Card padding="md">
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">
                週別トレーニング回数
              </h3>
              {weeklyData.some((d) => d.回数 > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 9 }} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="回数" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                  データがありません
                </div>
              )}
            </Card>

            {/* 連続記録 */}
            <Card padding="md">
              <h3 className="mb-3 font-bold text-gray-900 dark:text-white">
                現在の統計
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "総トレーニング数",
                    value: workouts.length,
                    unit: "回",
                    icon: "💪",
                  },
                  {
                    label: "今月",
                    value: workouts.filter((w) => {
                      const now = new Date();
                      return (
                        w.date.getMonth() === now.getMonth() &&
                        w.date.getFullYear() === now.getFullYear()
                      );
                    }).length,
                    unit: "回",
                    icon: "📅",
                  },
                  {
                    label: "今週",
                    value: workouts.filter((w) => {
                      const now = new Date();
                      const weekAgo = new Date(
                        now.getTime() - 7 * 24 * 60 * 60 * 1000
                      );
                      return w.date >= weekAgo;
                    }).length,
                    unit: "回",
                    icon: "🔥",
                  },
                  {
                    label: "種目数",
                    value: Object.keys(exerciseCount).length,
                    unit: "種目",
                    icon: "🏋️",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-gray-50 p-3 text-center dark:bg-gray-700"
                  >
                    <p className="text-xl">{stat.icon}</p>
                    <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
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
          </>
        )}
      </div>
    </AppLayout>
  );
}