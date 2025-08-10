"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TestData {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function TestSupabasePage() {
  const [items, setItems] = useState<TestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      if (!supabase) {
        console.error("Supabase client not configured");
        setConnectionStatus("error");
        return;
      }

      const { error } = await supabase.from("test_items").select("*").limit(1);
      if (error) {
        console.log("Table might not exist yet, but connection is working");
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("connected");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus("error");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        console.error("Supabase client not configured");
        alert("Supabase not configured. Please check environment variables.");
        setLoading(false);
        return;
      }

      const { data: fetchedItems, error } = await supabase
        .from("test_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
        alert("Error fetching data: " + error.message);
      } else {
        setItems(fetchedItems || []);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error);
    }
    setLoading(false);
  };

  const createTable = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        console.error("Supabase client not configured");
        alert("Supabase not configured. Please check environment variables.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.rpc("create_test_table");

      if (error) {
        // If RPC doesn't work, we'll show instructions to create manually
        console.error("Error creating table:", error);
        alert(
          "Please create the table manually in Supabase dashboard. See console for SQL."
        );
        console.log(`
          Please run this SQL in your Supabase SQL editor:
          
          CREATE TABLE IF NOT EXISTS test_items (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      } else {
        alert("Table created successfully!");
        fetchData();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Please create the table manually. Check console for SQL.");
    }
    setLoading(false);
  };

  const addItem = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    setLoading(true);
    try {
      if (!supabase) {
        console.error("Supabase client not configured");
        alert("Supabase not configured. Please check environment variables.");
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("test_items")
        .insert([{ name: name.trim(), description: description.trim() }]);

      if (error) {
        console.error("Error adding item:", error);
        alert("Error adding item: " + error.message);
      } else {
        setName("");
        setDescription("");
        fetchData();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error);
    }
    setLoading(false);
  };

  const deleteItem = async (id: number) => {
    setLoading(true);
    try {
      if (!supabase) {
        console.error("Supabase client not configured");
        alert("Supabase not configured. Please check environment variables.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("test_items").delete().eq("id", id);

      if (error) {
        console.error("Error deleting item:", error);
        alert("Error deleting item: " + error.message);
      } else {
        fetchData();
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>

      {/* Connection Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            />
            <span>
              {connectionStatus === "connected"
                ? "Connected to Supabase ✅"
                : connectionStatus === "error"
                ? "Connection Error ❌"
                : "Checking connection..."}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Create Table Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Create Test Table</CardTitle>
          <CardDescription>
            First, we need to create a test table in your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={createTable} disabled={loading}>
            Create Test Table
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            This will create a simple table called 'test_items' with id, name,
            description, and created_at columns.
          </p>
        </CardContent>
      </Card>

      {/* Add Data Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 2: Add Test Data</CardTitle>
          <CardDescription>
            Add some mock data to test the connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter item description"
            />
          </div>
          <Button onClick={addItem} disabled={loading}>
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Fetch Data Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 3: Fetch Data</CardTitle>
          <CardDescription>
            Retrieve data from your Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? "Loading..." : "Fetch Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Display Data */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Retrieved Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <strong>{item.name}</strong>
                    {item.description && (
                      <p className="text-gray-600">{item.description}</p>
                    )}
                    <small className="text-gray-400">
                      {new Date(item.created_at).toLocaleString()}
                    </small>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
