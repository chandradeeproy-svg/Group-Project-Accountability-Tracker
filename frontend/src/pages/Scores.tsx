import { useAuth } from "../auth/AuthContext";
import { useState, useEffect } from "react";
import { getProjects, getProjectMembers } from "../api/projectsApi";
import { getTasksByProject } from "../api/tasksApi";

export default function Scores() {
  const { token, user } = useAuth();
  const [projectScores, setProjectScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    
    getProjects(token).then(async (projects) => {
        const scores = await Promise.all(projects.map(async (p: any) => {
            const [tasks, members] = await Promise.all([
                getTasksByProject(p.projectid, token),
                getProjectMembers(p.projectid, token)
            ]);

            const projectMembersScores = members.map((member: any) => {
                const memberId = member.userid || member.userId;
                const memberTasks = tasks.filter((t: any) => (t.ownerid || t.ownerId) === memberId);
                const approved = memberTasks.filter((t: any) => t.status === 'APPROVED');
                const score = memberTasks.length > 0 ? Math.round((approved.length / memberTasks.length) * 100) : 0;
                
                return {
                    memberId,
                    memberName: member.name,
                    total: memberTasks.length,
                    approved: approved.length,
                    score
                };
            });

            return {
                id: p.projectid,
                name: p.name,
                members: projectMembersScores
            };
        }));
        setProjectScores(scores);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [token, user]);

  if (loading) return <div className="page-wrapper"><div className="text-center">Calculating scores...</div></div>;

  return (
    <div className="page-wrapper fade-in">
      <div style={{ marginBottom: "32px", borderBottom: "1px solid var(--color-border)", paddingBottom: "24px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "8px" }}>Accountability Scores</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem" }}>
          Performance breakdown for all members across your active projects.
        </p>
      </div>

      {projectScores.length === 0 ? (
        <div className="card text-center" style={{ borderStyle: "dashed", padding: "64px" }}>
          <p style={{ color: "var(--color-text-tertiary)" }}>You are not in any projects yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {projectScores.map(project => (
            <div key={project.id}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "20px", color: "var(--color-primary)" }}>
                {project.name}
              </h2>
              <div className="grid grid-cols-2">
                {project.members.map((m: any) => (
                  <div key={m.memberId} className="card accent-border">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                          {m.memberName}
                          {m.memberId === user?.id && <span style={{ color: "var(--color-primary)", marginLeft: "8px", fontWeight: 500 }}>(Me)</span>}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--color-text-tertiary)", marginTop: "4px" }}>
                          {m.approved} of {m.total} tasks approved
                        </div>
                      </div>
                      <div 
                        style={{ 
                          fontSize: "1.5rem", fontWeight: 800, 
                          color: m.score >= 70 ? "var(--color-success)" : m.score >= 40 ? "var(--color-warning)" : "var(--color-danger)"
                        }}
                      >
                        {m.score}%
                      </div>
                    </div>
                    
                    <div style={{ height: "10px", backgroundColor: "var(--color-bg)", borderRadius: "10px", overflow: "hidden" }}>
                      <div 
                        style={{ 
                          width: `${m.score}%`, 
                          height: "100%", 
                          backgroundColor: m.score >= 70 ? "var(--color-success)" : m.score >= 40 ? "var(--color-warning)" : "var(--color-danger)",
                          transition: 'width 0.8s ease-out'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
