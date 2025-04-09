import { Todo } from "@shared/schema";
import TodoItem from "./TodoItem";
import { ClipboardList, Loader2 } from "lucide-react";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export default function TodoList({ todos, isLoading, onEdit, onDelete }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-md p-8 shadow-sm text-center">
        <div className="text-gray-500 mb-3 flex justify-center">
          <ClipboardList className="h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">No tasks yet</h3>
        <p className="text-sm text-gray-500">Add your first task using the form above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
