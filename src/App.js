import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaTrash, FaBars } from 'react-icons/fa';
import './App.css';

const ItemType = 'TODO';

// Sidebar Component
function Sidebar({ changeBackgroundColor }) {
  return (
    <div className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><FaBars /> Dashboard</li>
        <li><FaBars /> Settings</li>
        <li><FaBars /> Logout</li>
      </ul>
      <button className="sidebar-btn" onClick={changeBackgroundColor}>Change Background</button>
    </div>
  );
}

// Todo Item Component
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

// Todo Column Component
// Todo Column Component
function TodoColumn({ title, columnName, allColumns, setAllColumns, openEditModal, setSelectedTodo, changeColumnTitle }) {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item) => {
      if (item.column !== columnName) {
        const updatedPrevColumn = Array.isArray(allColumns[item.column].tasks) ? allColumns[item.column].tasks.filter((_, i) => i !== item.index) : [];
        const updatedNewColumn = Array.isArray(allColumns[columnName].tasks) ? [...allColumns[columnName].tasks, item.todo] : [item.todo];

        setAllColumns({
          ...allColumns,
          [item.column]: { ...allColumns[item.column], tasks: updatedPrevColumn },
          [columnName]: { ...allColumns[columnName], tasks: updatedNewColumn },
        });
      }
    },
  });

  // Function to handle adding a new todo
  const openNewTodoModal = (column) => {
    setSelectedTodo({ text: '', color: '#ffffff', column, isNew: true });
  };

  return (
    <div ref={drop} className="todo-column">
      <h2 onClick={() => changeColumnTitle(columnName)} style={{ color: allColumns[columnName].titleColor }}>{title}</h2>
      <div className="todo-list">
        {/* Map through tasks (now it's accessed correctly from allColumns[columnName].tasks) */}
        {allColumns[columnName].tasks.map((todo, index) => (
          <TodoItem key={index} index={index} todo={todo} column={columnName} openEditModal={openEditModal} />
        ))}
      </div>
      {/* Transparent "+" Button to Add New Todo */}
      <button className="add-todo-btn" onClick={() => openNewTodoModal(columnName)}>
        <span>+</span>
      </button>
    </div>
  );
}


// Edit Modal Component for Todo or Column Title
function EditModal({ selectedTodo, setSelectedTodo, saveChanges, deleteTodo, changeColumnTitle }) {
  if (!selectedTodo) return null;

  const isNewTodo = selectedTodo.isNew;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isNewTodo ? 'Add New To-Do' : 'Edit To-Do'}</h2>
        {isNewTodo ? (
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

// Main App Component
function App() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff'); // Default background color
  const [allColumns, setAllColumns] = useState({
    todo: { title: 'To-Do', titleColor: '#000000', tasks: [{ text: 'Learn React', color: '#ffffff' }, { text: 'Write Docs', color: '#ffffff' }] },
    working: { title: 'Working', titleColor: '#000000', tasks: [{ text: 'Fix Bug', color: '#ffffff' }] },
    done: { title: 'Done', titleColor: '#000000', tasks: [] },
  });

  const [selectedTodo, setSelectedTodo] = useState(null);

  const openEditModal = (index, column) => {
    setSelectedTodo({ ...allColumns[column].tasks[index], index, column });
  };

  const saveChanges = () => {
    const { column, index, isNew } = selectedTodo;

    if (isNew) {
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

  const changeColumnTitle = (column) => {
    setSelectedTodo({ text: allColumns[column].title, color: allColumns[column].titleColor, column, isNew: false, isTitleChange: true });
  };

  const updateColumnTitle = () => {
    const { column } = selectedTodo;
    setAllColumns({
      ...allColumns,
      [column]: {
        ...allColumns[column],
        title: selectedTodo.text,
        titleColor: selectedTodo.color,
      },
    });
    setSelectedTodo(null);
  };

  const changeBackgroundColor = () => {
    const colors = ['#ffffff', '#f0f0f0', '#cce7ff', '#ffcccb', '#e6ffcc'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setBackgroundColor(randomColor);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app" style={{ backgroundColor }}>
        <Sidebar changeBackgroundColor={changeBackgroundColor} />
        <div className="main-content">
          <h1>My To-Do App</h1>
          <div className="columns">
            {['todo', 'working', 'done'].map((column) => (
              <TodoColumn 
                key={column} 
                title={allColumns[column].title} 
                todos={allColumns[column].tasks} 
                columnName={column} 
                allColumns={allColumns} 
                setAllColumns={setAllColumns} 
                openEditModal={openEditModal} 
                setSelectedTodo={setSelectedTodo} 
                changeColumnTitle={changeColumnTitle} 
              />
            ))}
          </div>
        </div>
        <EditModal selectedTodo={selectedTodo} setSelectedTodo={setSelectedTodo} saveChanges={saveChanges} deleteTodo={deleteTodo} changeColumnTitle={updateColumnTitle} />
      </div>
    </DndProvider>
  );
}

export default App;
