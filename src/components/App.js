import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaPlus } from 'react-icons/fa';
import 'react-calendar/dist/Calendar.css';
import CalendarPage from '../Calender';
import Sidebar from '../Sidebar';
import BackgroundSettingsModal from '../BackgroundSettingsModal';
import TodoColumn from './TodoColumn';
import { AddColumnModal, EditModal } from './Modals';
import '../App.css';

function App() {
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [showBackgroundModal, setShowBackgroundModal] = useState(false);
    const [allColumns, setAllColumns] = useState({
        todo: { title: 'To-Do', titleColor: '#000000', tasks: [{ text: 'Learn React', color: '#ffffff' }, { text: 'Write Docs', color: '#ffffff' }] },
        working: { title: 'Working', titleColor: '#000000', tasks: [{ text: 'Fix Bug', color: '#ffffff' }] },
        done: { title: 'Done', titleColor: '#000000', tasks: [] },
    });
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');

    const removeColumn = (columnName) => {
        const updatedColumns = { ...allColumns };
        delete updatedColumns[columnName];
        setAllColumns(updatedColumns);
    };

    const openEditModal = (index, column) => {
        setSelectedTodo({ ...allColumns[column].tasks[index], index, column });
    };

    const saveChanges = () => {
        const { column, index, isNew, isTitleChange } = selectedTodo;

        if (isTitleChange) {
            setAllColumns({
                ...allColumns,
                [column]: {
                    ...allColumns[column],
                    title: selectedTodo.text,
                    titleColor: selectedTodo.color,
                },
            });
        } else if (isNew) {
            if (!selectedTodo.text.trim()) {
                alert("Todo text cannot be empty!");
                return;
            }
            setAllColumns({
                ...allColumns,
                [column]: {
                    ...allColumns[column],
                    tasks: [...allColumns[column].tasks, { text: selectedTodo.text, color: selectedTodo.color }],
                },
            });
        } else {
            const updatedColumn = [...allColumns[column].tasks];
            updatedColumn[index] = selectedTodo;
            setAllColumns({ ...allColumns, [column]: { ...allColumns[column], tasks: updatedColumn } });
        }
        setSelectedTodo(null);
    };

    const deleteTodo = (todoToDelete) => {
        const { column, index } = todoToDelete;
        const updatedColumn = allColumns[column].tasks.filter((_, i) => i !== index);
        setAllColumns({ ...allColumns, [column]: { ...allColumns[column], tasks: updatedColumn } });
        setSelectedTodo(null);
    };

    const cancelAddTodo = () => {
        setSelectedTodo(null);
    };

    const changeColumnTitle = (column) => {
        setSelectedTodo({
            text: allColumns[column].title,
            color: allColumns[column].titleColor,
            column,
            isNew: false,
            isTitleChange: true,
        });
    };

    const addNewColumn = () => {
        if (newColumnTitle.trim()) {
            const newColumnKey = `column${Object.keys(allColumns).length + 1}`;
            setAllColumns({
                ...allColumns,
                [newColumnKey]: {
                    title: newColumnTitle,
                    titleColor: '#000000',
                    tasks: [],
                },
            });
            setNewColumnTitle('');
            setShowAddColumnModal(false);
        } else {
            alert('Column title cannot be empty!');
        }
    };

    const moveColumn = (fromIndex, toIndex) => {
        const columnsArray = Object.keys(allColumns);
        const columnKeys = [...columnsArray];
        const movedColumn = columnKeys.splice(fromIndex, 1);
        columnKeys.splice(toIndex, 0, ...movedColumn);

        const reorderedColumns = {};
        columnKeys.forEach((key) => {
            reorderedColumns[key] = allColumns[key];
        });

        setAllColumns(reorderedColumns);
    };

    const changeBackgroundColor = (color) => {
        setBackgroundColor(color);
        setBackgroundImage(null);
    };

    const changeBackgroundImage = (imageUrl) => {
        setBackgroundImage(imageUrl);
        setBackgroundColor('transparent');
    };

    const mainContentStyle = {
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <DndProvider backend={HTML5Backend}>
                            <div className="app">
                                <Sidebar changeBackgroundColor={() => setShowBackgroundModal(true)} />
                                <div className="main-content" style={mainContentStyle}>
                                    <h1>Pluto</h1>
                                    <div className="columns">
                                        {Object.keys(allColumns).map((column, index) => (
                                            <TodoColumn
                                                key={column}
                                                title={allColumns[column].title}
                                                columnName={column}
                                                allColumns={allColumns}
                                                setAllColumns={setAllColumns}
                                                openEditModal={openEditModal}
                                                setSelectedTodo={setSelectedTodo}
                                                changeColumnTitle={changeColumnTitle}
                                                removeColumn={removeColumn}
                                                index={index}
                                                moveColumn={moveColumn}
                                            />
                                        ))}
                                        <div
                                            className="todo-column transparent"
                                            onClick={() => setShowAddColumnModal(true)}
                                        >
                                            <FaPlus size={40} />
                                        </div>
                                    </div>
                                </div>
                                {showAddColumnModal && (
                                    <AddColumnModal
                                        setNewColumnTitle={setNewColumnTitle}
                                        saveNewColumn={addNewColumn}
                                        cancelAddColumn={() => setShowAddColumnModal(false)}
                                    />
                                )}
                                {showBackgroundModal && (
                                    <BackgroundSettingsModal
                                        onClose={() => setShowBackgroundModal(false)}
                                        onColorChange={changeBackgroundColor}
                                        onImageUpload={changeBackgroundImage}
                                    />
                                )}
                                <EditModal
                                    selectedTodo={selectedTodo}
                                    setSelectedTodo={setSelectedTodo}
                                    saveChanges={saveChanges}
                                    deleteTodo={deleteTodo}
                                    changeColumnTitle={changeColumnTitle}
                                    cancelAddTodo={cancelAddTodo}
                                />
                            </div>
                        </DndProvider>
                    }
                />
                <Route
                    path="/calendar"
                    element={
                        <div className="app">
                            <Sidebar changeBackgroundColor={() => setShowBackgroundModal(true)} />
                            <div className="main-content" style={mainContentStyle}>
                                <CalendarPage />
                            </div>
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;