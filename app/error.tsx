"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="status-page"><p className="eyebrow">WEDRIP / SOMETHING SHIFTED</p><h1>TRY<br /><i>again.</i></h1><button onClick={reset}>RELOAD THE SCENE →</button></main>; }
