import { Todo } from "../page";

let todos: Array<Todo> = [
  { id: 1, text: "Learn Route Handlers", completed: false },
  { id: 2, text: "Add a Database", completed: false },
];

let nextId = 3;

export const getAllTodos = (): Array<Todo> => {
  return todos;
};

export const addTodo = (text: string): Todo => {
  const newTodo: Todo = { id: nextId++, text, completed: false };
  todos.push(newTodo);
  return newTodo;
};

export const toggleTodo = (id: number): Todo | undefined => {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    return todo;
  }
  return undefined;
};

export const deletedTodo = (id: number): boolean => {
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id);
  return todos.length < initialLength;
};
