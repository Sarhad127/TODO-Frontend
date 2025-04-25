import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaPlus } from 'react-icons/fa';
import TodoColumn from './TodoColumn';
import { AddColumnModal } from './AddColumnModal';
import { EditModal } from './EditTodoModal';

const TodoBoard = ({ backgroundColor, backgroundImage }) => {
    const [allColumns, setAllColumns] = useState({
        todo: { title: 'To Do', titleColor: '#000000', tasks: [{ text: 'Learn React', color: '#ffffff' }, { text: 'Write Docs', color: '#ffffff' }] },
        working: { title: 'Doing', titleColor: '#000000', tasks: [{ text: 'Fix Bug', color: '#ffffff' }] },
        done: { title: 'Done', titleColor: '#000000', tasks: [] },
    });
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

    const saveChanges = () => {
        const { column, index, isNew, isTitleChange } = selectedTodo;

        if (isTitleChange) {
            setAllColumns({
                ...allColumns,
                [column]: {
                    ...allColumns[column],
                    title: selectedTodo.text,
                    titleColor: selectedTodo.color,
                },
            });
        } else if (isNew) {
            if (!selectedTodo.text.trim()) {
                alert("Todo text cannot be empty!");
                return;
            }
            setAllColumns({
                ...allColumns,
                [column]: {
                    ...allColumns[column],
                    tasks: [...allColumns[column].tasks, { text: selectedTodo.text, color: selectedTodo.color }],
                },
            });
        } else {
            const updatedColumn = [...allColumns[column].tasks];
            updatedColumn[index] = selectedTodo;
            setAllColumns({ ...allColumns, [column]: { ...allColumns[column], tasks: updatedColumn } });
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

    const addNewColumn = async () => {
        if (newColumnTitle.trim()) {
            const newColumn = { title: newColumnTitle, titleColor: '#000000', tasks: [] };

            console.log('Adding new column with title:', newColumnTitle);

            try {
                const response = await fetch('http://localhost:8080/api/columns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newColumn),
                });

                console.log('Response status:', response.status);

                if (response.ok) {
                    const createdColumn = await response.json();
                    console.log('Created column:', createdColumn);

                    setAllColumns((prevColumns) => ({
                        ...prevColumns,
                        [createdColumn.id]: createdColumn,
                    }));
                    setNewColumnTitle('');
                    setShowAddColumnModal(false);
                } else {
                    console.log('Failed to add column. Response:', await response.text());
                    alert('Failed to add column!');
                }
            } catch (error) {
                console.log('Error while adding column:', error);
                alert('Error adding column: ' + error.message);
            }
        } else {
            alert('Column title cannot be empty!');
        }
    };

    const moveColumn = (fromIndex, toIndex) => {
        const columnsArray = Object.keys(allColumns);
        const columnKeys = [...columnsArray];
        const movedColumn = columnKeys.splice(fromIndex, 1);
        columnKeys.splice(toIndex, 0, ...movedColumn);

        const reorderedColumns = {};
        columnKeys.forEach((key) => {
            reorderedColumns[key] = allColumns[key];
        });

        setAllColumns(reorderedColumns);
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