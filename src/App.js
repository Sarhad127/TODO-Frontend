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
      <button className="color-btn" onClick={changeBackgroundColor}>Change Background</button>
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
function TodoColumn({ title, todos, columnName, allColumns, setAllColumns, openEditModal }) {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item) => {
      if (item.column !== columnName) {
        const updatedPrevColumn = allColumns[item.column].filter((_, i) => i !== item.index);
        const updatedNewColumn = [...todos, item.todo];

        setAllColumns({
          ...allColumns,
          [item.column]: updatedPrevColumn,
          [columnName]: updatedNewColumn,
        });
      }
    },
  });

  return (
    <div ref={drop} className="todo-column">
      <h2>{title}</h2>
      <div className="todo-list">
        {todos.map((todo, index) => (
          <TodoItem key={index} index={index} todo={todo} column={columnName} openEditModal={openEditModal} />
        ))}
      </div>
    </div>
  );
}

// Edit Modal Component
function EditModal({ selectedTodo, setSelectedTodo, saveChanges, deleteTodo }) {
  if (!selectedTodo) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Edit To-Do</h2>
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
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [backgroundColor, setBackgroundColor] = useState('#ffffff'); // Default background color
  const [allColumns, setAllColumns] = useState({
    todo: [{ text: 'Learn React', color: '#ffffff' }, { text: 'Write Docs', color: '#ffffff' }],
    working: [{ text: 'Fix Bug', color: '#ffffff' }],
    done: [],
  });

  const [selectedTodo, setSelectedTodo] = useState(null);

  const openEditModal = (index, column) => {
    setSelectedTodo({ ...allColumns[column][index], index, column });
  };

  const saveChanges = () => {
    const { column, index } = selectedTodo;
    const updatedColumn = [...allColumns[column]];
    updatedColumn[index] = selectedTodo;
    setAllColumns({ ...allColumns, [column]: updatedColumn });
    setSelectedTodo(null);
  };

  const deleteTodo = (todoToDelete) => {
    const { column, index } = todoToDelete;
    const updatedColumn = allColumns[column].filter((_, i) => i !== index);
    setAllColumns({ ...allColumns, [column]: updatedColumn });
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
            <TodoColumn title="To-Do" todos={allColumns.todo} columnName="todo" allColumns={allColumns} setAllColumns={setAllColumns} openEditModal={openEditModal} />
            <TodoColumn title="Working" todos={allColumns.working} columnName="working" allColumns={allColumns} setAllColumns={setAllColumns} openEditModal={openEditModal} />
            <TodoColumn title="Done" todos={allColumns.done} columnName="done" allColumns={allColumns} setAllColumns={setAllColumns} openEditModal={openEditModal} />
          </div>
        </div>
        <EditModal selectedTodo={selectedTodo} setSelectedTodo={setSelectedTodo} saveChanges={saveChanges} deleteTodo={deleteTodo} />
      </div>
    </DndProvider>
  );
}

export default App;
