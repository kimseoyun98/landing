import { useEffect, useRef } from 'react';

const GESTURE_GAP_MS = 80;   // wheel 이벤트가 이 시간 이상 없으면 새 제스처로 인식
const COOLDOWN_MS    = 750;  // step 전환 후 다음 트리거까지 최소 대기 (스프링 완료 대기)

/**
 * 한 번의 끊김 없는 스크롤 = 1 step.
 * - gestureActive 동안 추가 트리거 무시 (연속 wheel 이벤트 → 1회만 발동)
 * - cooldown(750ms) 동안 다음 제스처도 무시 (애니메이션 완료 대기)
 */
export function useScrollStep(
  onDown: () => void,
  onUp:   () => void,
  target: React.RefObject<HTMLElement | null>,
  enabled = true,
) {
  // 핸들러가 바뀌어도 이벤트 리스너 재등록 없이 최신 함수 참조
  const onDownRef = useRef(onDown);
  const onUpRef   = useRef(onUp);
  onDownRef.current = onDown;
  onUpRef.current   = onUp;

  useEffect(() => {
    const el = target.current;
    if (!el || !enabled) return;

    let canFire   = true;   // cooldown 게이트
    let inGesture = false;  // 현재 제스처 진행 중 여부

    let cooldownId: ReturnType<typeof setTimeout>;
    let gestureId:  ReturnType<typeof setTimeout>;

    const startCooldown = () => {
      canFire = false;
      clearTimeout(cooldownId);
      cooldownId = setTimeout(() => { canFire = true; }, COOLDOWN_MS);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (!inGesture) {
        // ─── 새 제스처 시작 ───────────────────────────────────────
        if (canFire) {
          inGesture = true;
          if (e.deltaY > 0) onDownRef.current();
          else               onUpRef.current();
          startCooldown();
        }
      }
      // 제스처 진행 중이거나 cooldown 중이면 무시

      // 마지막 wheel 이벤트로부터 GESTURE_GAP_MS 후 제스처 종료 선언
      clearTimeout(gestureId);
      gestureId = setTimeout(() => { inGesture = false; }, GESTURE_GAP_MS);
    };

    // Touch 지원
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (!canFire) return;
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 40) return;
      if (diff > 0) onDownRef.current();
      else          onUpRef.current();
      startCooldown();
    };

    el.addEventListener('wheel',      handleWheel,      { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend',   handleTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener('wheel',      handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend',   handleTouchEnd);
      clearTimeout(cooldownId);
      clearTimeout(gestureId);
    };
  }, [enabled, target]); // onDown/onUp는 ref로 참조하므로 deps 불필요
}
