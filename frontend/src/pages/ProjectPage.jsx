import { useParams } from "react-router-dom";
export default function ProjectPage() {
    const { projectId } = useParams();
    return (<div>
      <h1>Project Page</h1>
      <p>Project ID: {projectId}</p>
    </div>);
}
