/* eslint-disable react/jsx-props-no-spreading */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import App from 'next/app';

import '../styles/styles.scss';
import { SocketContextProvider } from '../context/SocketContext';
import { UserContextProvider } from '../context/UserContext';
import { CallContextProvider } from '../context/CallContext';

const MyApp = (props) => {
    const { Component, pageProps } = props;

    useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);

    return (
        <>
            <Head>
                <title>KURENTO</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            <SocketContextProvider>
                <UserContextProvider>
                    <CallContextProvider>
                        <Component {...pageProps} />
                    </CallContextProvider>
                </UserContextProvider>
            </SocketContextProvider>
        </>
    );
};

MyApp.propTypes = {
    Component: PropTypes.any.isRequired,
    pageProps: PropTypes.object,
};

MyApp.defaultProps = {
    pageProps: {},
};

MyApp.getInitialProps = async (appContext) => ({ ...await App.getInitialProps(appContext) });

export default MyApp;
