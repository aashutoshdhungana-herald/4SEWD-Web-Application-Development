import PageTitle from "./components/PageTitle/PageTitle";
import TaskContainer from "./components/TaskContainer/TaskContainer";
import Form from "./components/Form/Form";

function App() {
  return (
    <>
      <PageTitle />
      <TaskContainer containerTitle={"Tasks Pending Today"} />
      <Form />
    </>
  );
}

export default App;
