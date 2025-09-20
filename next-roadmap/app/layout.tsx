import React from 'react';
import Header from './components/Header';
import '../styles/globals.css';

import { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <html lang="en">
            <head />
            <body>
                <Header />
                <main>{children}</main>
            </body>
        </html>
    );
};

export default Layout;