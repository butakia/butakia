export default function CrownIcon({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8.5L7 11L12 4L17 11L21 8.5L19.5 18H4.5L3 8.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect x="4.5" y="19" width="15" height="1.8" rx="0.9" fill="currentColor" />
    </svg>
  );
}
