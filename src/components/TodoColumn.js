import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TodoItem from './TodoItem';
import { ColumnSettingsDropdown } from '../Sidebar';

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
        setSelectedTodo({ text: '', color: '#ffffff', column, isNew: true });
    };

    return (
        <div
            ref={(node) => drag(dropColumn(dropTodo(node)))}
            className="todo-column"
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div className="column-header">
                <h2 onClick={() => changeColumnTitle(columnName)} style={{ color: allColumns[columnName].titleColor }}>
                    {title}
                </h2>
                <ColumnSettingsDropdown columnName={columnName} removeColumn={removeColumn} />
            </div>

            <div className="todo-list">
                {allColumns[columnName].tasks.map((todo, index) => (
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