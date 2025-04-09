import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-red-500" },
];

const addTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type AddTodoFormValues = z.infer<typeof addTodoSchema>;

export default function AddTodoForm() {
  const form = useForm<AddTodoFormValues>({
    resolver: zodResolver(addTodoSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const addTodoMutation = useMutation({
    mutationFn: async (data: AddTodoFormValues) => {
      await apiRequest("POST", "/api/todos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      form.reset({
        title: "",
        description: "",
        priority: "medium",
      });
    },
  });

  const onSubmit = (values: AddTodoFormValues) => {
    addTodoMutation.mutate(values);
  };

  return (
    <div className="bg-white rounded-md p-6 shadow-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Add a new task..."
                    className="border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    {...field}
                  />
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
                <FormControl>
                  <Input
                    placeholder="Description (optional)"
                    className="border-b border-gray-300 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="mb-4 md:mb-0">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 mr-2">Priority:</span>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      {priorityOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-1">
                          <RadioGroupItem
                            value={option.value}
                            id={`priority-${option.value}`}
                            className="hidden"
                          />
                          <Label
                            htmlFor={`priority-${option.value}`}
                            className="flex items-center cursor-pointer"
                          >
                            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center mr-1">
                              {field.value === option.value && (
                                <span className={`w-2 h-2 rounded-full ${option.color}`} />
                              )}
                            </span>
                            <span className="text-sm">{option.label}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary/90"
              disabled={addTodoMutation.isPending}
            >
              {addTodoMutation.isPending ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
