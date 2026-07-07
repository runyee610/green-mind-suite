import { useEffect, useState } from "react";

const KEY = "green-mfg-review-state";
const EVENT = "green-mfg-review-state:change";

export type ReviewStatus = "未推荐" | "审核中" | "已推荐到市级" | "已推荐到国家";

export type ReviewState = {
  pendingCityIds: string[];
  cityConfirmedIds: string[];
  nationalRecommendedIds: string[];
  unrecommendedIds: string[];
};

const empty: ReviewState = {
  pendingCityIds: [],
  cityConfirmedIds: [],
  nationalRecommendedIds: [],
  unrecommendedIds: [],
};

export function readReviewState(): ReviewState {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ReviewState>;
    return {
      pendingCityIds: parsed.pendingCityIds ?? [],
      cityConfirmedIds: parsed.cityConfirmedIds ?? [],
      nationalRecommendedIds: parsed.nationalRecommendedIds ?? [],
      unrecommendedIds: parsed.unrecommendedIds ?? [],
    };
  } catch {
    return empty;
  }
}

export function writeReviewState(next: ReviewState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* noop */
  }
}

export function updateReviewState(mut: (s: ReviewState) => ReviewState) {
  writeReviewState(mut(readReviewState()));
}

export function useReviewState(): ReviewState {
  const [state, setState] = useState<ReviewState>(() => readReviewState());
  useEffect(() => {
    const handler = () => setState(readReviewState());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return state;
}

// derive status for a given record
export function deriveStatus(
  id: string,
  state: ReviewState,
  viewer: "district" | "city" = "district",
): ReviewStatus {
  if (state.nationalRecommendedIds.includes(id)) return "已推荐到国家";
  if (state.pendingCityIds.includes(id)) return "审核中";
  if (state.cityConfirmedIds.includes(id)) {
    return viewer === "city" ? "未推荐" : "已推荐到市级";
  }
  return "未推荐";
}

// whether a record has entered the city pipeline
export function isSubmittedToCity(
  id: string,
  originalStage: string,
  state: ReviewState,
): boolean {
  if (state.nationalRecommendedIds.includes(id)) return true;
  if (state.cityConfirmedIds.includes(id)) return true;
  if (state.pendingCityIds.includes(id)) return true;
  if (state.unrecommendedIds.includes(id)) return false;
  return originalStage === "培育中" || originalStage === "已完成";
}

// mutations
const addTo = (arr: string[], id: string) => (arr.includes(id) ? arr : [...arr, id]);
const removeFrom = (arr: string[], id: string) => arr.filter((x) => x !== id);

export const reviewActions = {
  districtRecommend(id: string) {
    updateReviewState((s) => ({
      pendingCityIds: addTo(s.pendingCityIds, id),
      unrecommendedIds: removeFrom(s.unrecommendedIds, id),
      cityConfirmedIds: removeFrom(s.cityConfirmedIds, id),
      nationalRecommendedIds: removeFrom(s.nationalRecommendedIds, id),
    }));
  },
  districtCancel(id: string) {
    updateReviewState((s) => ({
      ...s,
      pendingCityIds: removeFrom(s.pendingCityIds, id),
      unrecommendedIds: addTo(s.unrecommendedIds, id),
    }));
  },
  cityConfirm(id: string) {
    updateReviewState((s) => ({
      ...s,
      pendingCityIds: removeFrom(s.pendingCityIds, id),
      cityConfirmedIds: addTo(s.cityConfirmedIds, id),
    }));
  },
  cityReturn(id: string) {
    updateReviewState((s) => ({
      pendingCityIds: removeFrom(s.pendingCityIds, id),
      cityConfirmedIds: removeFrom(s.cityConfirmedIds, id),
      nationalRecommendedIds: removeFrom(s.nationalRecommendedIds, id),
      unrecommendedIds: addTo(s.unrecommendedIds, id),
    }));
  },
  cityRecommendNational(id: string) {
    updateReviewState((s) => ({
      ...s,
      pendingCityIds: removeFrom(s.pendingCityIds, id),
      cityConfirmedIds: addTo(s.cityConfirmedIds, id),
      nationalRecommendedIds: addTo(s.nationalRecommendedIds, id),
      unrecommendedIds: removeFrom(s.unrecommendedIds, id),
    }));
  },
  cityCancelNational(id: string) {
    updateReviewState((s) => ({
      ...s,
      nationalRecommendedIds: removeFrom(s.nationalRecommendedIds, id),
    }));
  },
};
