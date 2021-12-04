import React from 'react'
import styles from './FriendMessage.module.scss'

const FriendMessage = ({text, name}) => {
    return (
        <div className={styles.root}>
            <span className={styles.text}>{text}</span>
            <span className={styles.name}>{name}</span>
        </div>
    )
}

export default FriendMessage;