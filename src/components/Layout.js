import React from 'react';
import Navbar from './navbar/Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="app">
            <Navbar />
            <Sidebar />
                <div className="main-content">
                    {children}
                </div>
        </div>
    );
};

export default Layout;
