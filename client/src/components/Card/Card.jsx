import Edit from '../Icons/edit';
import Delete from '../Icons/delete';
import moment from "moment";
import Clock from '../Icons/clock';
import Checkbox from "../Icons/checkbox";
import Modal from "../Modal";
import { useState } from "react";

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

  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };


  const trimmedDescription = taskDescription.length > 30
    ? taskDescription.substring(0, 30) + "..."
    : taskDescription;


  return (
    <>
      <div className={`w-full md:w-64 h-auto p-4 bg-gray-900 rounded-lg shadow-md border-2 border-gray-800 mb-4 transition-transform duration-200 hover:scale-105`}>
        <div className="flex flex-col justify-between h-full">
          <div>
            <h3 className={`font-semibold text-xl mb-2 text-white`}>
              {taskName}
            </h3>
            <p className="text-gray-400 text-base mb-2">
              {trimmedDescription}
              {taskDescription.length > 100 && (
                <span onClick={toggleModal} className="text-blue-400 cursor-pointer">
                  Show More
                </span>
              )}

            </p>
            <p className="flex items-center text-sm text-gray-500 italic">
              <Clock />
              <span className="ml-2">{formattedDueDate}</span>
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
              onClick={() => onToggleCompleted(id)}
              aria-label="Toggle task completion"
            >
              <Checkbox isCompleted={isCompleted} />
            </button>
            <div className="flex space-x-3">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                onClick={handleEdit}
                aria-label="Edit task"
              >
                <Edit />
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                onClick={onDelete}
                aria-label="Delete task"
              >
                <Delete />
              </button>
            </div>
          </div>
        </div>
      </div>
      {isModalVisible && (
        <Modal closeFunc={toggleModal}>
          <div className="flex flex-col space-y-4 p-6 bg-gray-800 bg-opacity-90 rounded-lg">

            <h3 className={`font-semibold text-xl mb-2 text-white`}>
              {taskName}
            </h3>
            <p className="text-gray-400 text-base mb-2">
              {taskDescription}
            </p>
            <button onClick={toggleModal} className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300">
              Close
            </button>
          </div>

        </Modal>
      )}

    </>

  );
};

export default Card;

