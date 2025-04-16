import React from 'react';
import { useDrag } from 'react-dnd';

const ItemType = 'TODO';

function TodoItem({ todo, index, column, openEditModal }) {
    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { todo, index, column },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className="todo-item"
            style={{ backgroundColor: todo.color, opacity: isDragging ? 0.5 : 1 }}
            onClick={() => openEditModal(index, column)}
        >
            {todo.text}
        </div>
    );
}

export default TodoItem;