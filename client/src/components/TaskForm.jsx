import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

const TaskForm = ({ editingTask, onUpdate, onCancel }) => {
  const [taskName, setTaskName] = useState(editingTask ? editingTask.taskName : "");
  const [taskDescription, setTaskDescription] = useState(editingTask ? editingTask.taskDescription : "");
  const [dueDate, setDueDate] = useState(editingTask ? editingTask.dueDate.split("T")[0] : "");
  const [dueTime, setDueTime] = useState(editingTask ? editingTask.dueDate.split("T")[1].split(":").slice(0, 2).join(":") : "");

  const { id } = useAuth();

  useEffect(() => {
    if (editingTask) {
      setTaskName(editingTask.taskName);
      setTaskDescription(editingTask.taskDescription);
      setDueDate(editingTask.dueDate.split("T")[0]);
      setDueTime(editingTask.dueDate.split("T")[1].split(":").slice(0, 2).join(":"));
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullDueDate = `${dueDate}T${dueTime}:00.000Z`;

    let taskData = {
      taskName,
      taskDescription,
      dueDate: fullDueDate,
      isCompleted: false,
      userId: id,
    };

    if (editingTask) {
      taskData = {
        ...taskData,
        id: editingTask.id  // Add the missing id when editing
      };
    }

    console.log('Task Data to send:', taskData);  // Logging the data to be sent

    try {
      if (editingTask) {
        console.log(`Editing task. Sending PUT request to /tasks/${editingTask.id}`);
        await axios.put(`/tasks/${editingTask.id}`, taskData, {
          withCredentials: true
        });
        console.log("Task updated successfully");
        onUpdate();
      } else {
        console.log("Creating new task. Sending POST request to /tasks");
        const response = await axios.post("/tasks", null, {
          params: taskData,
          withCredentials: true
        });
        console.log("Task created successfully:", response.data);
        onCancel();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };



  return (
    <form
      className="bg-gray-800 p-6 rounded-md shadow-md max-w-md w-1/2"
      onSubmit={handleSubmit}
    >
      <h2 className="text-lg font-medium text-white mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h2>

      <div className="mb-4">
        <label className="block text-gray-300 font-medium mb-2">
          Task Name
        </label>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="bg-gray-700 text-gray-300 border border-gray-600 p-2 rounded w-full"
          placeholder="Enter task name"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-300 font-medium mb-2">
          Task Description
        </label>
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          rows="4"
          className="bg-gray-700 text-gray-300 border border-gray-600 p-2 rounded w-full"
          placeholder="Enter task description"
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="text-gray-300 font-medium mb-2">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-gray-700 text-gray-300 border border-gray-600 p-2 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="text-gray-300 font-medium mb-2">Due Time</label>
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          className="bg-gray-700 text-gray-300 border border-gray-600 p-2 rounded w-full"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={onCancel}  // Changed from props.onCancel
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          {editingTask ? 'Update Task' : 'Add Task'}
        </button>
      </div>

    </form>
  );
};

export default TaskForm;

