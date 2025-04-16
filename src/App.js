import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaTrash, FaPlus } from 'react-icons/fa';
import 'react-calendar/dist/Calendar.css';
import CalendarPage from './Calender';
import Sidebar from './Sidebar';
import { ColumnSettingsDropdown } from './Sidebar';
import BackgroundSettingsModal from './BackgroundSettingsModal';
import './App.css';

const ItemType = 'TODO';
const ColumnType = 'COLUMN';

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

function AddColumnModal({ setNewColumnTitle, saveNewColumn, cancelAddColumn }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add New Column</h2>
        <input
          type="text"
          onChange={(e) => setNewColumnTitle(e.target.value)}
          placeholder="Enter new column title"
        />
        <div className="modal-buttons">
          <button onClick={saveNewColumn}>Add Column</button>
          <button className="cancel-btn" onClick={cancelAddColumn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ selectedTodo, setSelectedTodo, saveChanges, deleteTodo, changeColumnTitle, cancelAddTodo }) {
  if (!selectedTodo) return null;

  const isNewTodo = selectedTodo.isNew;
  const isTitleChange = selectedTodo.isTitleChange;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isNewTodo ? 'Add New To-Do' : isTitleChange ? 'Change Column Title' : 'Edit To-Do'}</h2>
        {isTitleChange ? (
          <>
            <input 
              type="text" 
              value={selectedTodo.text} 
              onChange={(e) => setSelectedTodo({ ...selectedTodo, text: e.target.value })}
              placeholder="Enter new column title"
            />
            <input 
              type="color" 
              value={selectedTodo.color} 
              onChange={(e) => setSelectedTodo({ ...selectedTodo, color: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={saveChanges}>Save</button>
              <button className="cancel-btn" onClick={cancelAddTodo}>Cancel</button>
            </div>
          </>
        ) : isNewTodo ? (
          <>
            <input 
              type="text" 
              value={selectedTodo.text} 
              onChange={(e) => setSelectedTodo({ ...selectedTodo, text: e.target.value })}
              placeholder="Enter Todo text"
            />
            <input 
              type="color" 
              value={selectedTodo.color} 
              onChange={(e) => setSelectedTodo({ ...selectedTodo, color: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={saveChanges}>Add</button>
              <button className="cancel-btn" onClick={cancelAddTodo}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <input 
              type="text" 
              value={selectedTodo.text} 
              onChange={(e) => setSelectedTodo({ ...selectedTodo, text: e.target.value })}
            />
            <input 
              type="color" 
              value={selectedTodo.color} 
              onChange={(e) => setSelectedTodo({ ...selectedTodo, color: e.target.value })}
            />
            <div className="modal-buttons">
              <button onClick={saveChanges}>Save</button>
              <button className="delete-btn" onClick={() => deleteTodo(selectedTodo)}>
                <FaTrash /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [allColumns, setAllColumns] = useState({
    todo: { title: 'To-Do', titleColor: '#000000', tasks: [{ text: 'Learn React', color: '#ffffff' }, { text: 'Write Docs', color: '#ffffff' }] },
    working: { title: 'Working', titleColor: '#000000', tasks: [{ text: 'Fix Bug', color: '#ffffff' }] },
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

  const addNewColumn = () => {
    if (newColumnTitle.trim()) {
      const newColumnKey = `column${Object.keys(allColumns).length + 1}`;
      setAllColumns({
        ...allColumns,
        [newColumnKey]: {
          title: newColumnTitle,
          titleColor: '#000000',
          tasks: [],
        },
      });
      setNewColumnTitle('');
      setShowAddColumnModal(false);
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

  const changeBackgroundColor = (color) => {
    setBackgroundColor(color);
    setBackgroundImage(null);
  };

  const changeBackgroundImage = (imageUrl) => {
    setBackgroundImage(imageUrl);
    setBackgroundColor('transparent');
  };

  const mainContentStyle = {
    backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <DndProvider backend={HTML5Backend}>
              <div className="app">
                <Sidebar changeBackgroundColor={() => setShowBackgroundModal(true)} />
                <div className="main-content" style={mainContentStyle}>
                  <h1>Pluto</h1>
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
                      <FaPlus size={40} />
                    </div>
                  </div>
                </div>
                {showAddColumnModal && (
                  <AddColumnModal 
                    setNewColumnTitle={setNewColumnTitle} 
                    saveNewColumn={addNewColumn} 
                    cancelAddColumn={() => setShowAddColumnModal(false)} 
                  />
                )}
                {showBackgroundModal && (
                  <BackgroundSettingsModal 
                    onClose={() => setShowBackgroundModal(false)} 
                    onColorChange={changeBackgroundColor} 
                    onImageUpload={changeBackgroundImage} 
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
          }
        />
        <Route 
          path="/calendar" 
          element={
            <div className="app">
              <Sidebar changeBackgroundColor={() => setShowBackgroundModal(true)} />
              <div className="main-content" style={mainContentStyle}>
                <CalendarPage />
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
