import { useEffect } from 'react';

export default function useSocketHandler(event, handler, subscribe, unsubscribe) {
    useEffect(() => {
        subscribe(event, handler);

        return () => {
            unsubscribe(event, handler);
        };
    }, [handler, subscribe]);
}
