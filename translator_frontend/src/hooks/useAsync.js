import { useCallback, useEffect, useRef, useState } from "react";

/**
 * PUBLIC_INTERFACE
 * useAsync - small helper hook to execute an async function with loading/error/data state.
 * It cancels state updates after unmount to avoid React warnings.
 *
 * @param {Function} asyncFn - function returning a promise
 * @param {boolean} immediate - whether to run immediately (default true)
 * @returns {{data:any, error:Error|null, loading:boolean, run:Function, reset:Function}}
 */
export function useAsync(asyncFn, immediate = true) {
  const mountedRef = useRef(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(immediate));

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...args);
        if (mountedRef.current) setData(result);
        return result;
      } catch (e) {
        if (mountedRef.current) setError(e);
        throw e;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [asyncFn]
  );

  useEffect(() => {
    if (!immediate) return;
    run();
  }, [immediate, run]);

  return { data, error, loading, run, reset };
}
