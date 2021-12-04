import { useState, useCallback } from 'react';

export const useDialog = (defaultValue = false) => {
    const [visible, setVisible] = useState(defaultValue);

    const onToggle = useCallback(() => setVisible((p) => !p), []);
    const onShow = useCallback(() => setVisible(true), []);
    const onClose = useCallback(() => setVisible(false), []);

    return {
        visible,
        onToggle,
        onShow,
        onClose,
    };
};
