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
                zIndex: isDragging ? 10 : 1,
            }}
            onClick={() => openEditModal(index, column)}
        >
            {todo.tag?.color && (
                <div
                    style={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        width: 40,
                        height: 9,
                        backgroundColor: todo.tag.color,
                        borderRadius: '4px',
                    }}
                />
            )}

            <div style={{ paddingTop: todo.tag?.color ? 12 : 0 }}>
                <strong>{todo.text}</strong>

                {(todo.tag?.text || todo.tag?.avatarInitials || todo.tag?.avatarImageUrl) && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '6px',
                            fontSize: '10px',
                            color: '#666',
                        }}
                    >
                        {(todo.tag.avatarImageUrl || todo.tag.avatarInitials) && (
                            <div
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: '50%',
                                    backgroundColor: todo.tag.avatarBackgroundColor || '#ccc',
                                    backgroundImage: todo.tag.avatarImageUrl ? `url(${todo.tag.avatarImageUrl})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    marginRight: 6,
                                }}
                            >
                                {!todo.tag.avatarImageUrl && todo.tag.avatarInitials}
                            </div>
                        )}
                        {todo.tag.text}
                    </div>
                )}
            </div>
            {/*<div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#333' }}>*/}
            {/*    ID: {todo.id} | Column ID: {todo.columnId} | Position: {todo.position}*/}
            {/*</div>*/}
        </div>

    );
}

export default TodoItem;
