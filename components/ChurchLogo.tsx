"use client";

/**
 * 교회 로고 이미지.
 * 원본 로고(peacechurch.kr)를 그대로 쓰되, 그쪽 서버가 응답하지 않을 때만
 * 저장소에 있는 /logo.svg로 대체합니다.
 *
 * onError는 브라우저 이벤트라 서버 컴포넌트에서는 넘길 수 없어
 * 이 작은 클라이언트 컴포넌트로 분리했습니다.
 */
export default function ChurchLogo({
  className = "h-9 w-auto",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="https://peacechurch.kr/UserData/pyunganch/Layouts/pyunganch2025_Layout/Images/1_logo_2.png"
      alt="수원평안교회 PEACE CHURCH"
      className={className}
      onError={(e) => {
        const img = e.currentTarget;
        if (!img.src.endsWith("/logo.svg")) img.src = "/logo.svg";
      }}
    />
  );
}
