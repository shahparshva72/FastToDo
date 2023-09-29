import React from "react";
import Edit from '../../assets/edit';
import Delete from '../../assets/delete';

const Card = ({
  id,
  taskName,
  taskDescription,
  isCompleted,
  dueDate,
  onEdit,
  onDelete,
  onToggleCompleted,
}) => {

  const handleEdit = () => {
    const taskToEdit = {
      id,
      taskName,
      taskDescription,
      isCompleted,
      dueDate,
    };
    onEdit(taskToEdit);
  };

  return (
    <div className="w-full md:w-64 h-auto p-4 bg-gray-900 rounded-lg shadow-2xl border-2 border-gray-700 mb-4">
      <div className="flex flex-col justify-between h-full">
        <div>
          <h3 className={`font-semibold text-lg mb-2 text-white ${isCompleted ? "line-through" : ""}`}>
            {taskName}
          </h3>
          <p className="text-gray-400">{taskDescription}</p>
          <p className="text-sm text-gray-500 mt-2">{dueDate}</p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            onClick={() => onToggleCompleted(id)}
          >
            {isCompleted ? "Uncheck" : "Check"}
          </button>
          <div className="flex space-x-2">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              onClick={handleEdit}
            >
              <Edit />
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              onClick={() => onDelete(id)}
            >
              <Delete />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
