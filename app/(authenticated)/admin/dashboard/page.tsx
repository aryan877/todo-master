"use client";

import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useCallback } from "react";
import { TodoItem } from "@/components/TodoItem";
import { Todo } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      toast({
        title: "Success",
        description: "Todos fetched successfully.",
      });
      setTodos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch todos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleUpdateTodo = async (id: string, completed: boolean) => {
    const response = await fetch("/api/admin/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });

    if (response.ok) {
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const response = await fetch("/api/admin/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      fetchTodos();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage All Todos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">
              Loading todos...
            </p>
          ) : todos.length === 0 ? (
            <p className="text-center text-muted-foreground">
              There are no todos in the system.
            </p>
          ) : (
            <ul className="space-y-4">
              {todos.map((todo: Todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  isAdmin={true}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
