import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-calendar/dist/Calendar.css';
import CalendarPage from './calender-page/Calender';
import Login from '../login/Login';
import Register from '../login/Register';
import VerifyEmail from '../login/VerifyEmail';
import NotesPage from './notes-page/NotesPage';
import PrivateRoute from './PrivateRoute';
import TodoBoard from './boards-page/TodoBoard';
import BackgroundManager from './BackgroundManager';
import Layout from './Layout';
import OAuth2RedirectHandler from './OAuth2RedirectHandler';
import './calender-page/Calendar.css';
import './boards-page/boards-styles/TodoColumn.css';
import './boards-page/boards-styles/Modals.css';
import './boards-page/boards-styles/TodoItem.css';
import './styles/Sidebar.css';
import ProfilePage from './profile-page/Profile';
import { UserProvider } from '../context/UserContext';
import InvitationAcceptPage from "./InvitationAcceptPage";
import SchedulePage from "./schedule/Schedule";

function App() {
    return (
        <UserProvider>
            <BrowserRouter>
                <BackgroundManager>
                    {() => (
                        <DndProvider backend={HTML5Backend}>
                            <Routes>
                                <Route
                                    path="/notes"
                                    element={
                                        <PrivateRoute>
                                        <Layout>
                                            <NotesPage />
                                        </Layout>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <PrivateRoute>
                                            <Layout>
                                                <ProfilePage />
                                            </Layout>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/home"
                                    element={
                                        <PrivateRoute>
                                            <Layout>
                                                <TodoBoard />
                                            </Layout>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/calendar"
                                    element={
                                        <PrivateRoute>
                                            <Layout>
                                                <CalendarPage />
                                            </Layout>
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/schedule"
                                    element={
                                        <PrivateRoute>
                                            <Layout>
                                                <SchedulePage />
                                            </Layout>
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
                                    path="/accept-invitation"
                                    element={<InvitationAcceptPage />}
                                />
                            </Routes>
                        </DndProvider>
                    )}
                </BackgroundManager>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;