import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaPlus } from 'react-icons/fa';
import TodoColumn from './TodoColumn';
import { AddColumnModal } from './AddColumnModal';
import { EditModal } from './EditTodoModal';

const TodoBoard = ({ backgroundColor, backgroundImage }) => {
    const [allColumns, setAllColumns] = useState({});
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

    const saveChanges = async () => { /* TODO saves changes made to columns*/
        const { column, index, isNew, isTitleChange } = selectedTodo;
        const columnData = allColumns[column];

        if (isTitleChange) {
            setAllColumns({
                ...allColumns,
                [column]: {
                    ...columnData,
                    title: selectedTodo.text,
                    titleColor: selectedTodo.color,
                },
            });

            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('token');
            }
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            try {
                const response = await fetch(`http://localhost:8080/auth/columns/${columnData.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: selectedTodo.text,
                        titleColor: selectedTodo.color,
                    }),
                });

                if (response.ok) {
                    console.log('Column updated successfully');
                } else {
                    console.error('Failed to update column on backend');
                }
            } catch (error) {
                console.error('Error updating column:', error);
            }

        } else if (isNew) {
            if (!selectedTodo.text.trim()) {
                alert("Todo text cannot be empty!");
                return;
            }
            setAllColumns({
                ...allColumns,
                [column]: {
                    ...columnData,
                    tasks: [...columnData.tasks, { text: selectedTodo.text, color: selectedTodo.color }],
                },
            });
        } else {
            const updatedColumn = [...columnData.tasks];
            updatedColumn[index] = selectedTodo;
            setAllColumns({ ...allColumns, [column]: { ...columnData, tasks: updatedColumn } });
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

    const addNewColumn = async () => {  /*TODO saves new column to database */
        if (newColumnTitle.trim()) {
            const newColumnKey = `column${Object.keys(allColumns).length + 1}`;
            const newColumn = {
                title: newColumnTitle,
                titleColor: '#000000',
                tasks: [],
            };
            setAllColumns({
                ...allColumns,
                [newColumnKey]: newColumn,
            });
            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('token');
            }
            if (!token) {
                console.error('No authentication token found');
                return;
            }
            try {
                const response = await fetch('http://localhost:8080/auth/columns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: newColumnTitle,
                        titleColor: '#000000',
                        tasks: [],}),
                });
                if (response.ok) {
                    const data = await response.json();
                    const backendId = data.id;
                    setAllColumns({
                        ...allColumns,
                        [`column${backendId}`]: {
                            ...newColumn,
                            id: backendId,
                        },
                    });
                    console.log('Column added successfully');
                } else {
                    console.error('Error adding column to backend');
                }
            } catch (error) {
                console.error('Error with API call:', error);
            }
            setNewColumnTitle('');
            setShowAddColumnModal(false);
        } else {
            alert('Column title cannot be empty!');
        }
    };

    const moveColumn = async (fromIndex, toIndex) => { /* TODO updates moved placements*/
        const columnsArray = Object.keys(allColumns);
        const columnKeys = [...columnsArray];
        const movedColumn = columnKeys.splice(fromIndex, 1);
        columnKeys.splice(toIndex, 0, ...movedColumn);

        const reorderedColumns = {};
        columnKeys.forEach((key, index) => {
            reorderedColumns[key] = { ...allColumns[key], placement: index + 1 };
        });

        setAllColumns(reorderedColumns);

        let token = localStorage.getItem('token');
        if (!token) {
            token = sessionStorage.getItem('token');
        }
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/auth/columns/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(
                    columnKeys.map((key, index) => ({
                        title: allColumns[key].title,
                        placement: index + 1,
                    }))
                ),
            });
            if (response.ok) {
                console.log('Columns reordered successfully');
            } else {
                console.error('Error reordering columns in the backend');
            }
        } catch (error) {
            console.error('Error with API call:', error);
        }
    };


    const mainContentStyle = {
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div style={mainContentStyle}>
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
                        <FaPlus size={20} />
                    </div>
                </div>
                {showAddColumnModal && (
                    <AddColumnModal
                        setNewColumnTitle={setNewColumnTitle}
                        saveNewColumn={addNewColumn}
                        cancelAddColumn={() => setShowAddColumnModal(false)}
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
    );
};

export default TodoBoard;