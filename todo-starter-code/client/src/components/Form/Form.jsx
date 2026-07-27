import { useState } from "react";
import { createTask } from "../../services/TaskService";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import "./Form.css";

function Form({}) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createTask(title, deadline, isUrgent);
      toast.success("Created task successfully");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Failed to add task");
    } finally {
      // Reset form after submission
      setTitle("");
      setDeadline("");
      setIsUrgent(false);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Task Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Deadline</label>
          <br />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
          />
          <label>Is Urgent</label>
        </div>
        <button disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </>
  );
}

export default Form;
