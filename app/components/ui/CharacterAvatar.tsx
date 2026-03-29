interface CharacterAvatarProps {
  stage: number; // 0〜5
  level: number;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
}

// レベルステージに応じた色とサイズ
const STAGE_CONFIGS = [
  { // Stage 0: ビギナー
    bodyColor: "#FCD34D",
    accentColor: "#F59E0B",
    equipmentColor: "#E5E7EB",
    muscleScale: 0.7,
  },
  { // Stage 1: 初中級者
    bodyColor: "#FCD34D",
    accentColor: "#F59E0B",
    equipmentColor: "#93C5FD",
    muscleScale: 0.85,
  },
  { // Stage 2: 中級者
    bodyColor: "#FCD34D",
    accentColor: "#F59E0B",
    equipmentColor: "#60A5FA",
    muscleScale: 1.0,
  },
  { // Stage 3: 上級者
    bodyColor: "#FCD34D",
    accentColor: "#F59E0B",
    equipmentColor: "#F97316",
    muscleScale: 1.15,
  },
  { // Stage 4: マスター
    bodyColor: "#FCD34D",
    accentColor: "#F59E0B",
    equipmentColor: "#A855F7",
    muscleScale: 1.3,
  },
  { // Stage 5: レジェンド
    bodyColor: "#FCD34D",
    accentColor: "#F59E0B",
    equipmentColor: "#EF4444",
    muscleScale: 1.45,
  },
];

const SIZE_MAP = {
  sm: 60,
  md: 100,
  lg: 140,
  xl: 180,
};

export function CharacterAvatar({
  stage,
  level,
  size = "md",
  animated = true,
}: CharacterAvatarProps) {
  const config = STAGE_CONFIGS[Math.min(stage, 5)];
  const pixelSize = SIZE_MAP[size];
  const s = config.muscleScale;

  return (
    <div
      className={`inline-flex items-center justify-center ${animated ? "animate-bounce" : ""}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg
        viewBox="0 0 100 120"
        width={pixelSize}
        height={pixelSize * 1.2}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 光輪（高レベル） */}
        {stage >= 4 && (
          <ellipse
            cx="50"
            cy="12"
            rx="18"
            ry="5"
            fill="none"
            stroke={config.equipmentColor}
            strokeWidth="3"
            opacity="0.8"
          />
        )}

        {/* 頭 */}
        <circle cx="50" cy="22" r="16" fill={config.bodyColor} />
        {/* 顔 */}
        <ellipse cx="44" cy="20" rx="2.5" ry="3" fill="#1F2937" />
        <ellipse cx="56" cy="20" rx="2.5" ry="3" fill="#1F2937" />
        {/* 笑顔 */}
        <path
          d="M44 27 Q50 33 56 27"
          stroke="#1F2937"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* ほっぺ */}
        <circle cx="41" cy="24" r="3" fill="#FCA5A5" opacity="0.6" />
        <circle cx="59" cy="24" r="3" fill="#FCA5A5" opacity="0.6" />

        {/* 首 */}
        <rect x="45" y="36" width="10" height="6" rx="3" fill={config.bodyColor} />

        {/* 胴体 */}
        <rect
          x={50 - 15 * s}
          y="42"
          width={30 * s}
          height={28 * s}
          rx="8"
          fill={config.accentColor}
        />

        {/* 胸筋 */}
        {stage >= 1 && (
          <>
            <ellipse
              cx={50 - 6 * s}
              cy={52}
              rx={7 * s}
              ry={5 * s}
              fill={config.bodyColor}
              opacity="0.8"
            />
            <ellipse
              cx={50 + 6 * s}
              cy={52}
              rx={7 * s}
              ry={5 * s}
              fill={config.bodyColor}
              opacity="0.8"
            />
          </>
        )}

        {/* 腹筋 */}
        {stage >= 2 && (
          <>
            {[0, 1, 2].map((i) => (
              <rect
                key={i}
                x={50 - 5 * s}
                y={58 + i * 5}
                width={4 * s}
                height={4}
                rx="1"
                fill={config.bodyColor}
                opacity="0.6"
              />
            ))}
            {[0, 1, 2].map((i) => (
              <rect
                key={i}
                x={50 + 1 * s}
                y={58 + i * 5}
                width={4 * s}
                height={4}
                rx="1"
                fill={config.bodyColor}
                opacity="0.6"
              />
            ))}
          </>
        )}

        {/* 左腕 */}
        <rect
          x={50 - 16 * s - 8}
          y="43"
          width={10 * s}
          height={22 * s}
          rx="5"
          fill={config.accentColor}
        />
        {/* 左二頭筋 */}
        {stage >= 1 && (
          <ellipse
            cx={50 - 13 * s - 5}
            cy={52}
            rx={6 * s}
            ry={4 * s}
            fill={config.bodyColor}
            opacity="0.7"
          />
        )}

        {/* 右腕 */}
        <rect
          x={50 + 6 * s + 8}
          y="43"
          width={10 * s}
          height={22 * s}
          rx="5"
          fill={config.accentColor}
        />
        {/* 右二頭筋 */}
        {stage >= 1 && (
          <ellipse
            cx={50 + 13 * s + 8}
            cy={52}
            rx={6 * s}
            ry={4 * s}
            fill={config.bodyColor}
            opacity="0.7"
          />
        )}

        {/* 左脚 */}
        <rect
          x={50 - 13 * s}
          y={42 + 28 * s - 2}
          width={11 * s}
          height={24 * s}
          rx="5"
          fill={config.accentColor}
        />
        {/* 右脚 */}
        <rect
          x={50 + 2 * s}
          y={42 + 28 * s - 2}
          width={11 * s}
          height={24 * s}
          rx="5"
          fill={config.accentColor}
        />

        {/* 装備（ステージに応じて変化） */}
        {stage >= 1 && (
          // バンダナ
          <rect
            x="34"
            y="10"
            width="32"
            height="8"
            rx="4"
            fill={config.equipmentColor}
            opacity="0.9"
          />
        )}
        {stage >= 3 && (
          // ベルト
          <rect
            x={50 - 16 * s}
            y={42 + 22 * s}
            width={32 * s}
            height={5}
            rx="2"
            fill={config.equipmentColor}
            opacity="0.9"
          />
        )}

        {/* レベルバッジ */}
        <circle cx="82" cy="18" r="11" fill={config.equipmentColor} opacity="0.95" />
        <text
          x="82"
          y="22"
          textAnchor="middle"
          fontSize="8"
          fontWeight="bold"
          fill="white"
        >
          {level}
        </text>
      </svg>
    </div>
  );
}