import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'TODO';

function TodoItem({ todo, index, column, openEditModal, moveTodoWithinColumn }) {
    const ref = useRef(null);
    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { type: ItemType, index, column },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop({
        accept: ItemType,
        hover(item, monitor) {
            if (!ref.current) return;
            if (item.column !== column) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
            moveTodoWithinColumn(dragIndex, hoverIndex, column);
            item.index = hoverIndex;
        }
    });
    drag(drop(ref));
    return (
        <div
            ref={ref}
            className="todo-item"
            style={{
                backgroundColor: todo.color,
                opacity: isDragging ? 0.5 : 1,
                cursor: 'move',
                transition: 'transform 0.2s ease',
                padding: '8px',
                zIndex: isDragging ? 9999 : 1,
            }}
            onClick={() => openEditModal(index, column)}
        >
            <strong>{todo.text}</strong>
            {/*<div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#333' }}>*/}
            {/*    ID: {todo.id} | Column ID: {todo.columnId} | Position: {todo.position}*/}
            {/*</div>*/}
        </div>
    );
}

export default TodoItem;
