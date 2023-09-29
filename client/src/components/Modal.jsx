import PropTypes from "prop-types";

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center">
    {children}
  </div>
);

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Modal;
