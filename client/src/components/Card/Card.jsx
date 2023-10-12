import Edit from '../Icons/edit';
import Delete from '../Icons/delete';
import moment from "moment";
import Clock from '../Icons/clock';
import Checkbox from "../Icons/checkbox";

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

  const formattedDueDate = moment(dueDate).format('MMM Do YYYY, h:mm a');

  return (
    <div className="w-full md:w-64 h-auto p-4 bg-gray-900 rounded-lg shadow-2xl border-2 border-gray-700 mb-4">
      <div className="flex flex-col justify-between h-full">
        <div>
          <h3 className={`font-bold text-xl mb-2 text-white ${isCompleted ? "line-through" : ""}`}>
            {taskName}
          </h3>
          <p className="text-gray-400 text-base">{taskDescription}</p>
          <p className="flex items-center text-sm text-gray-500 italic mt-2">
            <Clock />
            <span className="ml-1">{formattedDueDate}</span>
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            onClick={() => onToggleCompleted(id)}
          >
            <Checkbox isCompleted={isCompleted} />
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
              onClick={onDelete}
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
