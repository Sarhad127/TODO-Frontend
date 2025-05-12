import React, { useState } from 'react';
import Navbar from './navbar/Navbar';
import Sidebar from './Sidebar';
import { useUser } from '../context/UserContext';

const Layout = ({ children }) => {
    const { updateUserData } = useUser();
    const [currentBoard, setCurrentBoard] = useState(null);

    const handleBoardSelect = async (position) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`https://email-verification-production.up.railway.app/api/boards/${position}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const boardData = await response.json();
                setCurrentBoard(boardData);
                updateUserData();
            }
        } catch (error) {
            console.error('Error selecting board:', error);
        }
    };

    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            if (child.type.name === 'TodoBoard') {
                return React.cloneElement(child, {
                    boardData: currentBoard
                });
            }
        }
        return child;
    });

    return (
        <div className="app">
            <Navbar onBoardSelect={handleBoardSelect} />
            <Sidebar />
            <div className="main-content">
                {childrenWithProps}
            </div>
        </div>
    );
};

export default Layout;