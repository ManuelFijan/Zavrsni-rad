import React, { useEffect, useState } from "react";
import {
    getProjects,
    addProject,
    updateProject,
    Project
} from "../services/ProjectService";

const ProjectsPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const [newName, setNewName] = useState<string>("");
    const [newAddress, setNewAddress] = useState<string>("");
    const [newStatus, setNewStatus] = useState<string>("Aktivan");
    const [newImage, setNewImage] = useState<string>("");
    const [editProjectId, setEditProjectId] = useState<string>("");
    const [editStatus, setEditStatus] = useState<string>("Aktivan");
    const [editNotes, setEditNotes] = useState<string>("");

    // fetch projects on opening
    useEffect(() => {
        (async () => {
            try {
                const allProjects = await getProjects();
                setProjects(allProjects);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setNewName("");
        setNewAddress("");
        setNewStatus("Aktivan");
        setNewImage("");
    };

    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await addProject({
                name: newName,
                address: newAddress,
                status: newStatus,
                imageUrl: newImage,
            });
            setProjects([...projects, created]);
            closeAddModal();
            alert("Projekt uspješno dodan!");
        } catch (err: any) {
            alert(err);
        }
    };

    const openEditModal = (site: Project) => {
        setEditProjectId(site.id);
        setEditStatus(site.status);
        setEditNotes(site.notes ?? "");
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditProjectId("");
        setEditStatus("Aktivan");
        setEditNotes("");
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editProjectId) return;

        try {
            const updated = await updateProject(editProjectId, {
                status: editStatus,
                notes: editNotes,
            });
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            alert("Projekt ažuriran!");
            closeEditModal();
        } catch (err: any) {
            alert(err);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                Učitavanje...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white shadow rounded-lg p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">Popis gradilišta</h1>
                    {/* button "Add Project" */}
                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                    >
                        Dodaj projekt
                    </button>
                </div>

                {/* list of existing projects */}
                <ul role="list" className="divide-y divide-gray-200">
                    {projects.map((site) => (
                        <li key={site.id} className="flex justify-between items-center py-5">
                            {/* left side: image, name, address, notes */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={site.imageUrl || "/images/default-project.png"}
                                    alt={`Slika ${site.name}`}
                                    className="w-16 h-16 rounded-full object-cover bg-gray-50"
                                />
                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {site.name}
                                    </p>
                                    <p className="text-sm text-gray-500">{site.address}</p>
                                    {site.notes && (
                                        <p className="text-xs text-gray-700 mt-1 italic">
                                            Bilješke: {site.notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* right side: status, last update, edit button */}
                            <div className="text-right">
                                {/* small green circle if status is Aktivan */}
                                <div className="flex items-center gap-1 justify-end">
                                    {site.status === "Aktivan" && (
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                                    )}
                                    <p className="text-sm font-medium text-gray-900">
                                        {site.status}
                                    </p>
                                </div>

                                {/* show last update if it exists, otherwise nothing */}
                                {site.lastUpdate && (
                                    <p className="text-xs text-gray-500">
                                        Zadnje ažuriranje:{" "}
                                        <time dateTime={site.lastUpdate}>
                                            {new Date(site.lastUpdate).toLocaleString("hr-HR", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </time>
                                    </p>
                                )}

                                <button
                                    onClick={() => openEditModal(site)}
                                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                                >
                                    Uredi
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {isAddModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        {/* background overlay */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                        />

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

                        <div
                            className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left
                         overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle
                         sm:max-w-lg sm:w-full sm:p-6"
                        >
                            <div>
                                <div className="mt-3 sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Dodaj novi projekt
                                    </h3>
                                    <div className="mt-2">
                                        <form
                                            onSubmit={handleAddProject}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") e.preventDefault();
                                            }}
                                        >
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Naziv
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                     focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Adresa
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={newAddress}
                                                    onChange={(e) => setNewAddress(e.target.value)}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                     focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Status
                                                </label>
                                                <select
                                                    name="status"
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300
                                     shadow-sm focus:border-orange-500
                                     focus:ring-orange-500 sm:text-sm"
                                                >
                                                    <option value="Aktivan">Aktivan</option>
                                                    <option value="Na čekanju">Na čekanju</option>
                                                    <option value="Završen">Završen</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Slika (URL)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="imageUrl"
                                                    value={newImage}
                                                    onChange={(e) => setNewImage(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                     focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                                <button
                                                    type="submit"
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent
                                     shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white
                                     hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                                     focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                >
                                                    Dodaj projekt
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closeAddModal}
                                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300
                                     shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700
                                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
                                     focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                >
                                                    Odustani
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        {/* background overlay */}
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            aria-hidden="true"
                        />

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

                        <div
                            className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left
                         overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle
                         sm:max-w-lg sm:w-full sm:p-6"
                        >
                            <div>
                                <div className="mt-3 sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Uredi Projekt
                                    </h3>
                                    <div className="mt-2">
                                        <form
                                            onSubmit={handleUpdateProject}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") e.preventDefault();
                                            }}
                                        >
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Status
                                                </label>
                                                <select
                                                    value={editStatus}
                                                    onChange={(e) => setEditStatus(e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                     focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                >
                                                    <option value="Aktivan">Aktivan</option>
                                                    <option value="Na čekanju">Na čekanju</option>
                                                    <option value="Završen">Završen</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Bilješke
                                                </label>
                                                <textarea
                                                    value={editNotes}
                                                    onChange={(e) => setEditNotes(e.target.value)}
                                                    rows={3}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                                     focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                                                />
                                            </div>

                                            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                                                <button
                                                    type="submit"
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent
                                     shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white
                                     hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                                     focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                >
                                                    Spremi
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closeEditModal}
                                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300
                                     shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700
                                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2
                                     focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                >
                                                    Odustani
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
