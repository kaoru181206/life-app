import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "~/lib/firebase";
import type { Workout, Exercise } from "~/lib/types";
import { calculateTotalVolume } from "~/lib/constants";

export function useWorkouts(userId: string | undefined) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(
    async (limitCount = 50) => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, "workouts"),
          where("userId", "==", userId),
          orderBy("date", "desc"),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => {
          const raw = d.data();
          return {
            id: d.id,
            userId: raw.userId,
            date:
              raw.date instanceof Timestamp
                ? raw.date.toDate()
                : new Date(raw.date),
            exercises: raw.exercises ?? [],
            totalVolume: raw.totalVolume ?? 0,
            duration: raw.duration,
            notes: raw.notes,
            createdAt:
              raw.createdAt instanceof Timestamp
                ? raw.createdAt.toDate()
                : new Date(),
          } as Workout;
        });
        setWorkouts(data);
      } catch (e) {
        setError("トレーニングデータの取得に失敗しました");
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const addWorkout = async (
    exercises: Exercise[],
    date: Date,
    duration?: number,
    notes?: string
  ): Promise<string> => {
    if (!userId) throw new Error("ログインが必要です");
    const totalVolume = calculateTotalVolume(exercises);
    const docRef = await addDoc(collection(db, "workouts"), {
      userId,
      date: Timestamp.fromDate(date),
      exercises,
      totalVolume,
      duration: duration ?? null,
      notes: notes ?? null,
      createdAt: serverTimestamp(),
    });
    await fetchWorkouts();
    return docRef.id;
  };

  const updateWorkout = async (
    workoutId: string,
    exercises: Exercise[],
    date: Date,
    duration?: number,
    notes?: string
  ) => {
    const totalVolume = calculateTotalVolume(exercises);
    const docRef = doc(db, "workouts", workoutId);
    await updateDoc(docRef, {
      exercises,
      totalVolume,
      date: Timestamp.fromDate(date),
      duration: duration ?? null,
      notes: notes ?? null,
    });
    await fetchWorkouts();
  };

  const deleteWorkout = async (workoutId: string) => {
    await deleteDoc(doc(db, "workouts", workoutId));
    setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
  };

  // 特定種目の履歴を取得
  const getExerciseHistory = (exerciseName: string) => {
    const history: { date: Date; maxWeight: number; totalVolume: number }[] =
      [];
    for (const workout of workouts) {
      const exercise = workout.exercises.find(
        (e) => e.exerciseName === exerciseName
      );
      if (exercise) {
        const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));
        const vol = exercise.sets.reduce(
          (sum, s) => sum + s.weight * s.reps,
          0
        );
        history.push({
          date: workout.date,
          maxWeight,
          totalVolume: vol,
        });
      }
    }
    return history.reverse();
  };

  // 週次のトレーニング頻度
  const getWeeklyFrequency = () => {
    const now = new Date();
    const weeks: Record<string, number> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const key = `${d.getFullYear()}-W${getWeekNumber(d)}`;
      weeks[key] = 0;
    }
    for (const workout of workouts) {
      const key = `${workout.date.getFullYear()}-W${getWeekNumber(workout.date)}`;
      if (key in weeks) {
        weeks[key]++;
      }
    }
    return Object.entries(weeks).map(([week, count]) => ({ week, count }));
  };

  return {
    workouts,
    loading,
    error,
    fetchWorkouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getExerciseHistory,
    getWeeklyFrequency,
  };
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}