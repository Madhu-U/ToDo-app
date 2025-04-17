"use client";

import { Trash } from "lucide-react";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const Home = () => {
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [newTaskText, setNewTaskText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("api/todos");
        if (!response.ok) {
          throw new Error("HTTP error! status: " + response.status);
        }
        const data = await response.json();
        setTodos(data);
      } catch (e) {
        console.error("Faild to fetch todos: ", e);
        setError("Failed to load tasks. Please try refreshing.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(e.target.value);
  };

  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (text === "") return;
    // optimistic update.
    const optimisticId = Date.now();
    const optimisticTodo = { id: optimisticId, text, completed: false };
    setTodos((prev) => [...prev, optimisticTodo]);
    setNewTaskText("");

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("Failed to add task");

      const todoToAdd = await response.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === optimisticId ? todoToAdd : todo))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to add Task. Please try again.");
      // Rollback Optimistic Update
      setTodos((prev) => prev.filter((todo) => todo.id !== optimisticId));
    }
  };

  const handleToggleComplete = async (idToToggle: number) => {
    const currentTodo = todos.find((t) => t.id === idToToggle);
    if (!currentTodo) return;

    // optimistic update. Good UX practice
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === idToToggle ? { ...todo, completed: !todo.completed } : todo
      )
    );
    try {
      const response = await fetch(`/api/todos/${idToToggle}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentTodo.completed }),
      });
      if (!response.ok) throw new Error("Failed to toggle task");
    } catch (err) {
      console.error(err);
      setError("Failed to update task status.");
      // Rollback Optimistic Update
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === idToToggle
            ? { ...todo, completed: currentTodo.completed }
            : todo
        )
      );
    }
  };

  const handleDeleteTask = async (idToDelete: number) => {
    // optimistic update
    const originalTodos = todos;
    setTodos((prev) => prev.filter((todo) => todo.id !== idToDelete));

    try {
      const response = await fetch(`/api/todos/${idToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete task");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete task");
      // Rollback the optimistic update
      setTodos(originalTodos);
    }
  };

  return (
    <main className='flex min-h-screen flex-col items-center p-12 sm:p-24 bg-gray-200'>
      <div className='bg-white p-8 text-xl rounded-lg text-black shadow-md w-full max-w-2xl'>
        <h1 className='uppercase tracking-wider pb-4'>To-Do List</h1>
        <form
          onSubmit={handleAddTask}
          className='flex flex-col md:flex-row gap-3'
        >
          <input
            type='text'
            value={newTaskText}
            onChange={handleInputChange}
            placeholder='What needs to be done?'
            className='flex-grow p-3 border border-gray-300 rounded text-sm md:text-base'
          />
          <button
            type='submit'
            className='border border-gray-300 rounded-md p-3 cursor-pointer hover:scale-103 hover:bg-gray-100 active:scale-100 transition-all'
          >
            ADD
          </button>
        </form>
      </div>
      {isLoading && (
        <p className='text-center text-gray-500 py-4'>Loading Tasks...</p>
      )}
      {error && <p className='text-center text-red-500 py-4'>{error}</p>}
      {!isLoading && !error && (
        <ul className='flex flex-col gap-3 mt-3 w-full items-center'>
          {todos.length === 0 && !isLoading ? (
            <p className='text-center text-gray-500 py-4'>
              No tasks yet. Add one above!
            </p>
          ) : (
            todos.map((todo) => {
              return (
                <li
                  key={todo.id}
                  className='bg-white p-3 rounded-lg shadow-md w-full max-w-2xl '
                >
                  <div className='flex items-center flex-grow '>
                    <input
                      type='checkbox'
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo.id)}
                      className='mr-3 h-5 w-5 outline-none focus:ring  border-gray-300 cursor-pointer flex-shrink-0'
                    />
                    <Trash
                      className={`w-5 h-5 mr-3 text-gray-400 hover:text-black cursor-pointer hover:scale-105 active:scale-100`}
                      onClick={() => handleDeleteTask(todo.id)}
                    />
                    <span
                      className={`${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}
    </main>
  );
};

export default Home;
