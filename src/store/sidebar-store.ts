import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  sidebarOpen: boolean; // Aliased for legacy compatibility
  toggle: () => void;
  toggleSidebar: () => void;
  setOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true,
  sidebarOpen: false,

  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      sidebarOpen: !state.sidebarOpen,
    })),

  toggleSidebar: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      sidebarOpen: !state.sidebarOpen,
    })),

  setOpen: (open: boolean) =>
    set({
      isOpen: open,
      sidebarOpen: open,
    }),

  setSidebarOpen: (open: boolean) =>
    set({
      isOpen: open,
      sidebarOpen: open,
    }),
}));
