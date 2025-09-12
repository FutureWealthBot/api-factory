import React from 'react';
import Header from './components/Header';
import './globals.css';

import { ReactNode } from 'react';
const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <Header />
            <main>{children}</main>
        </div>
    );
};

export default Layout;