import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getTaskById } from "../../services/TaskService";
function TaskDetail() {
  const [isLoading, setIsLoading] = useState(true);
  const [task, setTask] = useState(null);
  const { title, deadline, isUrgent } = task ?? {};
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    setIsLoading(true);
    getTaskById(id).then((task) => {
      setTask(task);
      setIsLoading(false);
    });
  }, [id]);
  return (
    <>
      {isLoading && <h2>Loading...</h2>}
      {!isLoading && (
        <div>
          <h3>Task Detail</h3>
          <div>
            <span>Title:</span>
            <span>{title}</span>
          </div>
          <div>
            <span>Deadline:</span>
            <span>{deadline}</span>
          </div>
          <div>
            <span>Is Urgent:</span>
            <span>{isUrgent ? "Yes" : "No"}</span>
          </div>
        </div>
      )}
    </>
  );
}

export default TaskDetail;
