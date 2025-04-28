import React, {useEffect, useState} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaPlus } from 'react-icons/fa';
import TodoColumn from './TodoColumn';
import { AddColumnModal } from './AddColumnModal';
import { EditModal } from './EditTodoModal';
import { useLocation } from 'react-router-dom';

const TodoBoard = ({ backgroundColor, backgroundImage }) => {
    const [allColumns, setAllColumns] = useState({});
    const [selectedTodo, setSelectedTodo] = useState(null);
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');

    const location = useLocation();
    const userData = location.state?.userData;

    useEffect(() => {
        if (userData) {
            const { columns = [], tasks = [] } = userData;

            const formattedColumns = {};
            columns.forEach(column => {
                formattedColumns[`column${column.id}`] = {
                    id: column.id,
                    title: column.title,
                    titleColor: column.titleColor,
                    tasks: [],
                    position: column.placement
                };
            });

            tasks.forEach(task => {
                const columnKey = `column${task.columnId}`;
                if (formattedColumns[columnKey]) {
                    formattedColumns[columnKey].tasks.push({
                        id: task.id,
                        text: task.text,
                        color: task.color,
                        position: task.position
                    });
                }
            });

            Object.keys(formattedColumns).forEach(columnKey => {
                formattedColumns[columnKey].tasks.sort((a, b) => a.position - b.position);
            });

            setAllColumns(formattedColumns);
        }
    }, [userData]);

    const removeColumn = async (columnName) => { /* --------------------- TODO removes columns ---------------------*/
        const columnId = columnName.replace('column', '');
        const updatedColumns = { ...allColumns };
        delete updatedColumns[columnName];

        const columnKeys = Object.keys(updatedColumns);
        columnKeys.forEach((column, index) => {
            updatedColumns[column].position = index + 1;
        });

        setAllColumns(updatedColumns);

        let token = localStorage.getItem('token');
        if (!token) {
            token = sessionStorage.getItem('token');
        }
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/auth/columns/delete/${columnId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                console.log('Column removed successfully');
                await updateColumnPositions(updatedColumns);
            } else {
                console.error('Failed to remove column from backend');
            }
        } catch (error) {
            console.error('Error removing column:', error);
        }
    };

    const updateColumnPositions = async (updatedColumns) => { /* TODO updates column position*/
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');
            const columnsArray = Object.values(updatedColumns);
            const response = await fetch('http://localhost:8080/columns/update-positions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(columnsArray),
            });

            if (!response.ok) {
                throw new Error('Failed to update column positions');
            }

            console.log('Column positions updated successfully');
        } catch (error) {
            console.error('Error updating column positions:', error);
        }
    };

    const openEditModal = (index, column) => {
        setSelectedTodo({ ...allColumns[column].tasks[index], index, column });
    };

    const updateTask = async (taskData) => { /* TODO update a task */
        let token = localStorage.getItem('token');
        if (!token) {
            token = sessionStorage.getItem('token');
        }
        if (!token) {
            console.error('No authentication token found');
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/tasks/update/${taskData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text: taskData.text,
                    color: taskData.color,
                    columnId: taskData.columnId,
                }),
            });

            if (response.ok) {
                console.log('Task updated successfully');
                return await response.json();
            } else {
                console.error('Failed to update task on backend');
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
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

        } else if (isNew) { /* TODO handles new todo task*/
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

            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('token');
            }
            if (!token) {
                console.error('No authentication token found');
                return;
            }

            try {
                const taskData = {
                    text: selectedTodo.text,
                    color: selectedTodo.color,
                    columnId: columnData.id,
                };

                const response = await fetch('http://localhost:8080/tasks/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(taskData),
                });

                if (response.ok) {
                    const newTask = await response.json();
                    console.log('Task created successfully:', newTask);

                    setAllColumns({
                        ...allColumns,
                        [column]: {
                            ...columnData,
                            tasks: [...columnData.tasks, {
                                id: newTask.id,
                                text: selectedTodo.text,
                                color: selectedTodo.color
                            }],
                        },
                    });
                } else {
                    console.error('Failed to create task in backend');
                }
            } catch (error) {
                console.error('Error creating task:', error);
            }

        } else {
            const updatedTask = { ...selectedTodo, columnId: columnData.id };
            const updatedTaskFromBackend = await updateTask(updatedTask);
            if (updatedTaskFromBackend) {
                const updatedColumn = [...columnData.tasks];
                updatedColumn[index] = updatedTaskFromBackend;
                setAllColumns({
                    ...allColumns,
                    [column]: { ...columnData, tasks: updatedColumn },
                });
                console.log('Task updated locally');
            }
        }

        setSelectedTodo(null);
    };

    const deleteTodo = async (todoToDelete) => {
        const { column, index, id } = todoToDelete;
        const updatedColumn = allColumns[column].tasks.filter((_, i) => i !== index);

        setAllColumns({ ...allColumns, [column]: { ...allColumns[column], tasks: updatedColumn } });
        setSelectedTodo(null);

        let token = localStorage.getItem('token');
        if (!token) {
            token = sessionStorage.getItem('token');
        }
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/tasks/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                console.log('Task deleted successfully');
            } else {
                console.error('Failed to delete task from backend');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
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

    const addNewColumn = async () => {  /* --------------------- TODO saves new column to database ---------------------*/
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

    const moveColumn = async (fromIndex, toIndex) => { /* --------------------- TODO updates moved placements ---------------------*/
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