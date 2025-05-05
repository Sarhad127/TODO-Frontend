import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TodoItem from './TodoItem';
import {useUser} from "../../context/UserContext";

const ItemType = 'TODO';
const ColumnType = 'COLUMN';

function TodoColumn({
                        title,
                        columnName,
                        allColumns,
                        setAllColumns,
                        openEditModal,
                        setSelectedTodo,
                        changeColumnTitle,
                        removeColumn,
                        index,
                        moveColumn
                    }) {

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const { userData } = useUser();

    const handleTitleSave = async () => {
        setIsEditingTitle(false);
        const trimmedTitle = editedTitle.trim();
        if (!trimmedTitle || trimmedTitle === title) return;

        const columnData = allColumns[columnName];
        const updatedColumns = {
            ...allColumns,
            [columnName]: {
                ...columnData,
                title: trimmedTitle,
            },
        };
        setAllColumns(updatedColumns);

        let token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        try {
            const boardId = userData?.boardId;
            if (!boardId) {
                console.error('Board ID not found in user data');
                return;
            }

            const response = await fetch(
                `http://localhost:8080/auth/boards/${boardId}/columns/${columnData.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: trimmedTitle,
                        titleColor: columnData.titleColor,
                    }),
                }
            );

            if (response.ok) {
                console.log('Column title updated successfully');
            } else {
                console.error('Failed to update column title on backend');
                setAllColumns(allColumns);
            }
        } catch (error) {
            console.error('Error updating column title:', error);
            setAllColumns(allColumns);
        }
    };

    const [, dropTodo] = useDrop({
        accept: ItemType,
        drop: (item) => {
            if (item.column !== columnName) {
                moveTodo(item.index, item.column, columnName);
            }
        },
    });

    const moveTodoWithinColumn = async (fromIndex, toIndex, column) => { /* TODO moves task within same column */
        const updatedColumns = { ...allColumns };
        const columnTasks = [...updatedColumns[column].tasks];
        const [movedTodo] = columnTasks.splice(fromIndex, 1);
        columnTasks.splice(toIndex, 0, movedTodo);
        const columnId = updatedColumns[column].id;
        const tasksWithNewPositions = columnTasks.map((task, index) => ({
            ...task,
            position: index + 1,
            columnId: columnId,
        }));

        updatedColumns[column].tasks = tasksWithNewPositions;
        setAllColumns(updatedColumns);

        console.log('Tasks to be sent:', tasksWithNewPositions);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch('http://localhost:8080/tasks/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },

                body: JSON.stringify(tasksWithNewPositions.map(task => ({
                    id: task.id,
                    text: task.text,
                    color: task.color,
                    columnId: task.columnId,
                    position: task.position
                })))
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to reorder tasks');
            }
        } catch (error) {
            console.error('Error updating task position:', error);
            setAllColumns(allColumns);
        }
    };

    const [, dropColumn] = useDrop({
        accept: ColumnType,
        hover: (item) => {
            if (item.index !== index) {
                moveColumn(item.index, index);
                item.index = index;
            }
        },
    });

    const moveTodo = async (fromIndex, fromColumn, toColumn) => {
        const updatedColumns = { ...allColumns };

        const [movedTodo] = updatedColumns[fromColumn].tasks.splice(fromIndex, 1);

        const newColumnId = updatedColumns[toColumn].id;
        movedTodo.columnId = newColumnId;

        updatedColumns[toColumn].tasks.push(movedTodo);

        updatedColumns[fromColumn].tasks = updatedColumns[fromColumn].tasks.map((task, index) => ({
            ...task,
            position: index + 1,
        }));
        updatedColumns[toColumn].tasks = updatedColumns[toColumn].tasks.map((task, index) => ({
            ...task,
            position: index + 1,
        }));

        setAllColumns(updatedColumns);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const taskId = movedTodo.id;

            const response = await fetch(`http://localhost:8080/tasks/move/${taskId}?newColumnId=${newColumnId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to move task');
            }

            console.log('Task moved successfully');
        } catch (error) {
            console.error('Error moving task:', error);
            setAllColumns(allColumns);
        }
    };

    const [{ isDragging }, drag] = useDrag({
        type: ColumnType,
        item: { index, columnName },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const openNewTodoModal = (column) => {
        setSelectedTodo({
            text: '',
            color: '#ffffff',
            column,
            columnId: allColumns[column].id,
            isNew: true,
        });
    };


    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setShowDropdown(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tasks = allColumns[columnName]?.tasks || [];

    return (
        <div
            ref={(node) => drag(dropColumn(dropTodo(node)))}
            className="todo-column"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div className="column-header">
                {isEditingTitle ? (
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleTitleSave}
                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                        autoFocus
                        className="edit-title-input"
                    />
                ) : (
                    <h2 onClick={() => setIsEditingTitle(true)}>
                        <span className="title">{title}</span>
                    </h2>
                )}

                <div className="column-settings-wrapper" ref={dropdownRef}>
                    <button className="column-settings-btn" onClick={toggleDropdown}>
                        <span>⋯</span>
                    </button>
                    {showDropdown && (
                        <div className="column-settings-dropdown-menu">
                            <button onClick={() => changeColumnTitle(columnName)}>Edit Title</button>
                            <button onClick={() => removeColumn(columnName)}>Delete Column</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="todo-list">
                {tasks.map((todo, index) => (
                    <TodoItem
                        key={todo.id || index}
                        index={index}
                        todo={todo}
                        column={columnName}
                        openEditModal={openEditModal}
                        moveTodoWithinColumn={moveTodoWithinColumn}
                    />
                ))}
            </div>

            <button className="add-todo-btn" onClick={() => openNewTodoModal(columnName)}>
                <span>+</span>
            </button>
        </div>
    );
}

export default TodoColumn;
