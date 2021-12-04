import React, { useContext, useState } from 'react';
import styles from './IndexPageContainer.module.scss';
import { Button, TextField, Typography } from '@material-ui/core';
import { UserContext } from '../../context/UserContext';
const IndexPageContainer = () => {
    const userContext = useContext(UserContext);
    const [name, setName] = useState('');
    const handleSubmit = async () => {
        if (!name.trim()) {
            return
        }

        await userContext.onSendName(name);
    }

    if (userContext.connectionFailedDialog.visible) {
        return (
            <div className={styles.root}>
                <Typography>Too many users in room</Typography>
            </div>
        )
    }

    return (
        <div className={styles.root}>
            <Typography>Enter your name</Typography>
            <TextField label="Name" variant="outlined" onChange={(e) => setName(e.target.value)} />
            <Button onClick={handleSubmit}>
                Submit
            </Button>
        </div>
    )
}

export default IndexPageContainer;
