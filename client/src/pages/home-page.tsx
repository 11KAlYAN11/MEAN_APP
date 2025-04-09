import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Todo } from "@shared/schema";
import Header from "@/components/Header";
import AddTodoForm from "@/components/AddTodoForm";
import TodoList from "@/components/TodoList";
import EditTodoModal from "@/components/EditTodoModal";
import DeleteTodoModal from "@/components/DeleteTodoModal";

type TodoFilter = "all" | "active" | "completed";

export default function HomePage() {
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as TodoFilter);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <AddTodoForm />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 mt-8">
          <h2 className="text-xl font-medium mb-3 sm:mb-0">
            My Tasks <span className="text-sm font-normal text-gray-500">({todos.length})</span>
          </h2>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">Filter:</span>
            <select 
              className="bg-white border border-gray-300 rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <TodoList 
          todos={filteredTodos} 
          isLoading={isLoading}
          onEdit={(todo) => setEditingTodo(todo)}
          onDelete={(id) => setDeletingTodoId(id)}
        />
      </main>

      {editingTodo && (
        <EditTodoModal 
          todo={editingTodo} 
          onClose={() => setEditingTodo(null)} 
        />
      )}

      {deletingTodoId !== null && (
        <DeleteTodoModal 
          todoId={deletingTodoId} 
          onClose={() => setDeletingTodoId(null)} 
        />
      )}
    </div>
  );
}
