import { useState } from "react";
import { createTask } from "../../services/TaskService";
import "./Form.css";

function Form({}) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTask(title, deadline, isUrgent);
    alert("Task Saved Successfully");

    // Reset form after submission
    setTitle("");
    setDeadline("");
    setIsUrgent(false);
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
        <button>Submit</button>
      </form>
    </>
  );
}

export default Form;
