import { useSyncExternalStore } from "react";

// Reports whether the component has hydrated on the client. Implemented
// with useSyncExternalStore (server snapshot false, client snapshot true)
// rather than a useState + useEffect(() => setState(true), []) pair, so
// there is no setState call inside an effect to trip
// react-hooks/set-state-in-effect — the store never actually changes, we
// only need the snapshot to differ between server and client renders. Do
// not "simplify" this back to useState + useEffect; that reintroduces the
// lint violation this hook exists to avoid.
const emptySubscribe = () => () => {};

export function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
