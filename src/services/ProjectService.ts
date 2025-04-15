export interface Project {
    id: string;
    name: string;
    address: string;
    status: string;
    imageUrl: string;
    lastUpdate?: string;
    notes?: string;
}

// mock "database"
let projectsDb: Project[] = [
    {
        id: "1",
        name: "Građevina A",
        address: "Zagreb",
        status: "Aktivan",
        imageUrl: "",
        lastUpdate: "2023-04-15T10:30Z",
        notes: "Projekt započet prije 2 mjeseca...",
    },
    {
        id: "2",
        name: "Građevina B",
        address: "Split",
        status: "Završen",
        imageUrl: "",
        lastUpdate: "2023-03-22T14:20Z",
        notes: "Završni pregledi u tijeku",
    },
    {
        id: "3",
        name: "Građevina C",
        address: "Rijeka",
        status: "Na čekanju",
        imageUrl: "",
    },
    {
        id: "4",
        name: "Građevina D",
        address: "Osijek",
        status: "Aktivan",
        imageUrl: "",
        lastUpdate: "2023-05-10T09:15Z",
    },
    {
        id: "5",
        name: "Građevina E",
        address: "Varaždin",
        status: "Aktivan",
        imageUrl: "",
        lastUpdate: "2023-06-01T12:45Z",
    },
    {
        id: "6",
        name: "Građevina F",
        address: "Zadar",
        status: "Završen",
        imageUrl: "",
    },
];

export async function getProjects(): Promise<Project[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...projectsDb]);
        }, 300);
    });
}

export async function addProject(newProject: Omit<Project, "id">): Promise<Project> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!newProject.name || !newProject.address || !newProject.status) {
                reject("Molimo popunite sva obavezna polja (naziv, adresa, status)!");
                return;
            }
            const nextId = (projectsDb.length + 1).toString();
            const created: Project = {
                id: nextId,
                ...newProject,
                lastUpdate: new Date().toISOString(),
            };
            projectsDb.push(created);
            resolve(created);
        }, 300);
    });
}

export async function updateProject(
    projectId: string,
    updates: Partial<Pick<Project, "status" | "notes">>
): Promise<Project> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = projectsDb.findIndex((p) => p.id === projectId);
            if (index === -1) {
                reject("Projekt nije pronađen.");
                return;
            }

            // update the project
            const existing = projectsDb[index];
            const updated = {
                ...existing,
                ...updates,
                lastUpdate: new Date().toISOString(),
            };
            projectsDb[index] = updated;
            resolve(updated);
        }, 300);
    });
}
