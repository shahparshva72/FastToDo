import { useState, useEffect } from "react";
import Modal from "./Modal";
import TaskForm from "./TaskForm";
import Card from "./Card/Card";
import { useAuth } from "../AuthContext";
import axios from "axios";
import { set } from "mongoose";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { username } = useAuth();

  const [currentTask, setCurrentTask] = useState(null);  // Add this line

  const editTask = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setCurrentTask(taskToEdit);
    setShowModal(true);
  };


  const updateTask = (updatedTask) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error('An error occurred:', error);
    }

    setShowModal(false);
    setCurrentTask(null);  // Reset currentTask
  };

  const addTask = (newTask) => {
    // Here, you can add logic to make API calls if necessary.
    const newId = tasks.length ? Math.max(tasks.map((t) => t.id)) + 1 : 1;
    const taskToAdd = { id: newId, ...newTask };
    setTasks([...tasks, taskToAdd]);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("/tasks");
        setTasks(response.data);
      } catch (error) {
        console.error("Could not fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [tasks]);

  const toggleCompleted = async (taskId) => {
    try {
      const taskToToggle = tasks.find((task) => task.id === taskId);
      const updatedTask = {
        ...taskToToggle,
        isCompleted: !taskToToggle.isCompleted,
      };
      await axios.put(`/tasks/${taskId}`, updatedTask, {
        withCredentials: true,
      });
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? updatedTask : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Could not toggle task:", error);
    }
  }


  const [showPending, setShowPending] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  const pendingTasks = tasks.filter((task) => !task.isCompleted);
  const completedTasks = tasks.filter((task) => task.isCompleted);
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const completionRate = ((completedCount / totalTasks) * 100).toFixed(0);

  const triggerEdit = (taskId) => {
    editTask(taskId);
  };


  return (
    <div className="bg-gray-900 min-h-screen p-4">
      <div className="max-w-screen-xl mx-auto">
        <nav className="bg-indigo-400 p-4 fixed top-0 left-0 w-full z-50">
          <div className="flex justify-between items-center">
            <span className="text-white text-lg font-semibold">
              Hello, {username}
            </span>
            <button className="text-white" onClick={logout}>
              Sign Out
            </button>
          </div>
        </nav>

        <h1 className="text-3xl font-bold text-center text-indigo-400 mb-6 mt-20">
          My Tasks
        </h1>
        <button
          className="bg-indigo-500 text-white px-4 py-2 rounded mb-6"
          onClick={() => setShowModal(true)}
        >
          Add Task
        </button>

        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <TaskForm
              onCancel={() => setShowModal(false)}
              onUpdate={updateTask}
              editingTask={currentTask}
            />

          </Modal>
        )}

        <div className="text-white mb-4">
          Tasks completed: {completedCount}/{totalTasks}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>

        <div className="container mx-auto my-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
              Pending Tasks
            </h2>
            <button
              className="bg-indigo-500 text-white px-4 py-2 rounded"
              onClick={() => setShowPending(!showPending)}
            >
              {showPending ? "Collapse" : "Expand"}
            </button>
          </div>

          {showPending && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12">
              {pendingTasks.map((task) => (
                <Card
                  key={task.id}
                  onEdit={() => triggerEdit(task.id)}  // Change this line
                  taskName={task.taskName}
                  taskDescription={task.taskDescription}
                  isCompleted={task.isCompleted}
                  dueDate={task.dueDate}
                  onToggleCompleted={() => toggleCompleted(task.id)}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-12">
            <h2 className="text-2xl font-semibold text-indigo-400 mb-4">
              Completed Tasks
            </h2>
            <button
              className="bg-indigo-500 text-white px-4 py-2 rounded"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "Collapse" : "Expand"}
            </button>
          </div>

          {showCompleted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12">
              {completedTasks.map((task) => (
                <Card
                  key={task.id}
                  onEdit={() => triggerEdit(task.id)}
                  taskName={task.taskName}
                  taskDescription={task.taskDescription}
                  isCompleted={task.isCompleted}
                  dueDate={task.dueDate}
                  onToggleCompleted={() => toggleCompleted(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
