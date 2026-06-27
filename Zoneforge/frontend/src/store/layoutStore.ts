import { create } from "zustand";

interface LayoutState {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarExpanded: true,
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
}));
