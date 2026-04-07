import { Suspense } from "react";
import Search from "./Search";

export default function SearchWithSuspense(props) {
  return (
    <Suspense fallback={<div style={{ opacity: 0.5 }}>Loading search…</div>}>
      <Search {...props} />
    </Suspense>
  );
}
