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
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                padding: '8px',
                position: 'relative',
                zIndex: isDragging ? 9999 : 1,
            }}
            onClick={() => openEditModal(index, column)}
        >
            {todo.tag?.color && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: 0,
                        width: '10%',
                        height: '10px',
                        backgroundColor: todo.tag.color,
                        borderTopLeftRadius: '2px',
                        borderTopRightRadius: '2px',
                        transform: 'translateY(-50%)',
                    }}
                />
            )}

            <strong>{todo.text}</strong>

            {todo.tag?.text && (
                <div style={{ fontSize: '10px', marginTop: '4px', color: '#666' }}>
                    {todo.tag.text}
                </div>
            )}

            {/*<div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#333' }}>*/}
            {/*    ID: {todo.id} | Column ID: {todo.columnId} | Position: {todo.position}*/}
            {/*</div>*/}
        </div>

    );
}

export default TodoItem;
