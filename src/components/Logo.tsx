import Image from "next/image";

export const Logo = ({ size = 30 }: { size?: number }) => {
  return (
    <Image src="/app-logo.png" alt="app logo" width={size} height={size} />
  );
};
