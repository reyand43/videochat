import { useState, useCallback } from 'react';

export const useBool = (defaultValue = false) => {
    const [value, setValue] = useState(defaultValue);

    const onToggle = useCallback(() => setValue((p) => !p), []);
    const onTrue = useCallback(() => setValue(true), []);
    const onFalse = useCallback(() => setValue(false), []);

    return {
        value,
        onToggle,
        onTrue,
        onFalse,
        onChange: setValue,
    };
};
