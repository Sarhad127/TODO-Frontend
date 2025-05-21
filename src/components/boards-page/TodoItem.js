import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'TODO';

function isToday(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateOnly.getTime() === todayOnly.getTime();
}

function TodoItem({ todo, index, column, openEditModal, moveTodoWithinColumn }) {
    const ref = useRef(null);
    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { type: ItemType, index, column },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });
    const dueToday = isToday(todo.dueDate);
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
                border: dueToday ? '2px solid red' : 'none',
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
            {/*{dueToday && (*/}
            {/*    <div*/}
            {/*        style={{*/}
            {/*            position: 'absolute',*/}
            {/*            top: 4,*/}
            {/*            right: 4,*/}
            {/*            width: 12,*/}
            {/*            height: 12,*/}
            {/*            backgroundColor: 'red',*/}
            {/*            borderRadius: '50%',*/}
            {/*            border: '2px solid white',*/}
            {/*        }}*/}
            {/*        title="Due today"*/}
            {/*    />*/}
            {/*)}*/}
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
            {todo.dueDate && (
                <div
                    style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: dueToday ? 'black' : '#999',
                        fontWeight: dueToday ? 'bold' : 'normal',
                        textAlign: 'right',
                    }}
                    title={`Due date: ${new Date(todo.dueDate).toLocaleDateString()}`}
                >
                    {new Date(todo.dueDate).toLocaleDateString()}
                </div>
            )}

            {/*<div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#333' }}>*/}
            {/*    ID: {todo.id} | Column ID: {todo.columnId} | Position: {todo.position}*/}
            {/*</div>*/}

        </div>

    );
}

export default TodoItem;
