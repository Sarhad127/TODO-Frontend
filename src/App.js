import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './App.css';

// Types for drag-and-drop
const ItemType = 'TODO';

// Drag-and-drop list item component
function TodoItem({ todo, index, moveTodo }) {
  const [, drag] = useDrag({
    type: ItemType,
    item: { todo, index },
  });

  return (
    <div ref={drag} className="todo-item">
      {todo}
    </div>
  );
}

// Column component for To-Do, Working, and Done
function TodoColumn({ title, todos, setTodos, moveItem }) {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item) => {
      // Remove the dragged item from its original position
      const updatedTodos = todos.filter((_, i) => i !== item.index);

      // Add the dragged item back to the column
      setTodos([...updatedTodos, item.todo]);
    },
  });

  return (
    <div ref={drop} className="todo-column">
      <h2>{title}</h2>
      <div className="todo-list">
        {todos.map((todo, index) => (
          <TodoItem key={index} index={index} todo={todo} moveTodo={moveItem} />
        ))}
      </div>
    </div>
  );
}

function App() {
  // State for the three columns
  const [todoItems, setTodoItems] = useState(['Learn React', 'Write Docs']);
  const [workingItems, setWorkingItems] = useState(['Fix Bug']);
  const [doneItems, setDoneItems] = useState([]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <h1>My To-Do App</h1>
        <div className="columns">
          <TodoColumn title="To-Do" todos={todoItems} setTodos={setTodoItems} />
          <TodoColumn title="Working" todos={workingItems} setTodos={setWorkingItems} />
          <TodoColumn title="Done" todos={doneItems} setTodos={setDoneItems} />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
