import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TodoItem from './TodoItem';

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
    const [, dropTodo] = useDrop({
        accept: ItemType,
        drop: (item) => {
            if (item.column !== columnName) {
                moveTodo(item.index, item.column, columnName);
            }
        },
    });

    const [, dropColumn] = useDrop({
        accept: ColumnType,
        hover: (item) => {
            if (item.index !== index) {
                moveColumn(item.index, index);
                item.index = index;
            }
        },
    });

    const moveTodo = (fromIndex, fromColumn, toColumn) => {
        const updatedColumns = { ...allColumns };
        const [movedTodo] = updatedColumns[fromColumn].tasks.splice(fromIndex, 1);
        updatedColumns[toColumn].tasks.push(movedTodo);
        setAllColumns(updatedColumns);
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
                <h2 onClick={() => changeColumnTitle(columnName)}>
                    <span className="title">{title}</span>
                </h2>

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
                    <TodoItem key={index} index={index} todo={todo} column={columnName} openEditModal={openEditModal} />
                ))}
            </div>

            <button className="add-todo-btn" onClick={() => openNewTodoModal(columnName)}>
                <span>+</span>
            </button>
        </div>
    );
}

export default TodoColumn;
