import * as React from "react";
import styles from "./ScrollCodeProgress.module.css";

type Props = {
  progress: number;
  code?: string;
}

const DEFAULT_CODE = `function greet(name){const msg=\`Hello, \${name}!\`;return msg.toUpperCase()}const nums=[1,2,3,4,5];const doubled=nums.map(n=>n*2);const total=doubled.reduce((a,b)=>a+b,0);const store=new Map([["a",1],["b",2]]);function memo(fn){const cache=new Map();return(...args)=>{const k=JSON.stringify(args);if(cache.has(k))return cache.get(k);const v=fn(...args);cache.set(k,v);return v;};}const fib=memo(function f(n){return n<2?n:f(n-1)+f(n-2);});console.log(greet("Omar"),total,fib(12));`;

export default function ScrollCodeProgress({ progress, code=DEFAULT_CODE }: Props) {

  const pct = Math.max(0, Math.min(1, progress)) * 100;

  return (
    <div className={styles.codeTrack} aria-hidden="true">
      <div className={styles.codeFill} style={{ width: `${pct}%` }}>
        <pre className={styles.codeOn}>{code}</pre>
      </div>
    </div>
  );
}