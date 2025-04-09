import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Todo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-red-500" },
];

const editTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
});

type EditTodoFormValues = z.infer<typeof editTodoSchema>;

interface EditTodoModalProps {
  todo: Todo;
  onClose: () => void;
}

export default function EditTodoModal({ todo, onClose }: EditTodoModalProps) {
  const form = useForm<EditTodoFormValues>({
    resolver: zodResolver(editTodoSchema),
    defaultValues: {
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority,
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async (data: EditTodoFormValues) => {
      await apiRequest("PUT", `/api/todos/${todo.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      onClose();
    },
  });

  const onSubmit = (values: EditTodoFormValues) => {
    updateTodoMutation.mutate(values);
  };

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-md w-full max-w-md p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Edit Task</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Task description" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <div className="flex space-x-4">
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      {priorityOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-1">
                          <RadioGroupItem
                            value={option.value}
                            id={`edit-priority-${option.value}`}
                            className="hidden"
                          />
                          <label
                            htmlFor={`edit-priority-${option.value}`}
                            className="flex items-center cursor-pointer"
                          >
                            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center mr-1">
                              {field.value === option.value && (
                                <span className={`w-2 h-2 rounded-full ${option.color}`} />
                              )}
                            </span>
                            <span className="text-sm">{option.label}</span>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateTodoMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {updateTodoMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
