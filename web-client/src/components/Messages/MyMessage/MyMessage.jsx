import React from 'react'
import styles from './MyMessage.module.scss'

const MyMessage = ({ text }) => {
    return (
        <div className={styles.root}>
            <span className={styles.text}>{text}</span>
        </div>
    )
}

export default MyMessage;