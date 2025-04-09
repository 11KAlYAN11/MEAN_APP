import { useMutation } from "@tanstack/react-query";
import { Todo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check, Edit, Trash } from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
}

export default function TodoItem({ todo, onEdit, onDelete }: TodoItemProps) {
  const toggleMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/todos/${todo.id}`, {
        completed: !todo.completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  const handleToggle = () => {
    toggleMutation.mutate();
  };

  // Get priority color
  const getPriorityColor = () => {
    switch (todo.priority) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getPriorityText = () => {
    return todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
  };

  return (
    <div className="bg-white rounded-md p-4 shadow-sm group transition-all">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center mt-1 cursor-pointer transition-colors ${
              todo.completed
                ? "bg-primary border-primary"
                : "border-gray-400 hover:border-primary"
            }`}
          >
            {todo.completed && <Check className="h-3 w-3 text-white" />}
          </button>
        </div>
        <div className="ml-3 flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className={`text-base font-medium mb-1 ${
                  todo.completed ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.title}
              </h3>
              <p
                className={`text-sm mb-2 ${
                  todo.completed
                    ? "line-through text-gray-500"
                    : "text-gray-600"
                }`}
              >
                {todo.description}
              </p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full ${getPriorityColor()} mr-1`}></span>
                <span className="text-xs text-gray-500 mr-4">{getPriorityText()}</span>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex">
                <button
                  className="p-1 text-gray-500 hover:text-primary transition-colors mr-1"
                  onClick={() => onEdit(todo)}
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                  onClick={() => onDelete(todo.id)}
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
