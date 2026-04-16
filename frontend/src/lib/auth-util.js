"use client";

// Simple utility to interface with localStorage for our Auth cache
export function loginUser(name, email, role, rollNumber, department) {
  if (typeof window !== "undefined") {
    const userState = {
      name: name || "User",
      email,
      role: role || "student",
      rollNumber: rollNumber || "N/A",
      department: department || "N/A"
    };
    localStorage.setItem("eventra_user", JSON.stringify(userState));
  }
}

export function getUser() {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("eventra_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.email && parsed.role) {
          return {
            name: parsed.name || "User",
            email: parsed.email,
            role: parsed.role || "student",
            rollNumber: parsed.rollNumber || "N/A",
            department: parsed.department || "N/A"
          };
        }
      }
    } catch(err) {
      console.warn("Failed to parse eventra_user from localStorage", err);
    }
  }
  return null;
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("eventra_user");
    // Backup cleanups in case old logic was used previously
    localStorage.removeItem("userMeta");
    localStorage.removeItem("eventra_demo_name");
    localStorage.removeItem("eventra_demo_email");
    localStorage.removeItem("eventra_demo_role");
    localStorage.removeItem("eventra_demo_roll");
    localStorage.removeItem("eventra_demo_dept");
    
    // Dispatch immediately so tabs and reactive components wipe cache flawlessly
    window.dispatchEvent(new Event("storage"));
  }
}
