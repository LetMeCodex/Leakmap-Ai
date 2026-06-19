'use client';

import React, { useEffect, useState } from 'react';

export default function LiveClock() {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setTime(`${hrs}:${digits(now.getUTCMinutes())}:${digits(now.getUTCSeconds())}`);
    };

    const digits = (n: number) => String(n).padStart(2, '0');

    const updateClock = () => {
      const now = new Date();
      setTime(`${digits(now.getHours())}:${digits(now.getMinutes())}:${digits(now.getSeconds())}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span>LMX {time}</span>;
}
