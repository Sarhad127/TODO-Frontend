import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import CalendarPage from './calender-page/Calender';
import Sidebar from './Sidebar';
import Login from '../login/Login';
import Register from '../login/Register';
import VerifyEmail from '../login/VerifyEmail';
import NotesPage from './notes-page/NotesPage';
import PrivateRoute from './PrivateRoute';
import TodoBoard from './boards-page/TodoBoard';
import BackgroundManager from './BackgroundManager';
import './calender-page/Calendar.css';
import './boards-page/boards-styles/TodoColumn.css';
import './boards-page/boards-styles/Modals.css';
import './boards-page/boards-styles/TodoItem.css';
import './styles/Sidebar.css';
import OAuth2RedirectHandler from "./OAuth2RedirectHandler";

function App() {
    return (
        <BrowserRouter>
            <BackgroundManager>
                {({ backgroundStyle, setShowBackgroundModal, BackgroundSettingsModal }) => (
                    <Routes>
                        <Route
                            path="/notes"
                            element={<NotesPage />}
                        />
                        <Route
                            path="/home"
                            element={
                                <PrivateRoute>
                                    <div className="app">
                                        <Sidebar changeBackgroundColor={() => setShowBackgroundModal(true)} />
                                        <TodoBoard
                                            backgroundColor={backgroundStyle.backgroundColor}
                                            backgroundImage={backgroundStyle.backgroundImage}
                                        />
                                        {BackgroundSettingsModal}
                                    </div>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/auth/login"
                            element={<Login />}
                        />
                        <Route
                            path="/auth/register"
                            element={<Register />}
                        />
                        <Route
                            path="/auth/verify-email"
                            element={<VerifyEmail />}
                        />
                        <Route
                            path="/oauth2/redirect"
                            element={<OAuth2RedirectHandler />}
                        />
                        <Route
                            path="/calendar"
                            element={
                                <PrivateRoute>
                                    <div className="app">
                                        <Sidebar changeBackgroundColor={() => setShowBackgroundModal(true)} />
                                        <div className="main-content" style={backgroundStyle}>
                                            <CalendarPage />
                                        </div>
                                        {BackgroundSettingsModal}
                                    </div>
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                )}
            </BackgroundManager>
        </BrowserRouter>
    );
}

export default App;